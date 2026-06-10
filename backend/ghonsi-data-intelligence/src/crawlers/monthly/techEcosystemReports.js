import * as cheerio from 'cheerio';

const CATEGORY_URL = 'https://techcabal.com/category/reports';
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; GhonsiBot/1.0)' };

function absoluteUrl(url) {
  if (!url) return null;
  try {
    return new URL(url, CATEGORY_URL).toString();
  } catch {
    return null;
  }
}

function cleanText(s) {
  if (!s) return null;
  const out = String(s)
    .replace(/\s+/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
  return out || null;
}

function normalizeUrl(u) {
  if (!u) return null;
  return u.split('#')[0].replace(/\/$/, '');
}

function looksPaywalled({ titleText, excerptText, cardText, href } = {}) {
  const hay = `${titleText || ''} ${excerptText || ''} ${cardText || ''} ${href || ''}`.toLowerCase();

  // Common indicators (best-effort heuristics)
  const indicators = [
    'premium',
    'paid',
    'lock',
    'locked',
    'subscribe',
    'subscription',
    'member',
    'members only',
    'members-only',
  ];

  return indicators.some((k) => hay.includes(k));
}

function extractCardData($, el) {
  const $el = $(el);

  // Title + URL
  const a = $el.find('h2 a').first().length
    ? $el.find('h2 a').first()
    : $el.find('a').first();

  const title = cleanText(a.text());
  const href = normalizeUrl(absoluteUrl(a.attr('href')));

  // Summary/excerpt
  const summary =
    cleanText($el.find('.excerpt').first().text()) ||
    cleanText($el.find('.summary').first().text()) ||
    cleanText($el.find('.entry-summary').first().text()) ||
    cleanText($el.find('p').first().text()) ||
    null;

  const cardText = cleanText($el.text());

  const free = !looksPaywalled({ titleText: title, excerptText: summary, cardText, href });

  return {
    title: title || '',
    summary: summary || null,
    url: href,
    free,
  };
}

async function fetchHTML(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.text();
}

export async function fetchTechEcosystemReports({ limit = 10 } = {}) {
  const startedAt = new Date().toISOString();

  try {
    const html = await fetchHTML(CATEGORY_URL);
    const $ = cheerio.load(html);

    // Identify article cards.
    // TechCabal uses <article> blocks in many themes; keep broad selectors.
    const cardSelectors = ['article', '.post-item', '.post', '.type-post', '.loop-item'];

    let cards = [];
    for (const sel of cardSelectors) {
      const found = $(sel).toArray();
      if (found.length) {
        cards = found;
        break;
      }
    }

    // Fallback: anchors inside the page
    if (!cards.length) {
      cards = $('h2 a[href]').map((_, a) => $(a).closest('article')[0] || a).toArray();
    }

    const seen = new Set();
    const extracted = [];

    for (const el of cards) {
      const item = extractCardData($, el);
      if (!item.url || !item.title) continue;

      if (seen.has(item.url)) continue;
      seen.add(item.url);

      // Only free reports are returned.
      if (item.free) {
        extracted.push(item);
      }

      if (extracted.length >= limit) break;
    }

    return {
      source: 'TechCabal (Reports category - free only)',
      fetchedAt: startedAt,
      freshness: 'monthly',
      reports: extracted.slice(0, limit),
    };
  } catch (err) {
    return {
      source: 'TechCabal (Reports category - free only)',
      fetchedAt: startedAt,
      freshness: 'unavailable',
      error: err?.message || String(err),
      reports: [],
    };
  }
}

