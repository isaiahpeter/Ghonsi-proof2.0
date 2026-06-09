/**
 * googleTrends.js
 * ---------------
 * Fetches daily trending searches in Nigeria from Google Trends RSS feed.
 * 
 * Endpoint: https://trends.google.com/trending/rss?geo=NG
 * - No API key required
 * - No session/cookie management needed
 * - Stable — RSS feeds don't break when Google redesigns internals
 * - Returns top 20 trending searches with traffic volume and related news
 *
 * Schedule: Three times daily at 8am, 1pm, 6pm WAT (per brief)
 */

import fetch from "node-fetch";
import { XMLParser } from "fast-xml-parser";

// ─── Constants ───────────────────────────────────────────────────────────────

const RSS_URL = "https://trends.google.com/trending/rss?geo=NG";

const PARSER = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Preserve ht: namespace tags (Google's custom tags for traffic, news items)
  parseTagValue: true,
  trimValues: true,
});

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely reads a value that might be a string or an object (XMLParser quirk
 * when a tag has both attributes and text content).
 */
function safeText(val) {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object") return val["#text"] ?? null;
  return String(val);
}

// ─── Core Fetcher ─────────────────────────────────────────────────────────────

/**
 * Fetches and parses the Google Trends Nigeria RSS feed.
 *
 * @param {object} options
 * @param {string} [options.geo="NG"]        - Country code
 * @param {number} [options.limit=20]        - Max trends to return
 * @param {number} [options.retries=3]       - Retry attempts on failure
 * @param {number} [options.retryDelay=5000] - Delay between retries in ms
 *
 * @returns {Promise<TrendResult>}
 */
export async function fetchDailyTrends({
  geo = "NG",
  limit = 20,
  retries = 3,
  retryDelay = 5000,
} = {}) {
  const url = `https://trends.google.com/trending/rss?geo=${geo}`;
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: DEFAULT_HEADERS,
        timeout: 15000,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const xml = await response.text();
      const parsed = PARSER.parse(xml);
      return extractTrends(parsed, { geo, limit, fetchedAt: new Date() });

    } catch (err) {
      lastError = err;
      console.warn(
        `[googleTrends] Attempt ${attempt}/${retries} failed: ${err.message}`
      );
      if (attempt < retries) {
        console.log(`[googleTrends] Retrying in ${retryDelay / 1000}s...`);
        await sleep(retryDelay);
      }
    }
  }

  throw new Error(
    `[googleTrends] All ${retries} attempts failed. Last error: ${lastError?.message}`
  );
}

// ─── Data Extractor ───────────────────────────────────────────────────────────

/**
 * Normalises raw parsed RSS XML into a clean TrendResult object.
 * Handles XMLParser's namespace quirk: "ht:approx_traffic" becomes "ht:approx_traffic"
 * but nested objects may vary — we access defensively.
 */
function extractTrends(parsed, { geo, limit, fetchedAt }) {
  const items = parsed?.rss?.channel?.item ?? [];
  const itemArray = Array.isArray(items) ? items : [items];

  const trends = itemArray.slice(0, limit).map((item, index) => {
    // News items can be a single object or array
    const rawNews = item["ht:news_item"] ?? [];
    const newsArray = Array.isArray(rawNews) ? rawNews : [rawNews];

    const articles = newsArray.map((n) => ({
      title: safeText(n["ht:news_item_title"]) ?? null,
      url: safeText(n["ht:news_item_url"]) ?? null,
      source: safeText(n["ht:news_item_source"]) ?? null,
      snippet: safeText(n["ht:news_item_snippet"]) ?? null,
      imageUrl: safeText(n["ht:news_item_picture"]) ?? null,
    }));

    const query = safeText(item.title) ?? "Unknown";
    const trafficVolume = safeText(item["ht:approx_traffic"]) ?? "N/A";

    return {
      rank: index + 1,
      query,
      trafficVolume,
      pubDate: item.pubDate ?? null,
      imageUrl: safeText(item["ht:picture"]) ?? null,
      imageSource: safeText(item["ht:picture_source"]) ?? null,
      articles,
      extracted_content: `Trending #${index + 1}: "${query}" — ${trafficVolume} searches.`,
      related_queries: null,
      key_values: JSON.stringify({
        query,
        traffic_volume: trafficVolume,
        articles_count: articles.length,
        related_queries: [],
      }),
    };
  });

  return {
    geo,
    fetchedAt: fetchedAt.toISOString(),
    freshness: "today",
    totalFetched: trends.length,
    trends,
  };
}

// ─── Scheduled Pull ───────────────────────────────────────────────────────────

/**
 * Called by scheduler/index.js three times daily: 8am, 1pm, 6pm WAT.
 * @returns {Promise<TrendResult>}
 */
export async function runDailyTrendsPull() {
  console.log(`[googleTrends] Starting pull at ${new Date().toISOString()}`);
  const result = await fetchDailyTrends({ limit: 20 });
  console.log(
    `[googleTrends] Fetched ${result.totalFetched} trends for ${result.geo}`
  );
  return result;
}

// ─── Types (JSDoc) ────────────────────────────────────────────────────────────

/**
 * @typedef {object} TrendArticle
 * @property {string|null} title
 * @property {string|null} url
 * @property {string|null} source
 * @property {string|null} snippet
 * @property {string|null} imageUrl
 */

/**
 * @typedef {object} Trend
 * @property {number}         rank
 * @property {string}         query          - The trending search term
 * @property {string}         trafficVolume  - e.g. "2000+"
 * @property {string|null}    pubDate        - When it started trending
 * @property {string|null}    imageUrl
 * @property {string|null}    imageSource
 * @property {TrendArticle[]} articles       - Related news articles
 */

/**
 * @typedef {object} TrendResult
 * @property {string}   geo
 * @property {string}   fetchedAt    - ISO 8601 timestamp
 * @property {string}   freshness    - "today"
 * @property {number}   totalFetched
 * @property {Trend[]}  trends
 */