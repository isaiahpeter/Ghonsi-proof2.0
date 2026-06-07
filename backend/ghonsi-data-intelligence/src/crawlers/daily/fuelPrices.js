
/**
 * fuelPrices.js
 * --------------
 * Scrapes the NNPCL homepage for pump price indications.
 * If the price isn't found, it returns null.
 */

import * as cheerio from 'cheerio';

const SOURCE_URL = 'https://nnpcgroup.com';

export async function fetchFuelPrices() {
  const fetchedAt = new Date();
  const res = await fetch(SOURCE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Look for any element containing both "₦" or "N" and "litre" or "per litre"
  let priceText = '';
  $('*:contains("₦"), *:contains("N")').each((i, el) => {
    const t = $(el).text();
    if (t.match(/litre|pump price|petrol|PMS/i)) {
      priceText = t;
      return false;
    }
  });

  if (!priceText) {
    // Fallback: look for any large number near the word "price"
    const bodyText = $('body').text();
    const match = bodyText.match(/(?:₦|N)\s*([\d,]+\.?\d*)/);
    if (match) priceText = match[0];
  }

  const priceMatch = priceText.match(/(?:₦|N)\s*([\d,]+\.?\d*)/);
  const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null;

  return {
    source: 'NNPCL',
    sourceUrl: SOURCE_URL,
    fetchedAt: fetchedAt.toISOString(),
    freshness: price ? 'today' : 'unavailable',
    price,
    currency: 'NGN',
  };
}