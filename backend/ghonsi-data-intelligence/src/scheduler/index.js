import cron from 'node-cron';
import { query } from '../db/connection.js';

// Helper: log crawl result
async function logCrawl(crawlerName, status, recordsInserted = 0, errorMessage = null) {
  await query(
    `INSERT INTO crawl_log (crawler_name, data_type, status, records_inserted, error_message, started_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [crawlerName, crawlerName, status, recordsInserted, errorMessage]
  );
}

// Time slot helper (for Google Trends)
function getTimeSlot() {
  const hour = (new Date().getUTCHours() + 1) % 24;
  if (hour >= 8 && hour < 13) return '8am';
  if (hour >= 13 && hour < 18) return '1pm';
  return '6pm';
}

// ISO week helper
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// ----- Crawler job functions -----

async function runTrends() {
  const { fetchDailyTrends } = await import('../crawlers/daily/googleTrends.js');
  const result = await fetchDailyTrends({ geo: 'NG', limit: 20 });
  const rows = result.trends.map(t => ({
    pull_time_slot: getTimeSlot(),
    pull_date: result.fetchedAt.split('T')[0],
    rank: t.rank,
    query: t.query,
    traffic_volume: t.trafficVolume,
    pub_date: t.pubDate,
    image_url: t.imageUrl,
    image_source: t.imageSource,
    articles: t.articles || [],
    extracted_content: t.extracted_content,
    key_values: t.key_values,
    raw_data: t,
  }));
  await query(
    `INSERT INTO google_trends (pull_time_slot, pull_date, rank, query, traffic_volume, pub_date, image_url, image_source, articles, extracted_content, key_values, raw_data)
     VALUES ${rows.map((_, i) => `($${i * 10 + 1}, $${i * 10 + 2}, $${i * 10 + 3}, $${i * 10 + 4}, $${i * 10 + 5}, $${i * 10 + 6}, $${i * 10 + 7}, $${i * 10 + 8}, $${i * 10 + 9}, $${i * 10 + 10}, $${i * 10 + 11}, $${i * 10 + 12})`).join(', ')}
     ON CONFLICT (pull_date, pull_time_slot, rank) DO NOTHING`,
    rows.flatMap(r => [
      r.pull_time_slot,
      r.pull_date,
      r.rank,
      r.query,
      r.traffic_volume,
      r.pub_date,
      r.image_url,
      r.image_source,
      JSON.stringify(r.articles),
      r.extracted_content,
      r.key_values,
      JSON.stringify(r.raw_data),
    ])
  );
  await logCrawl('googleTrends', 'success', rows.length);
}

async function runOfficialRates() {
  const { fetchCBNRates } = await import('../crawlers/daily/exchangeRates.js');
  const result = await fetchCBNRates({ currencies: ['US DOLLAR', 'EURO', 'POUNDS STERLING'] });
  const rows = Object.entries(result.rates).map(([code, rate]) => ({
    source: 'cbn_official',
    source_name: 'cbn_official',
    currency: code,
    pair: rate.pair,
    buying_rate: rate.buyingRate,
    selling_rate: rate.sellingRate,
    central_rate: rate.centralRate,
    rate_date: rate.date,
    previous_buying_rate: null,
    previous_selling_rate: null,
    extracted_content: rate.extracted_content,
    key_values: rate.key_values,
    raw_data: rate,
  }));
  await query(
    `INSERT INTO exchange_rates (source, source_name, currency, pair, buying_rate, selling_rate, central_rate, rate_date, previous_buying_rate, previous_selling_rate, extracted_content, key_values, raw_data)
     VALUES ${rows.map((_, i) => `($${i * 13 + 1}, $${i * 13 + 2}, $${i * 13 + 3}, $${i * 13 + 4}, $${i * 13 + 5}, $${i * 13 + 6}, $${i * 13 + 7}, $${i * 13 + 8}, $${i * 13 + 9}, $${i * 13 + 10}, $${i * 13 + 11}, $${i * 13 + 12}, $${i * 13 + 13})`).join(', ')}
     ON CONFLICT (source_name, currency, rate_date) DO UPDATE SET
       buying_rate = EXCLUDED.buying_rate,
       selling_rate = EXCLUDED.selling_rate,
       central_rate = EXCLUDED.central_rate,
       extracted_content = EXCLUDED.extracted_content,
       key_values = EXCLUDED.key_values,
       raw_data = EXCLUDED.raw_data`,
    rows.flatMap(r => [
      r.source,
      r.source_name,
      r.currency,
      r.pair,
      r.buying_rate,
      r.selling_rate,
      r.central_rate,
      r.rate_date,
      r.previous_buying_rate,
      r.previous_selling_rate,
      r.extracted_content,
      r.key_values,
      JSON.stringify(r.raw_data),
    ])
  );
  await logCrawl('cbnExchangeRates', 'success', rows.length);
}

async function runParallelRates() {
  const { fetchBlackMarketRates } = await import('../crawlers/daily/blackMarketRates.js');
  const result = await fetchBlackMarketRates();
  const rows = Object.entries(result.rates).map(([code, rate]) => ({
    source: 'black_market',
    source_name: 'nairatoday_parallel',
    currency: code,
    buying_rate: rate.buyRate,
    selling_rate: rate.sellRate,
    central_rate: rate.cbnRate,
    rate_date: result.fetchedAt.split('T')[0],
    previous_buying_rate: null,
    previous_selling_rate: null,
    extracted_content: rate.extracted_content,
    key_values: rate.key_values,
    raw_data: rate,
  }));
  await query(
    `INSERT INTO exchange_rates (source, source_name, currency, buying_rate, selling_rate, central_rate, rate_date, previous_buying_rate, previous_selling_rate, extracted_content, key_values, raw_data)
     VALUES ${rows.map((_, i) => `($${i * 11 + 1}, $${i * 11 + 2}, $${i * 11 + 3}, $${i * 11 + 4}, $${i * 11 + 5}, $${i * 11 + 6}, $${i * 11 + 7}, $${i * 11 + 8}, $${i * 11 + 9}, $${i * 11 + 10}, $${i * 11 + 11}, $${i * 11 + 12})`).join(', ')}
     ON CONFLICT (source, currency, rate_date) DO UPDATE SET
       buying_rate = EXCLUDED.buying_rate,
       selling_rate = EXCLUDED.selling_rate,
       central_rate = EXCLUDED.central_rate,
       extracted_content = EXCLUDED.extracted_content,
       key_values = EXCLUDED.key_values,
       raw_data = EXCLUDED.raw_data`,
    rows.flatMap(r => [
      r.source,
      r.source_name,
      r.currency,
      r.buying_rate,
      r.selling_rate,
      r.central_rate,
      r.rate_date,
      r.previous_buying_rate,
      r.previous_selling_rate,
      r.extracted_content,
      r.key_values,
      JSON.stringify(r.raw_data),
    ])
  );
  await logCrawl('blackMarketRates', 'success', rows.length);
}

async function runNews() {
  const { fetchNewsHeadlines } = await import('../crawlers/daily/newsHeadlines.js');
  const result = await fetchNewsHeadlines();
  const rows = result.allHeadlines.map(h => ({
    source: h.source, // keep for backward compatibility
    source_name: h.source,
    title: h.title,
    url: h.url,
    published_at: h.publishedAt ? new Date(h.publishedAt).toISOString() : null,
    summary: h.summary || '',
    extracted_content: h.extracted_content,
    key_values: h.key_values,
    raw_data: h,
  }));
  await query(
    `INSERT INTO news_headlines (source, source_name, title, url, published_at, summary, extracted_content, key_values, raw_data)
     VALUES ${rows.map((_, i) => `($${i * 9 + 1}, $${i * 9 + 2}, $${i * 9 + 3}, $${i * 9 + 4}, $${i * 9 + 5}, $${i * 9 + 6}, $${i * 9 + 7}, $${i * 9 + 8}, $${i * 9 + 9})`).join(', ')}
     ON CONFLICT (source_name, url) DO NOTHING`,
    rows.flatMap(r => [
      r.source,
      r.source_name,
      r.title,
      r.url,
      r.published_at,
      r.summary,
      r.extracted_content,
      r.key_values,
      JSON.stringify(r.raw_data),
    ])
  );
  await logCrawl('newsHeadlines', 'success', rows.length);
}

async function runSentiment() {
  const { fetchConsumerSentiment } = await import('../crawlers/weekly/consumerSentiment.js');
  const result = await fetchConsumerSentiment();
  const rawItems = Array.isArray(result.threads)
    ? result.threads
    : Array.isArray(result.items)
      ? result.items
      : [];

  if (rawItems.length === 0) return await logCrawl('consumerSentiment', 'partial', 0, 'No items');
  const week = getISOWeek(new Date());
  const rows = rawItems.map(t => ({
    thread_title: t.title ?? t.thread_title ?? null,
    url: t.url ?? null,
    crawled_week: week,
    raw_data: t,
    section: t.section ?? 'business',
    reply_count: t.replyCount ?? null,
    brand_mentions: t.brandMentions ?? null,
    product_mentions: t.productMentions ?? null,
    sentiment_label: t.sentiment ?? null,
  }));
  await query(
    `INSERT INTO nairaland_threads (thread_title, url, crawled_week, raw_data, section, reply_count, brand_mentions, product_mentions, sentiment_label)
     VALUES ${rows.map((_, i) => `($${i * 9 + 1}, $${i * 9 + 2}, $${i * 9 + 3}, $${i * 9 + 4}, $${i * 9 + 5}, $${i * 9 + 6}, $${i * 9 + 7}, $${i * 9 + 8}, $${i * 9 + 9})`).join(', ')}
     ON CONFLICT (url, crawled_week) DO NOTHING`,
    rows.flatMap(r => [
      r.thread_title,
      r.url,
      r.crawled_week,
      JSON.stringify(r.raw_data),
      r.section,
      r.reply_count,
      JSON.stringify(r.brand_mentions),
      JSON.stringify(r.product_mentions),
      r.sentiment_label,
    ])
  );
  await logCrawl('consumerSentiment', 'success', rows.length);
}

// Fuel – currently broken (returns NaN). Schedule but swallow errors gracefully.
async function runFuel() {
  try {
    const { fetchFuelPrices } = await import('../crawlers/daily/fuelPrices.js');
    const result = await fetchFuelPrices();
    if (result.price === null || result.price === undefined || isNaN(result.price)) {
      await logCrawl('fuelPrices', 'partial', 0, 'Price not available');
      return;
    }
    await query(
      `INSERT INTO fuel_prices (source, pump_price_per_litre, price_date, previous_price, percentage_change, raw_data)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (price_date) DO NOTHING`,
      [
        result.source,
        result.price,
        result.fetchedAt.split('T')[0],
        null,
        null,
        JSON.stringify(result),
      ]
    );
    await logCrawl('fuelPrices', 'success', 1);
  } catch (err) {
    await logCrawl('fuelPrices', 'failed', 0, err.message);
  }
}

// E‑commerce Jumia (Konga later)
async function runEcommerceJumia() {
  try {
    const { fetchEcommercePrices } = await import('../crawlers/daily/ecommerce.js');
    const result = await fetchEcommercePrices({ platform: 'jumia', limit: 50 });
    if (!result.products || result.products.length === 0) {
      await logCrawl('ecommerceJumia', 'partial', 0, 'No products');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const rows = result.products.map(p => ({
      source_name: 'jumia',
      platform: p.platform,
      category: p.category,
      product_name: p.product_name,
      product_url: p.product_url,
      price: p.price,
      previous_price: p.previous_price,
      price_delta_percent: p.price_delta_percent,
      flash_sale: p.flash_sale,
      extracted_content: `${p.product_name} - ₦${p.price}`,
      key_values: JSON.stringify({
        platform: p.platform,
        category: p.category,
        product_name: p.product_name,
        price: p.price,
        previous_price: p.previous_price,
        price_delta_percent: p.price_delta_percent,
        flash_sale: p.flash_sale,
      }),
      crawl_date: today,
      raw_data: p,
    }));
    await query(
      `INSERT INTO ecommerce_prices (source_name, platform, category, product_name, product_url, price, previous_price, price_delta_percent, flash_sale, extracted_content, key_values, crawl_date, raw_data)
       VALUES ${rows.map((_, i) => `($${i * 13 + 1}, $${i * 13 + 2}, $${i * 13 + 3}, $${i * 13 + 4}, $${i * 13 + 5}, $${i * 13 + 6}, $${i * 13 + 7}, $${i * 13 + 8}, $${i * 13 + 9}, $${i * 13 + 10}, $${i * 13 + 11}, $${i * 13 + 12}, $${i * 13 + 13})`).join(', ')}
       ON CONFLICT (platform, product_url, crawl_date) DO NOTHING`,
      rows.flatMap(r => [
        r.source_name,
        r.platform,
        r.category,
        r.product_name,
        r.product_url,
        r.price,
        r.previous_price,
        r.price_delta_percent,
        r.flash_sale,
        r.extracted_content,
        r.key_values,
        r.crawl_date,
        JSON.stringify(r.raw_data),
      ])
    );
    await logCrawl('ecommerceJumia', 'success', rows.length);
  } catch (err) {
    await logCrawl('ecommerceJumia', 'failed', 0, err.message);
  }
}

// Start scheduler
export function startScheduler() {
  // Google Trends: 8am, 1pm, 6pm WAT (UTC+1 => 7am, 12pm, 5pm UTC)
  cron.schedule('0 7,12,17 * * *', runTrends, { timezone: 'Africa/Lagos' });
  // CBN official: 9am WAT (8am UTC)
  cron.schedule('0 8 * * *', runOfficialRates, { timezone: 'Africa/Lagos' });
  // Black market: 8am, 8pm WAT (7am, 19pm UTC)
  cron.schedule('0 7,19 * * *', runParallelRates, { timezone: 'Africa/Lagos' });
  // News: 7am WAT (6am UTC)
  cron.schedule('0 6 * * *', runNews, { timezone: 'Africa/Lagos' });
  // Sentiment (Nairaland): Monday 6am WAT (Monday 5am UTC)
  cron.schedule('0 5 * * 1', runSentiment, { timezone: 'Africa/Lagos' });
  // Fuel: 9am WAT (8am UTC) – will log error until fixed
  cron.schedule('0 8 * * *', runFuel, { timezone: 'Africa/Lagos' });
  // Jumia: 2am WAT (1am UTC)
  cron.schedule('0 1 * * *', runEcommerceJumia, { timezone: 'Africa/Lagos' });
  console.log('[Scheduler] All daily jobs scheduled.');
}

