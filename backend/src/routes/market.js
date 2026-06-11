// src/routes/market.js
const express = require('express');
const router = express.Router();

let supabase;
const setSupabaseClient = (client) => { supabase = client; };

async function logCrawl(crawlerName, status, recordsInserted = 0, errorMessage = null) {
  if (!supabase) return;
  try {
    await supabase.from('crawl_log').insert({
      crawler_name: crawlerName,
      status,
      records_inserted: recordsInserted,
      error_message: errorMessage,
      started_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`[market] crawl_log insert failed:`, err.message);
  }
}

// ─── HELPERS ───────────────────────────────────────────────────────
function getTimeSlot() {
  const hour = (new Date().getUTCHours() + 1) % 24;
  if (hour >= 8 && hour < 13) return '8am';
  if (hour >= 13 && hour < 18) return '1pm';
  return '6pm';
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// ═══════════════════════════════════════════════════════════════════
// GOOGLE TRENDS
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/trends:
 *   get:
 *     tags: [Market Data]
 *     summary: Get stored Google Trends Nigeria
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema: { type: integer }
 *         description: Max trends to return
 *     responses:
 *       200:
 *         description: List of trends
 *       500:
 *         description: Server error
 */
router.get('/trends', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { data, error } = await supabase
      .from('google_trends')
      .select('*')
      .order('pull_date', { ascending: false })
      .order('pull_time_slot', { ascending: false })
      .order('rank', { ascending: true })
      .limit(limit);
    if (error) throw error;
    res.json({ success: true, data, meta: { freshness: data?.[0] ? 'today' : 'unknown' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/trends/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Trigger a Google Trends crawl
 *     responses:
 *       200:
 *         description: Crawl result
 *       500:
 *         description: Server error
 */
router.post('/trends/run', async (req, res) => {
  try {
    const { fetchDailyTrends } = await import('../../ghonsi-data-intelligence/src/crawlers/daily/googleTrends.js');
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

    const { error } = await supabase
      .from('google_trends')
      .upsert(rows, { onConflict: 'pull_date,pull_time_slot,rank' });

    // Backfill missing extracted_content/key_values for historical rows
    const { data: missingTrends, error: missingFetchErr } = await supabase
      .from('google_trends')
      .select('id, rank, query, traffic_volume, extracted_content, key_values')
      .is('extracted_content', null)
      .limit(500);
    if (missingFetchErr) throw missingFetchErr;

    if (missingTrends?.length) {
      for (const t of missingTrends) {
        const extracted = `Trending #${t.rank}: ${t.query} — ${t.traffic_volume} searches.`;
        const kv = JSON.stringify({
          query: t.query,
          traffic_volume: t.traffic_volume,
        });
        const { error: updErr } = await supabase
          .from('google_trends')
          .update({ extracted_content: extracted, key_values: kv })
          .eq('id', t.id);
        if (updErr) throw updErr;
      }
    }
    if (error) throw error;

    await logCrawl('googleTrends', 'success', rows.length);
    res.json({ success: true, inserted: rows.length });
  } catch (err) {
    await logCrawl('googleTrends', 'failed', 0, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// OFFICIAL CBN EXCHANGE RATES
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/rates/official:
 *   get:
 *     tags: [Market Data]
 *     summary: Get official CBN exchange rates
 *     responses:
 *       200:
 *         description: Official rates (USD, EUR, GBP)
 *       500:
 *         description: Server error
 */
router.get('/rates/official', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('data_type', 'exchange_rate')
      .eq('source_name', 'cbn_official')
      .order('rate_date', { ascending: false })
      .limit(10);
    if (error) throw error;
    res.json({ success: true, data, meta: { freshness: 'today' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/rates/official/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Trigger CBN official rates crawl
 *     responses:
 *       200:
 *         description: Crawl result
 *       500:
 *         description: Server error
 */
router.post('/rates/official/run', async (req, res) => {
  try {
    const { fetchCBNRates } = await import('../../ghonsi-data-intelligence/src/crawlers/daily/exchangeRates.js');
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

    const { error } = await supabase
      .from('exchange_rates')
      .upsert(rows, {
        onConflict: 'source_name,currency,rate_date',
      });
    if (error) throw error;

    await logCrawl('cbnExchangeRates', 'success', rows.length);
    res.json({ success: true, inserted: rows.length });
  } catch (err) {
    await logCrawl('cbnExchangeRates', 'failed', 0, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// PARALLEL MARKET RATES
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/rates/parallel:
 *   get:
 *     tags: [Market Data]
 *     summary: Get parallel (black) market exchange rates
 *     responses:
 *       200:
 *         description: Black market rates
 *       500:
 *         description: Server error
 */
router.get('/rates/parallel', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('source', 'black_market')
      .order('rate_date', { ascending: false })
      .limit(10);
    if (error) throw error;
    res.json({ success: true, data, meta: { freshness: 'today' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/rates/parallel/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Trigger parallel market rates crawl
 *     responses:
 *       200:
 *         description: Crawl result
 *       500:
 *         description: Server error
 */
router.post('/rates/parallel/run', async (req, res) => {
  try {
    const { fetchBlackMarketRates } = await import('../../ghonsi-data-intelligence/src/crawlers/daily/blackMarketRates.js');
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

    const { error } = await supabase
      .from('exchange_rates')
      .upsert(rows, {
        onConflict: 'source,currency,rate_date',
      });
    if (error) throw error;

    await logCrawl('blackMarketRates', 'success', rows.length);
    res.json({ success: true, inserted: rows.length });
  } catch (err) {
    await logCrawl('blackMarketRates', 'failed', 0, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// NEWS HEADLINES
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/news:
 *   get:
 *     tags: [Market Data]
 *     summary: Get latest news headlines
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema: { type: integer }
 *         description: Max headlines to return
 *       - name: source
 *         in: query
 *         schema: { type: string }
 *         description: Comma-separated source names
 *     responses:
 *       200:
 *         description: News headlines
 *       500:
 *         description: Server error
 */
router.get('/news', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const sources = req.query.source?.split(',');
    let query = supabase
      .from('news_headlines')
      .select('*')
      .order('fetched_at', { ascending: false })
      .limit(limit);
    if (sources?.length) query = query.in('source', sources);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data, meta: { freshness: 'today' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/news/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Trigger news headlines crawl
 *     responses:
 *       200:
 *         description: Crawl result
 *       500:
 *         description: Server error
 */
router.post('/news/run', async (req, res) => {
  try {
    const { fetchNewsHeadlines } = await import('../../ghonsi-data-intelligence/src/crawlers/daily/newsHeadlines.js');
    const result = await fetchNewsHeadlines();

    const rows = result.allHeadlines.map(h => ({
      source: h.source ?? h.source_name,
      source_name: h.source ?? h.source_name,
      title: h.title,
      url: h.url,
      published_at: h.publishedAt ? new Date(h.publishedAt).toISOString() : null,
      summary: h.summary || '',
      extracted_content: h.extracted_content,
      key_values: h.key_values,
      raw_data: h,
    }));

    const { error } = await supabase
      .from('news_headlines')
      .upsert(rows, { onConflict: 'source_name,url' });
    if (error) throw error;

    // Backfill old rows missing extracted_content/key_values
    const { data: oldMissing, error: missingFetchErr } = await supabase
      .from('news_headlines')
      .select('id, title, summary, extracted_content, key_values, source_name')
      .or('extracted_content.is.null,key_values.is.null')
      .limit(500);
    if (missingFetchErr) throw missingFetchErr;

    if (oldMissing?.length) {
      for (const row of oldMissing) {
        const extracted = row.summary ? row.summary : row.title;
        const keyValues = JSON.stringify({
          headline: row.title,
          source: row.source_name,
        });
        const { error: updateErr } = await supabase
          .from('news_headlines')
          .update({
            extracted_content: extracted,
            key_values: keyValues,
          })
          .eq('id', row.id);
        if (updateErr) throw updateErr;
      }
    }

    await logCrawl('newsHeadlines', 'success', rows.length);
    res.json({ success: true, inserted: rows.length });
  } catch (err) {
    await logCrawl('newsHeadlines', 'failed', 0, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// TIKTOK MANUAL TRENDS
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/tiktok:
 *   get:
 *     tags: [Market Data]
 *     summary: Get manual TikTok trends
 *     parameters:
 *       - name: date
 *         in: query
 *         schema: { type: string }
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: TikTok trends for the given date
 *       500:
 *         description: Server error
 */
router.get('/tiktok', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tiktok_trends')
      .select('*')
      .eq('trend_date', date)
      .order('rank', { ascending: true });
    if (error) throw error;
    res.json({ success: true, data, meta: { trendDate: date } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/tiktok:
 *   post:
 *     tags: [Market Data]
 *     summary: Log today's TikTok trends (manual entry)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trends:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     rank: { type: integer }
 *                     hashtag: { type: string }
 *                     sound_title: { type: string }
 *                     category: { type: string }
 *                     notes: { type: string }
 *               recordedBy: { type: string }
 *     responses:
 *       200:
 *         description: Number of trends inserted
 *       400:
 *         description: Missing trends array
 *       500:
 *         description: Server error
 */
router.post('/tiktok', async (req, res) => {
  try {
    const { trends, recordedBy } = req.body;
    if (!trends?.length) return res.status(400).json({ success: false, error: 'Missing trends array' });

    const trendDate = new Date().toISOString().split('T')[0];
    const rows = trends.map(t => ({
      trend_date: trendDate,
      rank: t.rank,
      hashtag: t.hashtag,
      sound_title: t.sound_title,
      category: t.category,
      notes: t.notes,
      recorded_by: recordedBy || 'manual',
    }));

    const { error } = await supabase
      .from('tiktok_trends')
      .upsert(rows, { onConflict: 'trend_date,rank' });
    if (error) throw error;

    res.json({ success: true, inserted: rows.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// FUEL PRICE
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/fuel:
 *   get:
 *     tags: [Market Data]
 *     summary: Get current fuel price
 *     responses:
 *       200:
 *         description: Fuel price
 *       500:
 *         description: Server error
 */
router.get('/fuel', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('fuel_prices')
      .select('*')
      .order('price_date', { ascending: false })
      .limit(1);
    if (error) throw error;
    res.json({ success: true, data: data?.[0] || null, meta: { freshness: 'today' } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/fuel/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Trigger fuel price crawl
 *     responses:
 *       200:
 *         description: Crawl result
 *       500:
 *         description: Server error
 */
router.post('/fuel/run', async (req, res) => {
  try {
    const { fetchFuelPrices } = await import('../../ghonsi-data-intelligence/src/crawlers/daily/fuelPrices.js');
    const result = await fetchFuelPrices();

    if (result.price === null || result.price === undefined) {
      await logCrawl('fuelPrices', 'partial', 0, 'No pump price found on page');
      return res.json({ success: true, inserted: 0, message: 'Price not available on NNPCL page today' });
    }

    const row = {
      source: result.source,
      pump_price_per_litre: result.price,
      price_date: result.fetchedAt.split('T')[0],
      previous_price: null,
      percentage_change: null,
      raw_data: result,
    };
    const { error } = await supabase
      .from('fuel_prices')
      .upsert(row, { onConflict: 'price_date' });
    if (error) throw error;
    await logCrawl('fuelPrices', 'success', 1);
    res.json({ success: true, inserted: 1 });
  } catch (err) {
    await logCrawl('fuelPrices', 'failed', 0, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// NAIRALAND / CONSUMER SENTIMENT
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/sentiment:
 *   get:
 *     tags: [Market Data]
 *     summary: Get Nairaland sentiment threads
 *     responses:
 *       200:
 *         description: Sentiment threads
 *       500:
 *         description: Server error
 */
router.get('/sentiment', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('nairaland_threads')
      .select('*')
      .order('crawled_week', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/sentiment/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Trigger Nairaland sentiment crawl
 *     responses:
 *       200:
 *         description: Crawl result
 *       500:
 *         description: Server error
 */
router.post('/sentiment/run', async (req, res) => {
  try {
    const { fetchConsumerSentiment } = await import('../../ghonsi-data-intelligence/src/crawlers/weekly/consumerSentiment.js');
    const result = await fetchConsumerSentiment();

    const rawItems = Array.isArray(result.threads)
      ? result.threads
      : Array.isArray(result.items)
        ? result.items
        : [];

    if (rawItems.length === 0) {
      await logCrawl('consumerSentiment', 'partial', 0, 'Crawl returned 0 items');
      return res.json({ success: true, inserted: 0, message: 'No items returned by crawler' });
    }

    const week = getISOWeek(new Date());

    const rows = rawItems.map(t => ({
      thread_title: t.title ?? t.thread_title ?? null,
      url:          t.url ?? null,
      crawled_week: week,
      raw_data:     t,
      section:          t.section          ?? 'business',
      reply_count:      t.replyCount       ?? null,
      brand_mentions:   t.brandMentions    ?? null,
      product_mentions: t.productMentions  ?? null,
      sentiment_label:  t.sentiment        ?? null,
    }));

    const { error } = await supabase
      .from('nairaland_threads')
      .upsert(rows, { onConflict: 'url,crawled_week' });
    if (error) throw error;

    await logCrawl('consumerSentiment', 'success', rows.length);
    res.json({ success: true, inserted: rows.length });
  } catch (err) {
    await logCrawl('consumerSentiment', 'failed', 0, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// BELLANAIJA LIFESTYLE
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/lifestyle:
 *   get:
 *     tags: [Market Data]
 *     summary: Get BellaNaija lifestyle posts
 *     responses:
 *       200:
 *         description: Lifestyle posts
 *       500:
 *         description: Server error
 */
router.get('/lifestyle', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bellanaija_posts')
      .select('*')
      .order('crawled_week', { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/lifestyle/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Trigger BellaNaija lifestyle crawl
 *     responses:
 *       200:
 *         description: Crawl result
 *       500:
 *         description: Server error
 */
router.post('/lifestyle/run', async (req, res) => {
  try {
    const { fetchLifestyleTrends } = await import('../../ghonsi-data-intelligence/src/crawlers/weekly/lifestyleTrends.js');
    const result = await fetchLifestyleTrends();
    const week = getISOWeek(new Date());
    const rows = result.posts.map(p => ({
      post_title: p.title,
      url: p.url,
      category: p.category,
      brand_tags: p.brandTags,
      published_at: null,
      crawled_week: week,
      raw_data: p,
    }));
    const { error } = await supabase
      .from('bellanaija_posts')
      .upsert(rows, { onConflict: 'url,crawled_week' });
    if (error) throw error;
    await logCrawl('lifestyleTrends', 'success', rows.length);
    res.json({ success: true, inserted: rows.length });
  } catch (err) {
    await logCrawl('lifestyleTrends', 'failed', 0, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// REGULATORY UPDATES
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/regulatory:
 *   get:
 *     tags: [Market Data]
 *     summary: Get regulatory updates (APCON, FCCPC, NAFDAC)
 *     responses:
 *       200:
 *         description: Regulatory items
 *       500:
 *         description: Server error
 */
router.get('/regulatory', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('regulatory_updates')
      .select('*')
      .order('crawled_week', { ascending: false })
      .limit(30);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/regulatory/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Trigger regulatory updates crawl
 *     responses:
 *       200:
 *         description: Crawl result
 *       500:
 *         description: Server error
 */
router.post('/regulatory/run', async (req, res) => {
  try {
    const { fetchRegulatoryUpdates } = await import('../../ghonsi-data-intelligence/src/crawlers/weekly/regulatoryUpdates.js');
    const result = await fetchRegulatoryUpdates();
    const week = getISOWeek(new Date());
    const rows = result.items.map(item => ({
      agency: item.agency,
      title: item.title,
      url: item.url,
      category: item.category,
      summary: item.summary,
      published_at: null,
      crawled_week: week,
      raw_data: item,
    }));
    const { error } = await supabase
      .from('regulatory_updates')
      .upsert(rows, { onConflict: 'agency,url' });
    if (error) throw error;
    await logCrawl('regulatoryUpdates', 'success', rows.length);
    res.json({ success: true, inserted: rows.length });
  } catch (err) {
    await logCrawl('regulatoryUpdates', 'failed', 0, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// FINTECH UPDATES
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/fintech:
 *   get:
 *     tags: [Market Data]
 *     summary: Get fintech/payment ecosystem updates
 *     responses:
 *       200:
 *         description: Fintech items
 *       500:
 *         description: Server error
 */
router.get('/fintech', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('digital_ecosystem')
      .select('*')
      .order('crawled_week', { ascending: false })
      .limit(30);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/fintech/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Trigger fintech updates crawl
 *     responses:
 *       200:
 *         description: Crawl result
 *       500:
 *         description: Server error
 */
router.post('/fintech/run', async (req, res) => {
  try {
    const { fetchFintechUpdates } = await import('../../ghonsi-data-intelligence/src/crawlers/weekly/fintechUpdates.js');
    const result = await fetchFintechUpdates();
    const week = getISOWeek(new Date());
    const rows = [];
    for (const src of result.bySource) {
      for (const item of src.items) {
        rows.push({
          source: src.source,
          title: item.title,
          url: item.url,
          topic: 'general',
          summary: item.summary || '',
          published_at: item.publishedAt,
          crawled_week: week,
          raw_data: item,
        });
      }
    }
    const { error } = await supabase
      .from('digital_ecosystem')
      .upsert(rows, { onConflict: 'source,url' });
    if (error) throw error;
    await logCrawl('fintechUpdates', 'success', rows.length);
    res.json({ success: true, inserted: rows.length });
  } catch (err) {
    await logCrawl('fintechUpdates', 'failed', 0, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// CPI REPORTS
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/cpi:
 *   get:
 *     tags: [Market Data]
 *     summary: Get latest CPI report indicators
 *     responses:
 *       200:
 *         description: CPI data
 *       500:
 *         description: Server error
 */
router.get('/cpi', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('nbs_economic_indicators')
      .select('*')
      .eq('report_type', 'CPI')
      .order('report_month', { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/cpi/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Trigger CPI report crawl
 *     responses:
 *       200:
 *         description: Crawl result
 *       500:
 *         description: Server error
 */
router.post('/cpi/run', async (req, res) => {
  try {
    const { fetchCPIReport } = await import('../../ghonsi-data-intelligence/src/crawlers/monthly/cpiReports.js');
    const result = await fetchCPIReport();

    if (!result.indicators || result.indicators.length === 0) {
      await logCrawl('cpiReports', 'partial', 0, result.error || 'No indicators found in PDF');
      return res.json({
        success: true,
        inserted: 0,
        message: 'No indicators found in PDF',
        rawSample: result.rawSample || 'No raw text captured',
        error: result.error || null
      });
    }

    const rows = result.indicators.map(ind => ({
      report_type: 'CPI',
      report_month: result.reportMonth || new Date().toISOString().slice(0, 7) + '-01',
      indicator_name: ind.indicator_name,
      value: ind.value,
      unit: ind.unit,
      state: null,
      raw_data: { ...ind, sourceUrl: result.sourceUrl, reportTitle: result.reportTitle },
    }));

    const { error } = await supabase
      .from('nbs_economic_indicators')
      .upsert(rows, { onConflict: 'report_type,report_month,indicator_name,state' });
    if (error) throw error;

    await logCrawl('cpiReports', 'success', rows.length);
    res.json({ success: true, inserted: rows.length });
  } catch (err) {
    await logCrawl('cpiReports', 'failed', 0, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     tags: [Market Data]
 *     summary: Market data crawl status
 *     responses:
 *       200:
 *         description: Health check with latest crawl statuses
 *       500:
 *         description: Server error
 */
router.get('/health', async (req, res) => {
  try {
    const { data: logs } = await supabase
      .from('crawl_log')
      .select('crawler_name, status, completed_at')
      .order('completed_at', { ascending: false });

    const latest = {};
    (logs || []).forEach(log => {
      if (!latest[log.crawler_name]) latest[log.crawler_name] = log;
    });

    res.json({ success: true, uptime: process.uptime(), crawlers: latest });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// NBS REPORTS
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/nbs:
 *   get:
 *     tags: [Market Data]
 *     summary: Get latest NBS reports
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema: { type: integer }
 *         description: Max reports to return
 *     responses:
 *       200:
 *         description: List of NBS reports
 *       500:
 *         description: Server error
 */
router.get('/nbs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { data, error } = await supabase
      .from('nbs_reports')
      .select('*')
      .order('report_id', { ascending: false })
      .limit(limit);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/nbs/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Trigger NBS reports crawl
 *     responses:
 *       200:
 *         description: Crawl result
 *       500:
 *         description: Server error
 */
router.post('/nbs/run', async (req, res) => {
  try {
    const { fetchNBSReports } = await import('../../ghonsi-data-intelligence/src/crawlers/weekly/nbsReports.js');
    const result = await fetchNBSReports({ limit: 10 });
    const rows = result.reports.map(r => ({
      report_id: r.id,
      title: r.title,
      url: r.url,
      download_url: r.downloadUrl,
      published_at: r.publishedAt,
      raw_data: r,
    }));
    const { error } = await supabase
      .from('nbs_reports')
      .upsert(rows, { onConflict: 'report_id' });
    if (error) throw error;
    await logCrawl('nbsReports', 'success', rows.length);
    res.json({ success: true, inserted: rows.length });
  } catch (err) {
    await logCrawl('nbsReports', 'failed', 0, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// E‑COMMERCE PRICES
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/ecommerce:
 *   get:
 *     tags: [Market Data]
 *     summary: Get latest e‑commerce prices
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema: { type: integer }
 *         description: Max products to return
 *     responses:
 *       200:
 *         description: E‑commerce prices
 *       500:
 *         description: Server error
 */
router.get('/ecommerce', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const { data, error } = await supabase
      .from('ecommerce_prices')
      .select('*')
      .order('crawl_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @swagger
 * /api/v1/ecommerce/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Trigger e‑commerce price crawl (Jumia & Konga)
 *     responses:
 *       200:
 *         description: Crawl result
 *       500:
 *         description: Server error
 */
router.post('/ecommerce/run', async (req, res) => {
  try {
    const { fetchEcommercePrices } = await import('../../ghonsi-data-intelligence/src/crawlers/daily/ecommerce.js');
    const result = await fetchEcommercePrices({ platform: 'all', limit: 50 });

    if (!result.products || result.products.length === 0) {
      await logCrawl('ecommerce', 'partial', 0, result.reason || 'No products found');
      return res.json({ success: true, inserted: 0, message: 'No products returned' });
    }

    const today = new Date().toISOString().split('T')[0];

    const seen = new Set();
    const rows = [];
    for (const p of result.products) {
      const key = `${p.platform}|${p.product_url}|${today}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const sourceName = p.platform === 'konga' ? 'konga' : 'jumia';
      rows.push({
        source_name: sourceName,
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
      });
    }

    const { error } = await supabase
      .from('ecommerce_prices')
      .upsert(rows, { onConflict: 'platform,product_url,crawl_date' });

    // Backfill old rows missing extracted_content and/or key_values
    const { data: missingProducts, error: missingFetchErr } = await supabase
      .from('ecommerce_prices')
      .select('id, product_name, price, extracted_content, key_values, source_name, category, flash_sale, price_delta_percent, previous_price')
      .or('extracted_content.is.null,key_values.is.null')
      .limit(500);
    if (missingFetchErr) throw missingFetchErr;

    if (missingProducts?.length) {
      for (const row of missingProducts) {
        const extracted = `${row.product_name} - ₦${row.price}`;
        const kv = row.key_values
          ? row.key_values
          : JSON.stringify({
              platform: row.source_name,
              category: row.category || null,
              product_name: row.product_name,
              price: row.price,
              previous_price: row.previous_price,
              price_delta_percent: row.price_delta_percent,
              flash_sale: row.flash_sale,
            });

        const { error: updErr } = await supabase
          .from('ecommerce_prices')
          .update({
            extracted_content: extracted,
            key_values: kv,
          })
          .eq('id', row.id);
        if (updErr) throw updErr;
      }
    }

    if (error) throw error;

    await logCrawl('ecommerce', 'success', rows.length);
    res.json({ success: true, inserted: rows.length });
  } catch (err) {
    await logCrawl('ecommerce', 'failed', 0, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// INSIGHTS SEARCH
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/insights/search:
 *   get:
 *     tags: [Market Data]
 *     summary: Search the Nigerian marketing insights knowledge base
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema: { type: string }
 *         description: Natural‑language query about Nigerian marketing
 *       - name: limit
 *         in: query
 *         schema: { type: integer }
 *         description: Max results (default 5)
 *     responses:
 *       200:
 *         description: Ranked insights with similarity scores
 *       400:
 *         description: Missing required query param q
 *       500:
 *         description: Server error
 */
router.get('/insights/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ success: false, error: 'Missing query param "q"' });

  try {
    const { embedQuery } = await import('../utils/embed.js');
    const queryEmbedding = await embedQuery(q);
    const { data, error } = await supabase.rpc('search_insights', {
      query_embedding: queryEmbedding,
      match_limit: 5
    });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = { router, setSupabaseClient };