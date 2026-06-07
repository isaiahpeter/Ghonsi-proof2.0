/**
 * lifestyleTrends.js
 * ------------------
 * Extracts trending lifestyle content and brand partnership posts from BellaNaija
 * using Playwright (headless browser) because the site is dynamic.
 * Schedule: Weekly (Monday)
 */

import { chromium } from 'playwright';

export async function fetchLifestyleTrends() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US',
  });
  const page = await context.newPage();

  try {
    await page.goto('https://www.bellanaija.com', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Wait for post elements to appear (adjust selector if needed)
    await page
      .waitForSelector('article, .post, .entry, .story', { timeout: 15000 })
      .catch(() => {});

    const posts = await page.$$eval(
      'article, .post, .entry, .story, .td_module_wrap, .jeg_post, .mvp-blog-story-wrap, .mvp-post',
      (elements) =>
        elements
          .map((el) => {
            const titleEl =
              el.querySelector('h2 a, h3 a, .entry-title a') ||
              el.querySelector('h2 a, h3 a, a[href]');
            if (!titleEl) return null;

            const title = titleEl.textContent?.trim();
            const url = titleEl.getAttribute('href');
            if (!title || !url) return null;

            const categoryEl =
              el.querySelector('.category, .cat-links, .td-post-category') ||
              el.querySelector('a[rel="category tag"], .entry-category');
            const category = categoryEl ? categoryEl.textContent.trim() : '';

            // Brand tags from common Nigerian brands in title
            const brandList = [
              'MTN',
              'GLO',
              'AIRTEL',
              '9MOBILE',
              'DANGOTE',
              'COCA-COLA',
              'PEPSI',
              'NESTLÉ',
              'INDOMIE',
              'ZENITH',
              'GTBANK',
              'FIRST BANK',
              'UBA',
              'ACCESS BANK',
              'PAYSTACK',
              'FLUTTERWAVE',
              'OPAY',
              'PALMPAY',
              'JUMIA',
              'KONGA',
            ];

            const brandTags = brandList.filter((b) =>
              title.toLowerCase().includes(b.toLowerCase())
            );

            return { title, url, category, brandTags };
          })
          .filter(Boolean)
    );

    return {
      fetchedAt: new Date().toISOString(),
      freshness: 'this week',
      totalPosts: posts.length,
      posts,
    };
  } finally {
    await context.close();
    await browser.close();
  }
}

