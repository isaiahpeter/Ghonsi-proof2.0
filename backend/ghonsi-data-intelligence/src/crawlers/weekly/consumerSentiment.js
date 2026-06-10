
/**
 * consumerSentiment.js
 * --------------------
 * Scrapes Nairaland's top threads (business, adverts, phones) using Playwright.
 * Threads are kept in Nairaland's natural order (most recent first).
 * No re-sorting by reply count — that was pulling old high-engagement threads
 * to the top instead of fresh 2026 content.
 */

import { chromium } from 'playwright';

// --- CONFIGURATION ---
const CONFIG = {
  baseUrl: 'https://www.nairaland.com',
  sections: ['business', 'adverts', 'phones'],
  threadsPerSection: 50,
  pagesToScrape: 2, // page 1 = /business (today), page 2 = /business/1 (yesterday-ish)
};

const BRANDS = [
  'MTN', 'GLO', 'AIRTEL', '9MOBILE', 'DANGOTE', 'COCA-COLA', 'PEPSI', 'NESTLÉ',
  'INDOMIE', 'ZENITH', 'GTBANK', 'FIRST BANK', 'UBA', 'ACCESS BANK', 'PAYSTACK',
  'FLUTTERWAVE', 'OPAY', 'PALMPAY', 'PIGGYVEST', 'JUMIA', 'KONGA', 'SLOT', 'SPAR',
  'SHOPRITE', 'MOBOFREE', 'TOYOTA', 'HONDA', 'SAMSUNG', 'TECNO', 'INFINIX',
  'NNPC', 'BET9JA', 'SPORTYBET', 'NOVUS', 'LAGOS', 'ABUJA', 'PORT HARCOURT'
];

const POSITIVE_WORDS = [
  'good', 'great', 'best', 'excellent', 'recommend', 'legit',
  'quality', 'fast', 'amazing', 'nice', 'original', 'genuine'
];

const NEGATIVE_WORDS = [
  'bad', 'scam', 'fake', 'avoid', 'poor', 'terrible', 'fraud',
  'useless', 'waste', 'slow', 'disappointed', 'failed'
];

// --- HELPER FUNCTIONS ---

function extractBrands(title) {
  const extracted = [];
  for (const brand of BRANDS) {
    const regex = new RegExp(`\\b${brand}\\b`, 'i');
    if (regex.test(title)) extracted.push(brand);
  }
  return extracted;
}

function getSentiment(title) {
  const posRegex = new RegExp(`\\b(${POSITIVE_WORDS.join('|')})\\b`, 'i');
  const negRegex = new RegExp(`\\b(${NEGATIVE_WORDS.join('|')})\\b`, 'i');
  const hasPos = posRegex.test(title);
  const hasNeg = negRegex.test(title);
  if (hasPos && !hasNeg) return 'positive';
  if (hasNeg && !hasPos) return 'negative';
  return 'neutral';
}

/**
 * Nairaland URL scheme:
 *   Page 1 (newest) → /business
 *   Page 2          → /business/1
 *   Page 3          → /business/2
 * Lower numbers = more recent activity.
 */
function buildNairalandUrl(section, pageNumber) {
  if (pageNumber === 1) return `${CONFIG.baseUrl}/${section}`;
  return `${CONFIG.baseUrl}/${section}/${pageNumber - 1}`;
}

// --- CORE SCRAPER LOGIC ---

async function fetchSection(context, section) {
  const threads = [];
  const seenUrls = new Set();

  for (let page = 1; page <= CONFIG.pagesToScrape; page++) {
    const url = buildNairalandUrl(section, page);
    console.log(`[nairaland] Loading ${url}`);

    const pageInstance = await context.newPage();

    await pageInstance.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      window.chrome = { runtime: {} };
    });

    try {
      await pageInstance.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      const newThreads = await pageInstance.$$eval('a[href]', (anchors) => {
        const threadHrefRe = /^\/\d+\/[a-z0-9-]+/i;

        return anchors
          .filter(a => threadHrefRe.test(a.getAttribute('href') || ''))
          .map(a => {
            const href = a.getAttribute('href');
            const title = a.textContent.trim();

            const row = a.closest('tr');
            let replyCount = 0;
            let lastActivity = null;

            if (row) {
              const cells = Array.from(row.querySelectorAll('td'));
              for (const cell of cells) {
                const raw = cell.textContent.replace(/,/g, '').trim();

                // Reply/view count: "1234/56789"
                const countMatch = raw.match(/^(\d+)\s*\/\s*\d+$/);
                if (countMatch) {
                  replyCount = parseInt(countMatch[1], 10);
                }

                // Last activity timestamp: Nairaland renders relative times like
                // "Jun 7" / "Jun 7, 2025" / "11:34am" in the last cell
                if (/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/.test(raw)) {
                  lastActivity = raw;
                }
              }
            }

            return { href, title, replyCount, lastActivity };
          })
          .filter(t => t.title && t.title.length > 5);
      });

      for (const t of newThreads) {
        if (/^(business|adverts|phones|nairaland|forum|search)$/i.test(t.title)) continue;

        const fullUrl = t.href.startsWith('http')
          ? t.href
          : `${CONFIG.baseUrl}${t.href}`;

        if (!seenUrls.has(fullUrl)) {
          seenUrls.add(fullUrl);
          threads.push({
            title: t.title,
            url: fullUrl,
            replyCount: t.replyCount,
            lastActivity: t.lastActivity,
            section,
          });
        }
      }

      console.log(`[nairaland] ${section} page ${page} — ${threads.length} threads so far.`);
    } catch (err) {
      console.error(`[nairaland] Error on ${section} page ${page}:`, err.message);
    } finally {
      await pageInstance.close();
    }

    await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));
  }

  // ── KEY CHANGE ──────────────────────────────────────────────────────────────
  // Do NOT sort by replyCount — that lifts old viral threads above fresh ones.
  // Nairaland already serves threads sorted by most-recent-activity first.
  // Just deduplicate and take the top N in arrival order.
  // ────────────────────────────────────────────────────────────────────────────
  return threads.slice(0, CONFIG.threadsPerSection);
}

export async function fetchConsumerSentiment() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US',
    viewport: { width: 1366, height: 768 },
  });

  const results = [];

  try {
    for (const section of CONFIG.sections) {
      const threads = await fetchSection(context, section);
      console.log(`[nairaland] ${section}: ${threads.length} top threads retained.`);

      threads.forEach(t => {
        results.push({
          ...t,
          brandMentions: extractBrands(t.title),
          productMentions: [],
          sentiment: getSentiment(t.title),
        });
      });

      await new Promise(r => setTimeout(r, 2000));
    }
  } finally {
    await context.close();
    await browser.close();
  }

  return {
    fetchedAt: new Date().toISOString(),
    freshness: 'recent',
    totalThreads: results.length,
    threads: results,
  };
}