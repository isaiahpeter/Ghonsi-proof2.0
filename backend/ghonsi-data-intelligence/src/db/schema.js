// src/db/schema.js
export function initialiseDatabase(db) {
  db.exec(`
    -- ========== DAILY TABLES ==========

    CREATE TABLE IF NOT EXISTS exchange_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'exchange_rate',
      source_name TEXT NOT NULL,
      currency TEXT NOT NULL,
      pair TEXT NOT NULL,
      buying_rate REAL,
      central_rate REAL,
      selling_rate REAL,
      previous_buying_rate REAL,
      previous_selling_rate REAL,
      rate_date TEXT NOT NULL,
      published_at TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      extracted_content TEXT NOT NULL,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(source_name, currency, rate_date)
    );
    CREATE INDEX idx_exchange_source_date ON exchange_rates(source_name, rate_date);

    CREATE TABLE IF NOT EXISTS fuel_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'fuel_price',
      source_name TEXT NOT NULL DEFAULT 'NNPCL',
      price_per_litre REAL NOT NULL,
      previous_price REAL,
      percentage_change REAL,
      price_date TEXT NOT NULL,
      published_at TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      extracted_content TEXT NOT NULL,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(price_date)
    );

    CREATE TABLE IF NOT EXISTS google_trends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'trend',
      source_name TEXT NOT NULL DEFAULT 'google_trends_ng',
      pull_time_slot TEXT NOT NULL,
      pull_date TEXT NOT NULL,
      rank INTEGER NOT NULL,
      query TEXT NOT NULL,
      traffic_volume TEXT,
      published_at TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      extracted_content TEXT NOT NULL,
      related_queries TEXT,
      articles TEXT,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(pull_date, pull_time_slot, rank)
    );

    CREATE TABLE IF NOT EXISTS news_headlines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'news_headline',
      source_name TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      published_at TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      summary TEXT,
      extracted_content TEXT NOT NULL,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(source_name, url)
    );
    CREATE INDEX idx_news_source_date ON news_headlines(source_name, fetched_at);

    CREATE TABLE IF NOT EXISTS ecommerce_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'price_data',
      source_name TEXT NOT NULL,
      category TEXT,
      product_name TEXT NOT NULL,
      product_url TEXT NOT NULL,
      price REAL NOT NULL,
      previous_price REAL,
      flash_sale INTEGER DEFAULT 0,
      price_date TEXT NOT NULL,
      published_at TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      extracted_content TEXT NOT NULL,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(source_name, product_url, price_date)
    );

    -- ========== WEEKLY TABLES ==========

    CREATE TABLE IF NOT EXISTS nairaland_threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'sentiment_signal',
      source_name TEXT NOT NULL DEFAULT 'nairaland',
      section TEXT NOT NULL,
      thread_title TEXT NOT NULL,
      url TEXT NOT NULL,
      reply_count INTEGER,
      crawled_week TEXT NOT NULL,
      published_at TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      extracted_content TEXT NOT NULL,
      brand_mentions TEXT,
      product_mentions TEXT,
      sentiment_label TEXT,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(url, crawled_week)
    );
    CREATE INDEX idx_nairaland_week ON nairaland_threads(crawled_week);

    CREATE TABLE IF NOT EXISTS bellanaija_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'lifestyle_trend',
      source_name TEXT NOT NULL DEFAULT 'bellanaija',
      post_title TEXT NOT NULL,
      url TEXT NOT NULL,
      category TEXT,
      brand_tags TEXT,
      published_at TEXT,
      crawled_week TEXT NOT NULL,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      extracted_content TEXT NOT NULL,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(url, crawled_week)
    );

    CREATE TABLE IF NOT EXISTS regulatory_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'regulatory_update',
      source_name TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT,
      category TEXT,
      summary TEXT,
      published_at TEXT,
      crawled_week TEXT NOT NULL,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      extracted_content TEXT NOT NULL,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(source_name, url)
    );

    CREATE TABLE IF NOT EXISTS digital_ecosystem (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'fintech_update',
      source_name TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT,
      topic TEXT,
      summary TEXT,
      published_at TEXT,
      crawled_week TEXT NOT NULL,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      extracted_content TEXT NOT NULL,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(source_name, url)
    );

    -- ========== MONTHLY TABLES ==========

    CREATE TABLE IF NOT EXISTS nbs_economic_indicators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'economic_indicator',
      source_name TEXT NOT NULL DEFAULT 'NBS',
      report_type TEXT NOT NULL,
      report_month TEXT NOT NULL,
      indicator_name TEXT,
      value REAL,
      previous_value REAL,
      unit TEXT,
      state TEXT,
      published_at TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      extracted_content TEXT NOT NULL,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(report_type, report_month, indicator_name, state)
    );

    CREATE TABLE IF NOT EXISTS efina_research (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'research_report',
      source_name TEXT NOT NULL DEFAULT 'EFInA',
      report_title TEXT NOT NULL,
      publication_date TEXT,
      category TEXT,
      key_findings TEXT,
      published_at TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      extracted_content TEXT NOT NULL,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(report_title, publication_date)
    );

    CREATE TABLE IF NOT EXISTS tech_ecosystem_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'tech_report',
      source_name TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT,
      summary TEXT,
      published_at TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      extracted_content TEXT NOT NULL,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(source_name, url)
    );

    -- ========== QUARTERLY TABLES ==========

    CREATE TABLE IF NOT EXISTS mpc_decisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'monetary_policy',
      source_name TEXT NOT NULL DEFAULT 'CBN_MPC',
      meeting_date TEXT NOT NULL,
      interest_rate REAL,
      previous_interest_rate REAL,
      cash_reserve_ratio REAL,
      liquidity_ratio REAL,
      outlook_statement TEXT,
      published_at TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      extracted_content TEXT NOT NULL,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(meeting_date)
    );

    CREATE TABLE IF NOT EXISTS gdp_sector_performance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'gdp_report',
      source_name TEXT NOT NULL DEFAULT 'NBS',
      report_quarter TEXT NOT NULL,
      sector TEXT,
      growth_rate REAL,
      previous_growth_rate REAL,
      contribution_to_gdp REAL,
      published_at TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      extracted_content TEXT NOT NULL,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(report_quarter, sector)
    );

    CREATE TABLE IF NOT EXISTS financial_stability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'financial_stability_report',
      source_name TEXT NOT NULL DEFAULT 'CBN',
      report_period TEXT NOT NULL,
      indicator TEXT,
      value REAL,
      previous_value REAL,
      commentary TEXT,
      published_at TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      extracted_content TEXT NOT NULL,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(report_period, indicator)
    );

    CREATE TABLE IF NOT EXISTS advertising_spend (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL DEFAULT 'advertising_data',
      source_name TEXT NOT NULL DEFAULT 'APCON',
      report_quarter TEXT NOT NULL,
      sector TEXT,
      spend_amount REAL,
      previous_spend_amount REAL,
      media_channel TEXT,
      channel_performance TEXT,
      published_at TEXT,
      fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
      extracted_content TEXT NOT NULL,
      key_values TEXT,
      raw_data TEXT,
      UNIQUE(report_quarter, sector, media_channel)
    );

    -- ========== OBSERVABILITY ==========

    CREATE TABLE IF NOT EXISTS crawl_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crawler_name TEXT NOT NULL,
      data_type TEXT NOT NULL,
      status TEXT NOT NULL,
      records_inserted INTEGER DEFAULT 0,
      error_message TEXT,
      started_at TEXT NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

