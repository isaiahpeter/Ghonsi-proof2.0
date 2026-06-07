/**
 * selfHealingScraper.js
 * ---------------------
 * Adaptive scraping system (stable version):
 * RSS → HTML → Playwright fallback
 */

import Parser from "rss-parser";
import * as cheerio from "cheerio";
import { chromium } from "playwright";

/* ------------------ CONFIG ------------------ */

const SOURCES = [
  {
    name: "NAFDAC",
    url: "https://nafdac.gov.ng/news-and-media",
    rss: "https://nafdac.gov.ng/feed/",
    selectors: {
      items: "article, .post, .news-item, .entry",
      title: "h2 a, h3 a, .entry-title a",
    },
  },
  {
    name: "FCCPC",
    url: "https://fccpc.gov.ng/resources-library/publications/",
    rss: null,
    selectors: {
      items: ".publication, article, .post",
      title: "h2 a, h3 a, .title a",
    },
  },
];

const parser = new Parser();
function normalize({ source, method, items, error }) {
  return {
    source,
    method,
    success: Array.isArray(items) && items.length > 0,
    items: Array.isArray(items) ? items : [],  // 🔥 CRITICAL FIX
    error: error || null,
  };
}

function isValid(result) {
  if (!result?.items) return false;

  const good = result.items.filter(
    i => i.title && i.title.length > 5
  );

  return good.length >= 5;
}

function dedupe(items) {
  const map = new Map();
  for (const i of items) map.set(i.url, i);
  return [...map.values()];
}

/* ------------------ 1. RSS ------------------ */

async function tryRSS(source) {
  if (!source.rss) throw new Error("No RSS");

  const feed = await parser.parseURL(source.rss);

  const items = feed.items.map(i => ({
    title: i.title,
    url: i.link,
    publishedAt: i.pubDate,
  }));

  return normalize({
    source: source.name,
    method: "rss",
    items,
  });
}

/* ------------------ 2. HTML (Cheerio) ------------------ */

async function tryHTML(source) {
  const res = await fetch(source.url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  const html = await res.text();
  const $ = cheerio.load(html);

  const items = [];

  $(source.selectors.items).each((_, el) => {
    const a = $(el)
      .find(source.selectors.title)
      .first();

    const title = a.text().trim();
    const href = a.attr("href");

    if (!title || !href) return;

    items.push({
      title,
      url: new URL(href, source.url).href,
    });
  });

  return normalize({
    source: source.name,
    method: "html",
    items,
  });
}

/* ------------------ 3. PLAYWRIGHT (fallback) ------------------ */

async function tryPlaywright(source) {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.goto(source.url, {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("a", {
      timeout: 15000,
    });

    const items = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll("a[href]")
      )
        .map(a => ({
          title: a.textContent.trim(),
          url: a.href,
        }))
        .filter(i => i.title.length > 6);
    });

    return normalize({
      source: source.name,
      method: "playwright",
      items,
    });
  } finally {
    await browser.close();
  }
}

/* ------------------ ORCHESTRATOR ------------------ */

async function scrapeSource(source) {
  const pipeline = [
    tryRSS,
    tryHTML,
    tryPlaywright,
  ];

  let last = null;

  for (const fn of pipeline) {
    try {
      const result = await fn(source);

      if (isValid(result)) {
        return result;
      }

      last = result;
    } catch (err) {
      last = {
        source: source.name,
        method: fn.name,
        items: [],
        error: err.message,
      };
    }
  }

  return {
    source: source.name,
    method: "failed",
    success: false,
    items: [],
    error: last?.error || "All strategies failed",
  };
}

/* ------------------ MAIN EXPORT ------------------ */

export async function runScraper() {
  const results = [];

  for (const source of SOURCES) {
    const result = await scrapeSource(source);

    console.log(
      `[${result.method}] ${source.name}: ${result.items.length}`
    );

    results.push(result);
  }

  const allItems = dedupe(
  results.flatMap(r => Array.isArray(r.items) ? r.items : [])
  );
console.log(
  "[debug] result shapes:",
  results.map(r => ({
    source: r.source,
    method: r.method,
    itemsType: typeof r.items,
    isArray: Array.isArray(r.items),
  }))
);
  return {
    fetchedAt: new Date().toISOString(),
    totalSources: results.length,
    totalItems: allItems.length,
    sources: results,
    items: allItems,
  };
}

/* ------------------ BACKWARD COMPAT (IMPORTANT) ------------------ */
/**
 * If your scheduler still expects:
 * fetchConsumerSentiment()
 * we expose it here safely.
 */

export async function fetchConsumerSentiment() {
  return runScraper();
}