import * as cheerio from 'cheerio';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const BASE_URL = 'https://nigerianstat.gov.ng';
const LISTING_URL = `${BASE_URL}/elibrary`;
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; GhonsiBot/1.0)' };

const CONCURRENCY = 5;

const SIDEBAR_HEADINGS = new Set(['Data Release Calendar', 'Notifications', 'Highlights']);

async function fetchHTML(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.text();
}

function pLimit(tasks, limit) {
  const queue = [...tasks];
  const results = [];
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (queue.length) {
      const next = queue.shift();
      if (!next) break;
      results.push(await next());
    }
  });
  return Promise.all(workers).then(() => results);
}

async function fetchReportIds() {
  const html = await fetchHTML(LISTING_URL);
  const $ = cheerio.load(html);

  const ids = new Set();
  $('a[href*="/elibrary/read/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const m = href.match(/\/elibrary\/read\/(\d+)/);
    if (m) {
      const id = parseInt(m[1], 10);
      if (id > 0 && id < 100000) ids.add(id);
    }
  });

  return [...ids].sort((a, b) => b - a);
}

async function fetchTitle(id) {
  try {
    const html = await fetchHTML(`${BASE_URL}/elibrary/read/${id}`);
    const $ = cheerio.load(html);

    let title = null;
    $('h2').each((_, el) => {
      if (title) return;
      const text = $(el).text().trim();
      if (text && !SIDEBAR_HEADINGS.has(text)) title = text;
    });

    return { id, title: title || '' };
  } catch {
    return { id, title: '' };
  }
}

function normalizeQuarterFromText(text) {
  // Tries to find forms like: Q1 2020 / Q2 2021 / 2020 Q3 / Quarter 4 2022
  const s = (text || '').replace(/\s+/g, ' ').trim();

  const patterns = [
    /\bQ([1-4])\s*(20\d{2})\b/i,
    /\b(20\d{2})\s*Q([1-4])\b/i,
    /\bQuarter\s*([1-4])\s*(20\d{2})\b/i,
    /\b(20\d{2})\s*Quarter\s*([1-4])\b/i,
  ];

  for (const re of patterns) {
    const m = s.match(re);
    if (!m) continue;
    const q = parseInt((m[1] || m[2]) + '', 10);
    const year = parseInt((m[2] || m[1]) + '', 10);
    if (year && q >= 1 && q <= 4) return `${year}-Q${q}`;
  }

  return null;
}

function pickBestGDPReportTitle(title) {
  const t = (title || '').toLowerCase();
  const hasGDP = t.includes('gdp');
  const hasQuarter = t.includes('quarter') || /\bq[1-4]\b/.test(t);
  if (!hasGDP || !hasQuarter) return false;
  return true;
}

async function findLatestGDPReport() {
  const allIds = await fetchReportIds();

  // Search similar to CPI: titles across newest ids.
  const maxToSearch = Math.min(allIds.length, 250);
  for (let i = 0; i < maxToSearch; i += 20) {
    const batch = allIds.slice(i, i + 20);
    const results = await pLimit(batch.map(id => () => fetchTitle(id)), CONCURRENCY);

    // Prefer titles that strongly look like GDP quarterly reports.
    const scored = results
      .filter(r => r.title && pickBestGDPReportTitle(r.title))
      .map(r => {
        const lt = r.title.toLowerCase();
        let score = 0;
        if (lt.includes('gross domestic product')) score += 5;
        if (lt.match(/report\s*q[1-4]/i)) score += 4;
        if (lt.match(/\bq[1-4]\b/i)) score += 3;
        if (lt.includes('quarter')) score += 2;
        return { ...r, score };
      })
      .sort((a, b) => b.score - a.score);

    const match = scored[0];
    if (match) {
      return {
        id: match.id,
        title: match.title,
        url: `${BASE_URL}/elibrary/read/${match.id}`,
        downloadUrl: `${BASE_URL}/download/${match.id}`,
      };
    }
  }

  throw new Error('No GDP/Quarterly report found in top NBS eLibrary items');
}

function extractAllTextFromPDF(pdf) {
  // Text extraction can be slow but follows the existing CPI approach.
  return (async () => {
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      fullText += strings.join(' ') + '\n';
    }
    return fullText;
  })();
}

function toNumberMaybe(x) {
  if (x === null || x === undefined) return null;
  const n = parseFloat(String(x).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : null;
}

function cleanSectorName(raw) {
  const s = String(raw || '')
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim();
  return s;
}

function extractSectorsFromText(fullText, { maxSectors = 10 } = {}) {
  // Best-effort extraction.
  // Heuristics: try to find repeated patterns of "Sector ... growth ... contribution".

  const sectors = [];

  // Candidate sector names (keep modest to reduce false positives)
  const sectorNames = [
    'Agriculture',
    'Manufacturing',
    'ICT',
    'Trade',
    'Transportation',
    'Information',
    'Financial',
    'Real Estate',
    'Education',
    'Health',
    'Utilities',
    'Mining',
    'Construction',
    'Power',
    'Arts',
    'Other Services',
  ];

  const sectorRegex = new RegExp(
    `(${sectorNames
      .map(s => s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'))
      .join('|')})`,
    'i'
  );

  const text = (fullText || '').replace(/\r/g, '');

  // Try to isolate a likely table-ish region
  const tableLikelyIndex = text.search(/sector|growth|contribution/i);
  const scanText = tableLikelyIndex >= 0 ? text.slice(tableLikelyIndex, tableLikelyIndex + 200000) : text.slice(0, 200000);

  // Pattern A: lines that contain sector name + at least two percentages.
  const lines = scanText.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (sectors.length >= maxSectors) break;

    const mSector = line.match(sectorRegex);
    if (!mSector) continue;

    // Extract all % numbers from the line
    const pctMatches = [...line.matchAll(/(-?\d+(?:\.\d+)?)\s*%/g)];
    const pcts = pctMatches.map(m => toNumberMaybe(m[1])).filter(v => v !== null);
    if (pcts.length < 2) continue;

    // Heuristic: first percentage = growth, second percentage = contribution.
    const sector = cleanSectorName(mSector[1]);
    const growthRate = pcts[0];
    const contributionToGDP = pcts[1];

    // Sanity check: growth rates in GDP sector tables are usually within -100..100
    if (Math.abs(growthRate) > 100) continue;
    if (Math.abs(contributionToGDP) > 100) continue;

    if (!sectors.some(s => s.sector.toLowerCase() === sector.toLowerCase())) {
      sectors.push({ sector, growthRate: +growthRate.toFixed(2), contributionToGDP: +contributionToGDP.toFixed(2) });
    }
  }

  if (sectors.length >= maxSectors) return sectors.slice(0, maxSectors);

  // Pattern B: window scanning across adjacent lines.
  // Look for sector in one line and percentages in next lines.
  for (let i = 0; i < lines.length; i++) {
    if (sectors.length >= maxSectors) break;
    const line = lines[i];
    const mSector = line.match(sectorRegex);
    if (!mSector) continue;

    const window = lines.slice(i, i + 4).join(' ');
    const pcts = [...window.matchAll(/(-?\d+(?:\.\d+)?)\s*%/g)].map(m => toNumberMaybe(m[1])).filter(v => v !== null);
    if (pcts.length < 2) continue;

    const sector = cleanSectorName(mSector[1]);
    const growthRate = pcts[0];
    const contributionToGDP = pcts[1];

    if (Math.abs(growthRate) > 100) continue;
    if (Math.abs(contributionToGDP) > 100) continue;

    if (!sectors.some(s => s.sector.toLowerCase() === sector.toLowerCase())) {
      sectors.push({ sector, growthRate: +growthRate.toFixed(2), contributionToGDP: +contributionToGDP.toFixed(2) });
    }
  }

  return sectors.slice(0, maxSectors);
}

export async function fetchGDPReports() {
  const fetchedAt = new Date().toISOString();
  try {
    const report = await findLatestGDPReport();

    const res = await fetch(report.downloadUrl, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to download PDF: ${res.status}`);

    const buffer = Buffer.from(await res.arrayBuffer());

    const pdfData = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;

    const fullText = await extractAllTextFromPDF(pdf);

    const reportQuarter =
      normalizeQuarterFromText(report.title) || normalizeQuarterFromText(fullText.slice(0, 4000)) || null;

    const sectors = extractSectorsFromText(fullText, { maxSectors: 10 });

    return {
      source: 'NBS GDP',
      reportQuarter: reportQuarter || 'unknown',
      fetchedAt,
      freshness: 'this quarter',
      sectors,
    };
  } catch (err) {
    return {
      source: 'NBS GDP',
      fetchedAt,
      freshness: 'unavailable',
      error: err?.message || String(err),
      sectors: [],
      reportQuarter: 'unknown',
    };
  }
}

