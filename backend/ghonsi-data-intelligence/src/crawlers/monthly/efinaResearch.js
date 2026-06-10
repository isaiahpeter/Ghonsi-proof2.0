import * as cheerio from 'cheerio';

const PUBLICATIONS_URL = 'https://efina.org.ng/publication';
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; GhonsiBot/1.0)' };

function absoluteUrl(url) {
  if (!url) return null;
  try {
    return new URL(url, PUBLICATIONS_URL).toString();
  } catch {
    return null;
  }
}

function uniqBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const k = keyFn(item);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

async function fetchHTML(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.text();
}

function parsePublicationDate($, $root) {
  // Try common patterns: <time datetime>, meta tags, text patterns.
  const dt =
    $root.find('time[datetime]').attr('datetime') ||
    $root.find('meta[property="article:published_time"]').attr('content') ||
    $root.find('meta[name="published"], meta[name="publish-date"]').attr('content') ||
    $root.find('meta[name="date"], meta[name="publication_date"]').attr('content');

  if (dt) {
    const parsed = new Date(dt);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  // Fallback: look for a nearby "date" string
  const text = ($root.text() || '').replace(/\s+/g, ' ').trim();
  // e.g. "Published: 12 January 2024" or "Date: 12 Jan 2024"
  const m = text.match(/(?:Published|Publication Date|Date)\s*[:\-]?\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i);
  if (m) {
    const parsed = new Date(m[1]);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  return null;
}

function extractSummary($, $root) {
  // Prefer meta description
  const meta =
    $root.find('meta[name="description"]').attr('content') ||
    $root.find('meta[property="og:description"]').attr('content');
  if (meta) return meta.trim();

  // Then common content blocks (first paragraph)
  const p =
    $root.find('article p').first().text().trim() ||
    $root.find('p').first().text().trim();

  return p || null;
}

function extractDownloadUrl($, $root) {
  // 1) Direct PDF links
  const pdfLink =
    $root.find('a[href$=".pdf"], a[href*=".pdf?"], a[href*="download"], a[href*="PDF"]').
      filter((_, el) => {
        const href = $root.find(el).attr('href') || '';
        return /\.pdf(\b|\?|#|$)/i.test(href) || /download.*\.pdf/i.test(href);
      }).
      first().attr('href');

  const absPdf = absoluteUrl(pdfLink);
  if (absPdf) return absPdf;

  // 2) iFrame/object/embed containing pdf
  const iframeSrc =
    $root.find('iframe[src]').attr('src') ||
    $root.find('embed[src]').attr('src') ||
    $root.find('object[data]').attr('data');

  if (iframeSrc && /\.pdf(\b|\?|#|$)/i.test(iframeSrc)) return absoluteUrl(iframeSrc);

  return null;
}

async function fetchPublicationLinks() {
  const html = await fetchHTML(PUBLICATIONS_URL);
  const $ = cheerio.load(html);

  const links = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    // Look for paths containing /publication/ or /publications/
    const isPublicationPath = /\/publication\//i.test(href) || /\/publications\//i.test(href);
    const abs = absoluteUrl(href);
    if (isPublicationPath && abs) links.push(abs);
  });

  // De-dup + keep only likely detail pages (avoid direct pdf links)
  const filtered = uniqBy(
    links.filter((u) => u && !/\.pdf(\b|\?|#|$)/i.test(u)),
    (u) => u
  );

  return filtered;
}

function guessTitle($, $root) {
  const title =
    $root.find('h1').first().text().trim() ||
    $root.find('h2').first().text().trim();
  return title || null;
}

async function fetchSingleReport(url) {
  const html = await fetchHTML(url);
  const $ = cheerio.load(html);
  const $root = $.root();

  const title = guessTitle($, $root);
  const publicationDate = parsePublicationDate($, $root);
  const summary = extractSummary($, $root);
  const downloadUrl = extractDownloadUrl($, $root);

  return {
    title: title || '',
    publicationDate, // ISO string or null
    downloadUrl, // absolute URL or null
    summary: summary || null,
    sourceUrl: url,
  };
}

function pLimit(tasks, limit) {
  const queue = [...tasks];
  const results = [];

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (queue.length) {
      const task = queue.shift();
      // eslint-disable-next-line no-await-in-loop
      results.push(await task());
    }
  });

  return Promise.all(workers).then(() => results);
}

export async function fetchEFInAResearch({ limit = 5 } = {}) {
  const startedAt = new Date().toISOString();

  try {
    const publicationLinks = await fetchPublicationLinks();

    // Fetch details for more than requested, then sort by parsed date.
    const detailsCandidates = publicationLinks.slice(0, 25);

    const CONCURRENCY = 5;
    const details = await pLimit(
      detailsCandidates.map((url) => async () => {
        try {
          return await fetchSingleReport(url);
        } catch {
          return null;
        }
      }),
      CONCURRENCY
    );

    const reports = details
      .filter(Boolean)
      .map((r) => ({
        ...r,
        // Keep both original and a comparable timestamp (if date parse succeeded)
        _ts: r.publicationDate ? new Date(r.publicationDate).getTime() : -Infinity,
      }))
      .sort((a, b) => b._ts - a._ts)
      .slice(0, limit)
      .map(({ _ts, ...rest }) => rest);

    return {
      source: 'EFInA Research',
      fetchedAt: startedAt,
      freshness: 'monthly',
      reports,
    };
  } catch (err) {
    return {
      source: 'EFInA Research',
      fetchedAt: startedAt,
      freshness: 'unavailable',
      error: err?.message || String(err),
      reports: [],
    };
  }
}

