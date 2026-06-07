/**
 * nbsReports.js
 * -------------
 * Crawls the NBS (National Bureau of Statistics) elibrary
 * for the latest statistical reports and publications.
 *
 * Strategy:
 *  1. Fetch listing page → extract real report IDs (sequential, < 10000)
 *  2. Take the top N IDs (highest = most recent)
 *  3. Fetch each detail page in parallel (concurrency capped)
 *  4. Title = first h2 that isn't a known sidebar/nav heading
 *  5. Download URL = /download/{id} (predictable, confirmed)
 */

import * as cheerio from 'cheerio';

const BASE_URL   = 'https://nigerianstat.gov.ng';
const LISTING_URL = `${BASE_URL}/elibrary`;
const CONCURRENCY = 5;

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; GhonsiBot/1.0)' };

// These h2s appear on every page as site chrome — skip them
const SIDEBAR_HEADINGS = new Set([
  'Data Release Calendar',
  'Notifications',
  'Highlights',
]);

/* ------------------ HELPERS ------------------ */

async function fetchHTML(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.text();
}

async function pLimit(tasks, limit) {
  const results = [];
  const queue = [...tasks];

  async function worker() {
    while (queue.length > 0) {
      const task = queue.shift();
      results.push(await task());
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, worker)
  );
  return results;
}

/* ------------------ STEP 1: GET REAL IDs ------------------ */

async function fetchReportIds() {
  const html = await fetchHTML(LISTING_URL);
  const $ = cheerio.load(html);

  const ids = new Set();

  $('a[href*="/elibrary/read/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const match = href.match(/\/elibrary\/read\/(\d+)/);
    if (match) {
      const id = parseInt(match[1], 10);
      // Real NBS report IDs are sequential integers < 10000.
      // The listing page also generates JS-driven phantom IDs in the millions — exclude those.
      if (id > 0 && id < 10000) ids.add(id);
    }
  });

  // Descending: highest ID = most recently published
  return [...ids].sort((a, b) => b - a);
}

/* ------------------ STEP 2: GET DETAIL ------------------ */

async function fetchReportDetail(id) {
  const url = `${BASE_URL}/elibrary/read/${id}`;

  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    // Title: first h2 that isn't a known sidebar heading
    let title = null;
    $('h2').each((_, el) => {
      if (title) return; // already found
      const text = $(el).text().trim();
      if (text && !SIDEBAR_HEADINGS.has(text)) {
        title = text;
      }
    });

    title = title || `NBS Report #${id}`;

    return {
      id,
      title,
      url,
      downloadUrl: `${BASE_URL}/download/${id}`,
      publishedAt: null, // NBS detail pages don't expose a date in the HTML
    };
  } catch (err) {
    console.warn(`[nbs] Failed to fetch detail for ID ${id}: ${err.message}`);
    return {
      id,
      title: null,
      url,
      downloadUrl: `${BASE_URL}/download/${id}`,
      publishedAt: null,
      error: err.message,
    };
  }
}

/* ------------------ MAIN EXPORT ------------------ */

export async function fetchNBSReports({ limit = 20 } = {}) {
  console.log(`[nbs] Fetching report listing…`);

  const allIds = await fetchReportIds();
  const topIds = allIds.slice(0, limit);

  console.log(`[nbs] Found ${allIds.length} real IDs (max: ${allIds[0]}), fetching top ${topIds.length}`);

  const tasks = topIds.map(id => () => fetchReportDetail(id));
  const reports = await pLimit(tasks, CONCURRENCY);

  const successful = reports.filter(r => !r.error);
  console.log(`[nbs] Done — ${successful.length}/${topIds.length} fetched successfully`);

  return {
    fetchedAt: new Date().toISOString(),
    source: 'nbs',
    totalFetched: successful.length,
    reports: successful,
  };
}