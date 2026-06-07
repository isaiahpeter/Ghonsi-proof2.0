import * as cheerio from 'cheerio';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const BASE_URL      = 'https://nigerianstat.gov.ng';
const LISTING_URL   = `${BASE_URL}/elibrary`;
const HEADERS       = { 'User-Agent': 'Mozilla/5.0 (compatible; GhonsiBot/1.0)' };
const CONCURRENCY   = 5;
const CPI_KEYWORDS  = ['cpi and inflation', 'consumer price index', 'inflation report'];
const SIDEBAR_HEADINGS = new Set(['Data Release Calendar', 'Notifications', 'Highlights']);

async function fetchHTML(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.text();
}

function pLimit(tasks, limit) {
  const results = [];
  const queue = [...tasks];
  return Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, async () => {
      while (queue.length) results.push(await queue.shift()());
    })
  ).then(() => results);
}

async function fetchReportIds() {
  const html = await fetchHTML(LISTING_URL);
  const $ = cheerio.load(html);
  const ids = new Set();
  $('a[href*="/elibrary/read/"]').each((_, el) => {
    const m = ($(el).attr('href') || '').match(/\/elibrary\/read\/(\d+)/);
    if (m) {
      const id = parseInt(m[1], 10);
      if (id > 0 && id < 10000) ids.add(id);
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

async function findLatestCPIReport() {
  const allIds = await fetchReportIds();
  for (let i = 0; i < Math.min(allIds.length, 200); i += 20) {
    const batch = allIds.slice(i, i + 20);
    const results = await pLimit(batch.map(id => () => fetchTitle(id)), CONCURRENCY);
    const match = results.find(r => r.title && CPI_KEYWORDS.some(kw => r.title.toLowerCase().includes(kw)));
    if (match) {
      console.log(`[cpi] Found: ID ${match.id} — "${match.title}"`);
      return {
        id: match.id,
        title: match.title,
        url: `${BASE_URL}/elibrary/read/${match.id}`,
        downloadUrl: `${BASE_URL}/download/${match.id}`
      };
    }
    console.log(`[cpi] Batch ${i}-${i+20}: no match yet…`);
  }
  throw new Error('No CPI/Inflation report found in top 200 NBS reports');
}

function parseCPIText(text) {
  const indicators = [];
  // All Items Index – match the first float after the heading
  const headlineMatch = text.match(/All\s+Items\s+Index\s*[\s\S]*?(\d+\.?\d{1,2})\s*%?/i);
  if (headlineMatch) indicators.push({ indicator_name: 'Headline CPI', value: parseFloat(headlineMatch[1]), unit: '%' });

  const foodMatch = text.match(/Food\s+Index\s*[\s\S]*?(\d+\.?\d{1,2})\s*%?/i);
  if (foodMatch) indicators.push({ indicator_name: 'Food Inflation', value: parseFloat(foodMatch[1]), unit: '%' });

  const coreMatch = text.match(/All\s+Items\s+Less\s+Farm\s+Produce\s*[\s\S]*?(\d+\.?\d{1,2})\s*%?/i);
  if (coreMatch) indicators.push({ indicator_name: 'Core Inflation', value: parseFloat(coreMatch[1]), unit: '%' });

  const urbanMatch = text.match(/Urban\s+Inflation\s*[\s\S]*?(\d+\.?\d{1,2})\s*%?/i);
  if (urbanMatch) indicators.push({ indicator_name: 'Urban Inflation', value: parseFloat(urbanMatch[1]), unit: '%' });

  const ruralMatch = text.match(/Rural\s+Inflation\s*[\s\S]*?(\d+\.?\d{1,2})\s*%?/i);
  if (ruralMatch) indicators.push({ indicator_name: 'Rural Inflation', value: parseFloat(ruralMatch[1]), unit: '%' });

  let reportMonth = null;
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthMatch = text.match(new RegExp(`(${monthNames.join('|')})\\s+(\\d{4})`, 'i'));
  if (monthMatch) {
    const idx = monthNames.findIndex(m => m.toLowerCase() === monthMatch[1].toLowerCase());
    if (idx >= 0) reportMonth = `${monthMatch[2]}-${String(idx + 1).padStart(2, '0')}-01`;
  }

  return { indicators, reportMonth, rawText: text.substring(0, 800) };
}


export async function fetchCPIReport() {
  try {
    const report = await findLatestCPIReport();
    console.log(`[cpi] Downloading PDF from ${report.downloadUrl}`);
    const res = await fetch(report.downloadUrl, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to download PDF: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    console.log(`[cpi] PDF downloaded — ${(buffer.length / 1024).toFixed(1)} KB`);

    // Parse with pdfjs-dist
    const pdfData = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      fullText += strings.join(' ') + '\n';
    }

    const { indicators, reportMonth, rawText } = parseCPIText(fullText);
    console.log(`[cpi] Parsed ${indicators.length} indicators for ${reportMonth}`);

    return {
      source: 'NBS',
      sourceUrl: report.url,
      downloadUrl: report.downloadUrl,
      reportTitle: report.title,
      fetchedAt: new Date().toISOString(),
      reportMonth,
      indicators,
      rawSample: rawText,
    };
  } catch (err) {
    console.error('[cpi] Error:', err.message);
    return {
      source: 'NBS',
      fetchedAt: new Date().toISOString(),
      error: err.message,
      indicators: [],
    };
  }
}
