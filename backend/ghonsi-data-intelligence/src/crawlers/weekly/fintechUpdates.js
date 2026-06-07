/**
 * fintechUpdates.js
 *
 * Weekly fintech updates:
 * - Paystack Blog
 * - Flutterwave Blog
 * - NCC Publications
 */

import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

function isRecent(dateString) {
  if (!dateString) return true;

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return true;
  }

  return Date.now() - date.getTime() <= ONE_WEEK;
}

async function retry(fn, retries = 3) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  throw lastError;
}

function dedupe(items) {
  return [...new Map(items.map(item => [item.url, item])).values()];
}

async function scrapeBlog(browser, url, source) {
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US',
  });

  const page = await context.newPage();

  try {
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    const posts = await page.evaluate(baseUrl => {
      const links = Array.from(
        document.querySelectorAll('a[href*="/blog/"]')
      );

      return links
        .map(link => {
          const title = link.textContent?.trim();
          const href = link.getAttribute('href');

          if (!title || title.length < 10) {
            return null;
          }

          if (!href) {
            return null;
          }

          if (
            href.includes('/tag/') ||
            href.includes('/category/')
          ) {
            return null;
          }

          const article =
            link.closest('article') ||
            link.parentElement;

          const timeElement =
            article?.querySelector('time');

          return {
            title,
            url: href.startsWith('http')
              ? href
              : new URL(href, baseUrl).href,
            publishedAt:
              timeElement?.getAttribute('datetime') ||
              timeElement?.textContent?.trim() ||
              null,
          };
        })
        .filter(Boolean);
    }, url);

    return dedupe(posts)
      .filter(post => isRecent(post.publishedAt))
      .slice(0, 10)
      .map(post => ({
        source,
        title: post.title,
        url: post.url,
        publishedAt: post.publishedAt,
        summary: '',
      }));
  } finally {
    await context.close();
  }
}

async function scrapeNCC() {
  const response = await fetch(
    'https://www.ncc.gov.ng/news-and-publications',
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; GhonsiBot/1.0)',
      },
    }
  );

  const html = await response.text();

  const $ = cheerio.load(html);

  const results = [];

  $('article, .news-item, .post, .entry').each((_, el) => {
    const linkElement = $(el)
      .find('h2 a, h3 a, .title a')
      .first();

    const title = linkElement.text().trim();
    const href = linkElement.attr('href');

    if (!title || !href) {
      return;
    }

    const date =
      $(el).find('time').attr('datetime') ||
      $(el).find('.date').text().trim() ||
      null;

    results.push({
      source: 'ncc',
      title,
      url: href.startsWith('http')
        ? href
        : new URL(
            href,
            'https://www.ncc.gov.ng'
          ).href,
      publishedAt: date,
      summary: $(el)
        .find('.excerpt, .summary, p')
        .first()
        .text()
        .trim(),
    });
  });

  return dedupe(results)
    .filter(post => isRecent(post.publishedAt))
    .slice(0, 10);
}

export async function fetchFintechUpdates() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  const output = [];

  try {
    const sources = [
      {
        name: 'paystack',
        fetch: () =>
          retry(() =>
            scrapeBlog(
              browser,
              'https://paystack.com/blog',
              'paystack'
            )
          ),
      },
      {
        name: 'flutterwave',
        fetch: () =>
          retry(() =>
            scrapeBlog(
              browser,
              'https://flutterwave.com/blog',
              'flutterwave'
            )
          ),
      },
      {
        name: 'ncc',
        fetch: () => retry(scrapeNCC),
      },
    ];

    for (const source of sources) {
      try {
        const items = await source.fetch();

        output.push({
          source: source.name,
          items,
        });

        console.log(
          `[fintech] ${source.name}: ${items.length} items`
        );
      } catch (err) {
        console.warn(
          `[fintech] ${source.name} failed:`,
          err.message
        );
      }
    }
  } finally {
    await browser.close();
  }

  return {
    fetchedAt: new Date().toISOString(),
    freshness: 'last_7_days',
    totalSources: output.length,
    totalItems: output.reduce(
      (sum, src) => sum + src.items.length,
      0
    ),
    bySource: output,
  };
}