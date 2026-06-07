/**
 * exchangeRates.js
 * ----------------
 * Fetches official exchange rates from the CBN JSON API.
 *
 * Endpoint: https://www.cbn.gov.ng/api/GetAllExchangeRates?format=json
 * Cost:     Free, public — no API key required
 * Schedule: Once daily at 9am WAT (per brief)
 *
 * The API returns ~8MB of historical data for all currencies.
 * We filter to the most recent date only and extract USD, EUR, GBP.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const CBN_API_URL = "https://www.cbn.gov.ng/api/GetAllExchangeRates?format=json";

const TARGET_CURRENCIES = ["US DOLLAR", "EURO", "POUNDS STERLING"];

const CURRENCY_CODE_MAP = {
  "US DOLLAR":          "USD",
  "EURO":               "EUR",
  "POUNDS STERLING":    "GBP",
  "YEN":                "JPY",
  "YUAN/RENMINBI":      "CNY",
  "SWISS FRANC":        "CHF",
  "DANISH KRONA":       "DKK",
  "RIYAL":              "SAR",
  "UAE DIRHAM":         "AED",
  "SOUTH AFRICAN RAND": "ZAR",
  "CFA":                "XOF",
  "SDR":                "XDR",
  "WAUA":               "WAUA",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRate(val) {
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
}

// ─── Data Extractor ───────────────────────────────────────────────────────────

/**
 * From the full historical array, finds the most recent date,
 * then extracts target currencies from that date only.
 *
 * @param {object[]} records
 * @param {string[]} currencies - CBN currency names to extract
 * @returns {Record<string, CurrencyRate>}
 */
function extractLatestRates(records, currencies) {
  // Step 1: find the most recent ratedate in the dataset
  const latestDate = records.reduce((max, r) => {
    return r.ratedate > max ? r.ratedate : max;
  }, "");

  // Step 2: filter to only that date, then extract target currencies
  const rates = {};

  for (const record of records) {
    if (record.ratedate !== latestDate) continue;

    const name = record.currency?.toUpperCase();
    if (!currencies.includes(name)) continue;

    const code = CURRENCY_CODE_MAP[name] ?? name;

    rates[code] = {
      currency: code,
      currencyName: name,
      pair: `${code}/NGN`,
      date: record.ratedate,
      buyingRate:  parseRate(record.buyingrate),
      centralRate: parseRate(record.centralrate), // official rate
      sellingRate: parseRate(record.sellingrate),
      source: "CBN",
      sourceUrl: CBN_API_URL,
    };
  }

  return rates;
}

// ─── Main Fetcher ─────────────────────────────────────────────────────────────

/**
 * @param {object}   options
 * @param {string[]} [options.currencies]
 * @param {number}   [options.retries]
 * @param {number}   [options.retryDelay]
 * @returns {Promise<ExchangeRateResult>}
 */
export async function fetchCBNRates({
  currencies = TARGET_CURRENCIES,
  retries = 3,
  retryDelay = 5000,
} = {}) {
  console.log(`[exchangeRates] Fetching from CBN API...`);

  let lastError;
  const fetchedAt = new Date();

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(CBN_API_URL);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("CBN API returned empty or invalid data");
      }

      const rates = extractLatestRates(data, currencies);
      const successful = Object.values(rates).filter(Boolean).length;

      console.log(`[exchangeRates] Done. ${successful}/${currencies.length} rates retrieved.`);

      return {
        source: "CBN",
        sourceUrl: CBN_API_URL,
        fetchedAt: fetchedAt.toISOString(),
        freshness: "today",
        rates,
      };
    } catch (err) {
      lastError = err;
      console.warn(`[exchangeRates] Attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) await sleep(retryDelay);
    }
  }

  throw new Error(`[exchangeRates] All ${retries} attempts failed: ${lastError?.message}`);
}

// ─── Scheduled Pull ───────────────────────────────────────────────────────────

export async function runCBNRatesPull() {
  console.log(`[exchangeRates] Starting pull at ${new Date().toISOString()}`);
  return await fetchCBNRates();
}
