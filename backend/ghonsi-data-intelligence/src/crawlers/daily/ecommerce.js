/**
 * ecommerce.js
 * ------------
 * Crawls Jumia & Konga top‑selling products with daily price deltas.
 * Uses Playwright headless browser with anti‑detection measures.
 *
 * Schedule: 2am–4am WAT only (to avoid bot detection)
 * Limit: under 200 requests per session
 */

import { chromium } from 'playwright';

const PLATFORMS = [
  {
    name: 'jumia',
    baseUrl: 'https://www.jumia.com.ng',
    categories: [
      { name: 'electronics', url: '/electronics/' },
      { name: 'fashion', url: '/fashion/' },
      { name: 'home-appliances', url: '/home-appliances/' },
      { name: 'phones-tablets', url: '/phones-tablets/' },
      { name: 'computing', url: '/computing/' },
    ],
    productSelector: 'a.core',
    titleSelector: '.name',
    priceSelector: '.prc',
    oldPriceSelector: '.old',
    discountSelector: '.tag._dsct',
    urlBase: 'https://www.jumia.com.ng',
  },
  {
    name: 'konga',
    baseUrl: 'https://www.konga.com',
    categories: [
      { name: 'electronics', url: '/category/electronics-1' },
      { name: 'fashion', url: '/category/fashion-2' },
      { name: 'home-kitchen', url: '/category/home-kitchen-3' },
      { name: 'phones-tablets', url: '/category/phones-tablets-4' },
      { name: 'computers-accessories', url: '/category/computers-accessories-5' },
    ],
    productSelector: 'a.product-card, a[href*="/product/"]',
    titleSelector: '.product-title, .name',
    priceSelector: '.price, .special-price',
    oldPriceSelector: '.old-price',
    discountSelector: '.discount',
    urlBase: 'https://www.konga.com',
  },
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

export async function fetchEcommercePrices({ platform = 'all', limit = 50 } = {}) {
  const results = [];
  const targets = platform === 'all' ? PLATFORMS : PLATFORMS.filter(p => p.name === platform);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  for (const target of targets) {
    for (const cat of target.categories) {
      const context = await browser.newContext({
        userAgent: HEADERS['User-Agent'],
        locale: 'en-US',
        viewport: { width: 1366, height: 768 },
      });
      const page = await context.newPage();

      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        window.chrome = { runtime: {} };
      });

      try {
        const fullUrl = target.baseUrl + cat.url;
        console.log(`[ecommerce] Crawling ${target.name} – ${cat.name}: ${fullUrl}`);
        await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(1000 + Math.random() * 2000);

        const products = await page.$$eval(target.productSelector, (cards, sel) => {
          return cards.slice(0, 50).map(card => {
            const titleEl = card.querySelector(sel.titleSel);
            const priceEl = card.querySelector(sel.priceSel);
            const oldPriceEl = card.querySelector(sel.oldPriceSel);
            const discountEl = card.querySelector(sel.discountSel);
            const linkEl = card.tagName === 'A' ? card : card.querySelector('a');

            const title = titleEl?.textContent.trim() || '';
            const url = linkEl?.href || '';
            const priceText = priceEl?.textContent.replace(/[^0-9.]/g, '') || '0';
            const oldPriceText = oldPriceEl?.textContent.replace(/[^0-9.]/g, '') || null;

            return {
              title,
              url,
              price: parseFloat(priceText) || 0,
              oldPrice: oldPriceText ? parseFloat(oldPriceText) : null,
              discount: discountEl?.textContent.trim() || null,
            };
          });
        }, {
          titleSel: target.titleSelector,
          priceSel: target.priceSelector,
          oldPriceSel: target.oldPriceSelector,
          discountSel: target.discountSelector,
        });

        for (const p of products) {
          results.push({
            platform: target.name,
            category: cat.name,
            product_name: p.title,
            product_url: p.url,
            price: p.price,
            previous_price: p.oldPrice,
            price_delta_percent: p.oldPrice ? parseFloat((((p.price - p.oldPrice) / p.oldPrice) * 100).toFixed(2)) : null,
            flash_sale: !!p.discount,
          });
        }

        console.log(`[ecommerce] ${target.name}/${cat.name}: ${products.length} products`);
      } catch (err) {
        console.error(`[ecommerce] Error on ${target.name}/${cat.name}:`, err.message);
      } finally {
        await context.close();
      }

      await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));
    }
  }

  await browser.close();
  return {
    fetchedAt: new Date().toISOString(),
    freshness: 'today',
    totalProducts: results.length,
    products: results,
  };
}


