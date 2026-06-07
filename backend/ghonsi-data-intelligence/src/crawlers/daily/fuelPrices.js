
import { chromium } from 'playwright';

export async function fetchFuelPrices() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US',
  });
  const page = await context.newPage();

  try {
    await page.goto('https://nnpcgroup.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const bodyText = await page.textContent('body');
    const match = bodyText.match(/(?:₦|N)\s*([\d,]+\.?\d*)\s*(?:per\s*litre|\/L|litre)?/i);
    const price = match ? parseFloat(match[1].replace(/,/g, '')) : null;

    return {
      source: 'NNPCL',
      sourceUrl: 'https://nnpcgroup.com',
      fetchedAt: new Date().toISOString(),
      freshness: price ? 'today' : 'unavailable',
      price,
      currency: 'NGN',
    };
  } finally {
    await context.close();
    await browser.close();
  }
}

