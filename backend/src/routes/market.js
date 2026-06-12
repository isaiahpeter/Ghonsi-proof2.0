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
 *     summary: Get Google Trends ranking data
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records to return
 *     responses:
 *       200:
 *         description: Paginated Google Trends rows ordered by pull_date and rank
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:          { type: integer }
 *                       pull_date:   { type: string, format: date }
 *                       pull_time_slot: { type: string, enum: [8am, 1pm, 6pm] }
 *                       rank:        { type: integer }
 *                       query:       { type: string }
 *                       traffic_volume: { type: string }
 *                       pub_date:    { type: string }
 *                       image_url:   { type: string }
 *                       image_source:{ type: string }
 *                       articles:    { type: array, items: { type: object } }
 *                       extracted_content: { type: string }
 *                       key_values:  { type: string }
 *                       raw_data:    { type: object }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     freshness: { type: string, example: today }
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/trends', async (req, res) => { /* ... */ });

/**
 * @swagger
 * /api/v1/trends/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Run Google Trends crawler and upsert latest results
 *     description: >
 *       Fetches the top 20 trending queries in Nigeria (geo=NG), upserts them
 *       into `google_trends` keyed on (pull_date, pull_time_slot, rank), then
 *       backfills any historical rows that are missing extracted_content /
 *       key_values.
 *     responses:
 *       200:
 *         description: Crawl completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:  { type: boolean, example: true }
 *                 inserted: { type: integer, example: 20 }
 *       500:
 *         description: Crawl failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/trends/run', async (req, res) => { /* ... */ });

// ═══════════════════════════════════════════════════════════════════
// OFFICIAL CBN EXCHANGE RATES
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/rates/official:
 *   get:
 *     tags: [Market Data]
 *     summary: Get official CBN exchange rates
 *     description: Returns the 10 most recent rows from `exchange_rates` where source_name = 'cbn_official'.
 *     responses:
 *       200:
 *         description: Official CBN exchange rates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExchangeRate'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     freshness: { type: string, example: today }
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/rates/official', async (req, res) => { /* ... */ });

/**
 * @swagger
 * /api/v1/rates/official/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Run official CBN exchange rates crawler and upsert latest results
 *     description: >
 *       Fetches USD, EUR, and GBP rates from the CBN and upserts them into
 *       `exchange_rates` keyed on (source_name, currency, rate_date).
 *     responses:
 *       200:
 *         description: Crawl completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:  { type: boolean, example: true }
 *                 inserted: { type: integer, example: 3 }
 *       500:
 *         description: Crawl failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/rates/official/run', async (req, res) => { /* ... */ });

// ═══════════════════════════════════════════════════════════════════
// PARALLEL MARKET RATES
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/rates/parallel:
 *   get:
 *     tags: [Market Data]
 *     summary: Get parallel (black market) exchange rates
 *     description: Returns the 10 most recent rows from `exchange_rates` where source = 'black_market'.
 *     responses:
 *       200:
 *         description: Parallel market exchange rates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExchangeRate'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     freshness: { type: string, example: today }
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/rates/parallel', async (req, res) => { /* ... */ });

/**
 * @swagger
 * /api/v1/rates/parallel/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Run parallel (black market) exchange rates crawler and upsert latest results
 *     description: >
 *       Scrapes nairatoday.com for black market rates and upserts into
 *       `exchange_rates` keyed on (source, currency, rate_date).
 *     responses:
 *       200:
 *         description: Crawl completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:  { type: boolean, example: true }
 *                 inserted: { type: integer, example: 5 }
 *       500:
 *         description: Crawl failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/rates/parallel/run', async (req, res) => { /* ... */ });

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
 *         required: false
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of headlines to return
 *       - name: source
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated list of source names to filter by (e.g. "techcabal,businessday")
 *     responses:
 *       200:
 *         description: News headlines ordered by fetched_at descending
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:                { type: integer }
 *                       source:            { type: string }
 *                       source_name:       { type: string }
 *                       title:             { type: string }
 *                       url:               { type: string, format: uri }
 *                       published_at:      { type: string, format: date-time, nullable: true }
 *                       summary:           { type: string }
 *                       extracted_content: { type: string }
 *                       key_values:        { type: string }
 *                       fetched_at:        { type: string, format: date-time }
 *                       raw_data:          { type: object }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     freshness: { type: string, example: today }
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/news', async (req, res) => { /* ... */ });

/**
 * @swagger
 * /api/v1/news/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Run news headlines crawler and upsert latest results
 *     description: >
 *       Fetches headlines via RSS from configured Nigerian news sources,
 *       upserts into `news_headlines` keyed on (source_name, url), then
 *       backfills any historical rows missing extracted_content / key_values.
 *     responses:
 *       200:
 *         description: Crawl completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:  { type: boolean, example: true }
 *                 inserted: { type: integer, example: 42 }
 *       500:
 *         description: Crawl failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/news/run', async (req, res) => { /* ... */ });

// ═══════════════════════════════════════════════════════════════════
// TIKTOK MANUAL TRENDS
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/tiktok:
 *   get:
 *     tags: [Market Data]
 *     summary: Get manually recorded TikTok trends for a given date
 *     parameters:
 *       - name: date
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: "Date to fetch trends for (default: today, format: YYYY-MM-DD)"
 *     responses:
 *       200:
 *         description: TikTok trend entries ordered by rank
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:          { type: integer }
 *                       trend_date:  { type: string, format: date }
 *                       rank:        { type: integer }
 *                       hashtag:     { type: string }
 *                       sound_title: { type: string }
 *                       category:    { type: string }
 *                       notes:       { type: string }
 *                       recorded_by: { type: string }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     trendDate: { type: string, format: date }
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/tiktok', async (req, res) => { /* ... */ });

/**
 * @swagger
 * /api/v1/tiktok:
 *   post:
 *     tags: [Market Data]
 *     summary: Manually record TikTok trends for today
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [trends]
 *             properties:
 *               recordedBy:
 *                 type: string
 *                 description: Identifier for who is submitting the trends
 *                 example: analyst_1
 *               trends:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [rank]
 *                   properties:
 *                     rank:        { type: integer, example: 1 }
 *                     hashtag:     { type: string, example: "#NaijaFashion" }
 *                     sound_title: { type: string, example: "Kizz Daniel - Buga" }
 *                     category:    { type: string, example: "Entertainment" }
 *                     notes:       { type: string }
 *     responses:
 *       200:
 *         description: Trends upserted successfully (keyed on trend_date, rank)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:  { type: boolean, example: true }
 *                 inserted: { type: integer, example: 5 }
 *       400:
 *         description: Missing or empty trends array
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/tiktok', async (req, res) => { /* ... */ });

// ═══════════════════════════════════════════════════════════════════
// FUEL PRICE
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/fuel:
 *   get:
 *     tags: [Market Data]
 *     summary: Get the latest NNPCL fuel pump price
 *     responses:
 *       200:
 *         description: Most recent fuel price record, or null if none exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   nullable: true
 *                   type: object
 *                   properties:
 *                     id:                   { type: integer }
 *                     source:               { type: string, example: nnpcl }
 *                     pump_price_per_litre: { type: number, example: 617 }
 *                     price_date:           { type: string, format: date }
 *                     previous_price:       { type: number, nullable: true }
 *                     percentage_change:    { type: number, nullable: true }
 *                     raw_data:             { type: object }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     freshness: { type: string, example: today }
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/fuel', async (req, res) => { /* ... */ });

/**
 * @swagger
 * /api/v1/fuel/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Run NNPCL fuel prices crawler and upsert latest result
 *     description: >
 *       Scrapes the NNPCL website for the current pump price per litre and
 *       upserts one row into `fuel_prices` keyed on price_date. Returns
 *       inserted=0 with a message if the price could not be found on the page.
 *     responses:
 *       200:
 *         description: Crawl completed (check inserted count — may be 0 if price unavailable)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:  { type: boolean, example: true }
 *                 inserted: { type: integer, example: 1 }
 *                 message:
 *                   type: string
 *                   nullable: true
 *                   description: Present only when no price was found on the page
 *       500:
 *         description: Crawl failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/fuel/run', async (req, res) => { /* ... */ });

// ═══════════════════════════════════════════════════════════════════
// NAIRALAND / CONSUMER SENTIMENT
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/sentiment:
 *   get:
 *     tags: [Market Data]
 *     summary: Get Nairaland consumer sentiment threads
 *     description: Returns the 50 most recent thread records ordered by crawled_week descending.
 *     responses:
 *       200:
 *         description: Consumer sentiment thread records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:               { type: integer }
 *                       thread_title:     { type: string }
 *                       url:              { type: string, format: uri }
 *                       crawled_week:     { type: string, example: "2025-W24" }
 *                       section:          { type: string, example: business }
 *                       reply_count:      { type: integer, nullable: true }
 *                       brand_mentions:   { type: array, items: { type: string }, nullable: true }
 *                       product_mentions: { type: array, items: { type: string }, nullable: true }
 *                       sentiment_label:  { type: string, nullable: true }
 *                       raw_data:         { type: object }
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/sentiment', async (req, res) => { /* ... */ });

/**
 * @swagger
 * /api/v1/sentiment/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Run Nairaland consumer sentiment crawler and upsert weekly results
 *     description: >
 *       Scrapes Nairaland business/market threads for the current ISO week and
 *       upserts them into `nairaland_threads` keyed on (url, crawled_week).
 *       Returns inserted=0 with a message if the crawl returns no items.
 *     responses:
 *       200:
 *         description: Crawl completed (check inserted — may be 0 if no items returned)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:  { type: boolean, example: true }
 *                 inserted: { type: integer, example: 18 }
 *                 message:
 *                   type: string
 *                   nullable: true
 *                   description: Present only when crawl returned 0 items
 *       500:
 *         description: Crawl failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/sentiment/run', async (req, res) => { /* ... */ });

// ═══════════════════════════════════════════════════════════════════
// BELLANAIJA LIFESTYLE
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/lifestyle:
 *   get:
 *     tags: [Market Data]
 *     summary: Get BellaNaija lifestyle trend posts
 *     description: Returns the 20 most recent posts from `bellanaija_posts` ordered by crawled_week descending.
 *     responses:
 *       200:
 *         description: Lifestyle trend post records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:           { type: integer }
 *                       post_title:   { type: string }
 *                       url:          { type: string, format: uri }
 *                       category:     { type: string }
 *                       brand_tags:   { type: array, items: { type: string } }
 *                       published_at: { type: string, format: date-time, nullable: true }
 *                       crawled_week: { type: string, example: "2025-W24" }
 *                       raw_data:     { type: object }
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/lifestyle', async (req, res) => { /* ... */ });

/**
 * @swagger
 * /api/v1/lifestyle/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Run BellaNaija lifestyle trends crawler and upsert weekly results
 *     description: >
 *       Crawls BellaNaija for the current ISO week's lifestyle posts and
 *       upserts into `bellanaija_posts` keyed on (url, crawled_week).
 *     responses:
 *       200:
 *         description: Crawl completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:  { type: boolean, example: true }
 *                 inserted: { type: integer, example: 12 }
 *       500:
 *         description: Crawl failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/lifestyle/run', async (req, res) => { /* ... */ });

// ═══════════════════════════════════════════════════════════════════
// REGULATORY UPDATES
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/regulatory:
 *   get:
 *     tags: [Market Data]
 *     summary: Get Nigerian regulatory updates
 *     description: Returns the 30 most recent rows from `regulatory_updates` ordered by crawled_week descending.
 *     responses:
 *       200:
 *         description: Regulatory update records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:           { type: integer }
 *                       agency:       { type: string, example: NAFDAC }
 *                       title:        { type: string }
 *                       url:          { type: string, format: uri }
 *                       category:     { type: string }
 *                       summary:      { type: string }
 *                       published_at: { type: string, format: date-time, nullable: true }
 *                       crawled_week: { type: string, example: "2025-W24" }
 *                       raw_data:     { type: object }
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/regulatory', async (req, res) => { /* ... */ });

/**
 * @swagger
 * /api/v1/regulatory/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Run regulatory updates crawler and upsert weekly results
 *     description: >
 *       Crawls Nigerian regulatory agency websites (e.g. NAFDAC, CBN, SEC)
 *       for the current ISO week and upserts into `regulatory_updates` keyed
 *       on (agency, url).
 *     responses:
 *       200:
 *         description: Crawl completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:  { type: boolean, example: true }
 *                 inserted: { type: integer, example: 8 }
 *       500:
 *         description: Crawl failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/regulatory/run', async (req, res) => { /* ... */ });

// ═══════════════════════════════════════════════════════════════════
// FINTECH UPDATES
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/fintech:
 *   get:
 *     tags: [Market Data]
 *     summary: Get Nigerian fintech / digital ecosystem updates
 *     description: Returns the 30 most recent rows from `digital_ecosystem` ordered by crawled_week descending.
 *     responses:
 *       200:
 *         description: Fintech update records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:           { type: integer }
 *                       source:       { type: string, example: techcabal }
 *                       title:        { type: string }
 *                       url:          { type: string, format: uri }
 *                       topic:        { type: string, example: general }
 *                       summary:      { type: string }
 *                       published_at: { type: string, format: date-time, nullable: true }
 *                       crawled_week: { type: string, example: "2025-W24" }
 *                       raw_data:     { type: object }
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/fintech', async (req, res) => { /* ... */ });

/**
 * @swagger
 * /api/v1/fintech/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Run fintech updates crawler and upsert weekly results
 *     description: >
 *       Crawls fintech news sources (e.g. TechCabal, Nairametrics) for the
 *       current ISO week and upserts into `digital_ecosystem` keyed on
 *       (source, url).
 *     responses:
 *       200:
 *         description: Crawl completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:  { type: boolean, example: true }
 *                 inserted: { type: integer, example: 15 }
 *       500:
 *         description: Crawl failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/fintech/run', async (req, res) => { /* ... */ });

// ═══════════════════════════════════════════════════════════════════
// CPI REPORTS
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/cpi:
 *   get:
 *     tags: [Market Data]
 *     summary: Get NBS Consumer Price Index (CPI) indicators
 *     description: Returns the 20 most recent CPI indicator rows from `nbs_economic_indicators`.
 *     responses:
 *       200:
 *         description: CPI indicator records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:             { type: integer }
 *                       report_type:    { type: string, example: CPI }
 *                       report_month:   { type: string, format: date, example: "2025-05-01" }
 *                       indicator_name: { type: string }
 *                       value:          { type: number }
 *                       unit:           { type: string }
 *                       state:          { type: string, nullable: true }
 *                       raw_data:       { type: object }
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/cpi', async (req, res) => { /* ... */ });

/**
 * @swagger
 * /api/v1/cpi/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Run NBS CPI report crawler and upsert monthly results
 *     description: >
 *       Downloads and parses the latest NBS CPI PDF report, extracting
 *       individual indicators and upserting into `nbs_economic_indicators`
 *       keyed on (report_type, report_month, indicator_name, state). Returns
 *       inserted=0 with diagnostic info if no indicators are found in the PDF.
 *     responses:
 *       200:
 *         description: Crawl completed (check inserted — may be 0 if PDF parsing found nothing)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:   { type: boolean, example: true }
 *                 inserted:  { type: integer, example: 14 }
 *                 message:
 *                   type: string
 *                   nullable: true
 *                   description: Diagnostic message when inserted=0
 *                 rawSample:
 *                   type: string
 *                   nullable: true
 *                   description: Raw PDF text sample to aid debugging when parsing fails
 *                 error:
 *                   type: string
 *                   nullable: true
 *       500:
 *         description: Crawl failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/cpi/run', async (req, res) => { /* ... */ });

// ═══════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     tags: [System]
 *     summary: Health check — latest crawl status for all crawlers
 *     description: >
 *       Returns process uptime and the most recent crawl_log entry per crawler,
 *       so you can quickly see which crawlers are healthy and which have failed.
 *     responses:
 *       200:
 *         description: System health and per-crawler status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 uptime:
 *                   type: number
 *                   description: Process uptime in seconds
 *                   example: 3600
 *                 crawlers:
 *                   type: object
 *                   description: Map of crawler_name → latest crawl_log row
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       crawler_name:  { type: string }
 *                       status:        { type: string, enum: [success, failed, partial] }
 *                       completed_at:  { type: string, format: date-time, nullable: true }
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/health', async (req, res) => { /* ... */ });

// ═══════════════════════════════════════════════════════════════════
// NBS REPORTS
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/nbs:
 *   get:
 *     tags: [Market Data]
 *     summary: Get NBS report listings
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of reports to return
 *     responses:
 *       200:
 *         description: NBS report records ordered by report_id descending
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:           { type: integer }
 *                       report_id:    { type: string }
 *                       title:        { type: string }
 *                       url:          { type: string, format: uri }
 *                       download_url: { type: string, format: uri, nullable: true }
 *                       published_at: { type: string, format: date-time, nullable: true }
 *                       raw_data:     { type: object }
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/nbs', async (req, res) => { /* ... */ });

/**
 * @swagger
 * /api/v1/nbs/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Run NBS report listings crawler and upsert latest results
 *     description: >
 *       Scrapes the NBS website for the 10 most recently published report
 *       listings and upserts them into `nbs_reports` keyed on report_id.
 *     responses:
 *       200:
 *         description: Crawl completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:  { type: boolean, example: true }
 *                 inserted: { type: integer, example: 10 }
 *       500:
 *         description: Crawl failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/nbs/run', async (req, res) => { /* ... */ });

// ═══════════════════════════════════════════════════════════════════
// E‑COMMERCE PRICES
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/ecommerce:
 *   get:
 *     tags: [Market Data]
 *     summary: Get e-commerce price records (Jumia & Konga)
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of records to return
 *     responses:
 *       200:
 *         description: E-commerce price records ordered by crawl_date descending
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:                  { type: integer }
 *                       source_name:         { type: string, example: jumia }
 *                       platform:            { type: string, example: jumia }
 *                       category:            { type: string }
 *                       product_name:        { type: string }
 *                       product_url:         { type: string, format: uri }
 *                       price:               { type: number }
 *                       previous_price:      { type: number, nullable: true }
 *                       price_delta_percent: { type: number, nullable: true }
 *                       flash_sale:          { type: boolean }
 *                       extracted_content:   { type: string }
 *                       key_values:          { type: string }
 *                       crawl_date:          { type: string, format: date }
 *                       raw_data:            { type: object }
 *       500:
 *         description: Server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/ecommerce', async (req, res) => { /* ... */ });

/**
 * @swagger
 * /api/v1/ecommerce/run:
 *   post:
 *     tags: [Market Data]
 *     summary: Run e-commerce prices crawler and upsert latest results
 *     description: >
 *       Crawls Jumia and Konga for up to 50 products across all categories,
 *       deduplicates by (platform, product_url, crawl_date), upserts into
 *       `ecommerce_prices`, then backfills historical rows missing
 *       extracted_content / key_values. Returns inserted=0 with a message if
 *       no products are found.
 *     responses:
 *       200:
 *         description: Crawl completed (check inserted — may be 0 if no products found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:  { type: boolean, example: true }
 *                 inserted: { type: integer, example: 47 }
 *                 message:
 *                   type: string
 *                   nullable: true
 *                   description: Present only when no products were returned
 *       500:
 *         description: Crawl failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/ecommerce/run', async (req, res) => { /* ... */ });

// ═══════════════════════════════════════════════════════════════════
// INSIGHTS SEARCH
// ═══════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /api/v1/insights/search:
 *   get:
 *     tags: [Market Data]
 *     summary: Semantic search over the Nigerian marketing insights knowledge base
 *     description: >
 *       Embeds the query with the configured embedding model, then runs a
 *       pgvector similarity search via the `search_insights` Supabase RPC
 *       function. Returns up to `limit` insights ranked by cosine similarity.
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Natural-language question about Nigerian marketing (e.g. "What drives FMCG purchase decisions?")
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Maximum number of results to return
 *     responses:
 *       200:
 *         description: Ranked insight records with similarity scores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:         { type: integer }
 *                       content:    { type: string }
 *                       category:   { type: string }
 *                       similarity: { type: number, format: float, example: 0.87 }
 *       400:
 *         description: Missing required query parameter "q"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Embedding or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/insights/search', async (req, res) => { /* ... */ });

// ─── SHARED SCHEMAS (add once in your swagger config, not per-route) ───
/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Something went wrong"
 *     ExchangeRate:
 *       type: object
 *       properties:
 *         id:                    { type: integer }
 *         source:                { type: string }
 *         source_name:           { type: string }
 *         currency:              { type: string, example: US DOLLAR }
 *         pair:                  { type: string, example: USD/NGN }
 *         buying_rate:           { type: number }
 *         selling_rate:          { type: number }
 *         central_rate:          { type: number, nullable: true }
 *         rate_date:             { type: string, format: date }
 *         previous_buying_rate:  { type: number, nullable: true }
 *         previous_selling_rate: { type: number, nullable: true }
 *         extracted_content:     { type: string }
 *         key_values:            { type: string }
 *         raw_data:              { type: object }
 */

module.exports = { router, setSupabaseClient };