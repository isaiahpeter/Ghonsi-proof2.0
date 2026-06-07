/**
 * ecommerce.js
 * ------------
 * Crawls Jumia & Konga top‑selling products with daily price deltas.
 * Requires: Playwright (headless browser)
 * Schedule: 2am–4am WAT
 */

export async function fetchEcommercePrices({ platform = 'jumia' } = {}) {
  throw new Error(
    `E‑commerce crawling for ${platform} is not yet implemented. ` +
    `This requires a headless browser (Playwright) and off‑peak scheduling.`
  );
}

