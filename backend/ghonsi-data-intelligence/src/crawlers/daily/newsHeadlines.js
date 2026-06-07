/**
 * newsHeadlines.js
 * ----------------
 * Fetches Nigerian business and tech news headlines via RSS feeds.
 *
 * Sources (all free, no paywall):
 *   - Techpoint Africa   https://techpoint.africa/feed
 *   - Premium Times      https://www.premiumtimesng.com/feed
 *   - BusinessDay        https://businessday.ng/feed
 *   - Nairametrics       https://nairametrics.com/feed
 *   - TechCabal          https://techcabal.com/feed  (may fail on some networks)
 *   - Punch              https://punchng.com/feed
 *   - Guardian Nigeria   https://guardian.ng/feed
 *
 * Note: The Cable (403) and TechCabal (DNS issues on some networks) have
 * known reliability problems. Punch and Guardian Nigeria added as replacements.
 *
 * Schedule: Once daily at 7am WAT (per brief)
 */

import { XMLParser } from "fast-xml-parser";

// ─── Constants ───────────────────────────────────────────────────────────────

const RSS_SOURCES = [
  {
    name: "Techpoint Africa",
    url: "https://techpoint.africa/feed",
    category: "tech",
  },
  {
    name: "TechCabal",
    url: "https://techcabal.com/feed",
    category: "tech",
  },
  {
    name: "Premium Times",
    url: "https://www.premiumtimesng.com/feed",
    category: "news",
  },
  {
    name: "Punch",
    url: "https://punchng.com/feed",
    category: "news",
  },
  {
    name: "Guardian Nigeria",
    url: "https://guardian.ng/feed",
    category: "news",
  },
  {
    name: "BusinessDay",
    url: "https://businessday.ng/feed",
    category: "business",
  },
  {
    name: "Nairametrics",
    url: "https://nairametrics.com/feed",
    category: "business",
  },
];

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
};

const PARSER = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: true,
  trimValues: true,
});

const HEADLINES_PER_SOURCE = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stripHtml(str) {
  if (!str || typeof str !== "string") return null;
  return str.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() || null;
}

function safeText(val) {
  if (!val) return null;
  if (typeof val === "string") return val.trim();
  if (typeof val === "object") return (val["#text"] ?? "").trim();
  return String(val).trim();
}

// ─── Single Source Fetcher ────────────────────────────────────────────────────

async function fetchRSSFeed(source, limit = HEADLINES_PER_SOURCE) {
  const response = await fetch(source.url, {
    headers: DEFAULT_HEADERS,
    signal: AbortSignal.timeout(20000), // 20s timeout per feed
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const parsed = PARSER.parse(xml);

  const items =
    parsed?.rss?.channel?.item ??
    parsed?.feed?.entry ??
    [];

  const itemArray = Array.isArray(items) ? items : [items];

  return itemArray.slice(0, limit).map((item) => {
    const link =
      safeText(item.link) ??
      item.link?.["@_href"] ??
      null;

    const rawSummary =
      safeText(item.description) ??
      safeText(item.summary) ??
      safeText(item["content:encoded"]) ??
      null;

    return {
      title: stripHtml(safeText(item.title)),
      url: link,
      summary: rawSummary ? stripHtml(rawSummary)?.slice(0, 300) : null,
      publishedAt: safeText(item.pubDate ?? item.published ?? item.updated) ?? null,
      source: source.name,
      category: source.category,
    };
  }).filter((h) => h.title);
}

// ─── Main Fetcher ─────────────────────────────────────────────────────────────

/**
 * Fetches headlines from all RSS sources concurrently.
 * Failed sources are skipped — one bad feed won't block others.
 *
 * @param {object}   [options]
 * @param {object[]} [options.sources]
 * @param {number}   [options.headlinesPerSource]
 * @returns {Promise<NewsResult>}
 */
export async function fetchNewsHeadlines({
  sources = RSS_SOURCES,
  headlinesPerSource = HEADLINES_PER_SOURCE,
} = {}) {
  console.log(`[newsHeadlines] Fetching from ${sources.length} RSS sources...`);

  const fetchedAt = new Date();

  const results = await Promise.allSettled(
    sources.map((source) => fetchRSSFeed(source, headlinesPerSource))
  );

  const bySource = {};
  let totalHeadlines = 0;
  let failedSources = 0;

  results.forEach((result, i) => {
    const source = sources[i];
    if (result.status === "fulfilled") {
      bySource[source.name] = {
        category: source.category,
        feedUrl: source.url,
        headlines: result.value,
        count: result.value.length,
        status: "ok",
      };
      totalHeadlines += result.value.length;
      console.log(`[newsHeadlines] ✓ ${source.name}: ${result.value.length} headlines`);
    } else {
      bySource[source.name] = {
        category: source.category,
        feedUrl: source.url,
        headlines: [],
        count: 0,
        status: "error",
        error: result.reason?.message,
      };
      failedSources++;
      console.warn(`[newsHeadlines] ✗ ${source.name}: ${result.reason?.message}`);
    }
  });

  console.log(
    `[newsHeadlines] Done. ${totalHeadlines} headlines from ` +
    `${sources.length - failedSources}/${sources.length} sources.`
  );

  const allHeadlines = Object.values(bySource)
    .flatMap((s) => s.headlines)
    .sort((a, b) => {
      const da = a.publishedAt ? new Date(a.publishedAt) : 0;
      const db = b.publishedAt ? new Date(b.publishedAt) : 0;
      return db - da;
    });

  return {
    fetchedAt: fetchedAt.toISOString(),
    freshness: "today",
    totalHeadlines,
    failedSources,
    bySource,
    allHeadlines,
  };
}

// ─── Scheduled Pull ───────────────────────────────────────────────────────────

export async function runNewsHeadlinesPull() {
  console.log(`[newsHeadlines] Starting pull at ${new Date().toISOString()}`);
  return await fetchNewsHeadlines();
}