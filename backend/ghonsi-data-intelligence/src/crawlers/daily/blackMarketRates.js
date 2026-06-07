/**
 * blackMarketRates.js
 * --------------------
 * Fetches parallel (black) market exchange rates from nairatoday.com.
 * Replaces Abokifx which now requires a paid subscription.
 *
 * Source:   https://nairatoday.com
 * Cost:     Free, no login required
 * Schedule: Twice daily — morning and evening WAT (per brief)
 *
 * Extracts buy, sell, and CBN rates for USD, GBP, EUR, CAD
 * from the summary table on the homepage.
 */

import * as cheerio from "cheerio";

// ─── Constants ───────────────────────────────────────────────────────────────

const SOURCE_URL = "https://nairatoday.com";

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,*/*",
  "Accept-Language": "en-US,en;q=0.9",
};

// Maps table currency labels to ISO codes — checked against actual page text
const CURRENCY_MAP = {
  "US Dollar":       "USD",
  "British Pound":   "GBP",
  "Pound":           "GBP",
  "Euro":            "EUR",
  "Canadian Dollar": "CAD",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRate(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/[₦,\s]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseChange(raw) {
  if (!raw) return null;
  const match = raw.match(/(↑|↓)?\s*([\d.]+)%/);
  if (!match) return null;
  const value = parseFloat(match[2]);
  return match[1] === "↓" ? -value : value;
}

/**
 * Strips emoji/flag unicode from a string and looks up ISO code.
 * Falls back to substring matching against known currency names.
 */
function toISOCode(label) {
  // Strip flag sequences (pairs of regional indicator letters) and other emoji
  const clean = label
    .replace(/[\u{1F1E0}-\u{1F1FF}]{2}/gu, "")
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, "")
    .replace(/[\u{2600}-\u{27FF}]/gu, "")
    .trim();

  // Direct match
  if (CURRENCY_MAP[clean]) return CURRENCY_MAP[clean];

  // Substring match — handles cases like "🇬🇧 British Pound (GBP)"
  for (const [key, code] of Object.entries(CURRENCY_MAP)) {
    if (label.includes(key)) return code;
  }

  return null;
}

// ─── HTML Parser ──────────────────────────────────────────────────────────────

/**
 * Parses the nairatoday.com homepage HTML and extracts the rates table.
 * Table columns: Currency | Buy (₦) | Sell (₦) | CBN (₦) | Change
 *
 * @param {string} html
 * @returns {Record<string, ParallelRate>}
 */
function parseRatesTable(html) {
  const $ = cheerio.load(html);
  const rates = {};

  $("table tr").each((i, row) => {
    const cells = $(row)
      .find("td")
      .map((_, td) => $(td).text().trim())
      .get();

    if (cells.length < 4) return;

    const code = toISOCode(cells[0]);
    if (!code) return;

    const buyRate  = parseRate(cells[1]);
    const sellRate = parseRate(cells[2]);
    const cbnRate  = parseRate(cells[3]);
    const change   = parseChange(cells[4] ?? "");

    if (!buyRate && !sellRate) return;

    rates[code] = {
      currency: code,
      pair: `${code}/NGN`,
      buyRate,
      sellRate,
      cbnRate,
      changePercent: change,
      market: "parallel",
      source: "nairatoday.com",
      sourceUrl: SOURCE_URL,
    };
  });

  return rates;
}

// ─── Main Fetcher ─────────────────────────────────────────────────────────────

export async function fetchBlackMarketRates({
  retries = 3,
  retryDelay = 5000,
} = {}) {
  console.log(`[blackMarket] Fetching parallel market rates from nairatoday.com...`);

  let lastError;
  const fetchedAt = new Date();

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(SOURCE_URL, { headers: DEFAULT_HEADERS });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const rates = parseRatesTable(html);
      const count = Object.keys(rates).length;

      if (count === 0) {
        throw new Error("No rates parsed — page structure may have changed");
      }

      console.log(`[blackMarket] Done. ${count} parallel market rates retrieved.`);

      return {
        source: "nairatoday.com",
        sourceUrl: SOURCE_URL,
        market: "parallel",
        fetchedAt: fetchedAt.toISOString(),
        freshness: "today",
        rates,
      };
    } catch (err) {
      lastError = err;
      console.warn(`[blackMarket] Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) await sleep(retryDelay);
    }
  }

  throw new Error(`[blackMarket] All ${retries} attempts failed: ${lastError?.message}`);
}

// ─── Scheduled Pull ───────────────────────────────────────────────────────────

export async function runBlackMarketRatesPull() {
  console.log(`[blackMarket] Starting pull at ${new Date().toISOString()}`);
  return await fetchBlackMarketRates();
}