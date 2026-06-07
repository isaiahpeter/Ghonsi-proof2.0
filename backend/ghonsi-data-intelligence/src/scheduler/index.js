import cron from 'node-cron';

import { fetchDailyTrends } from '../crawlers/daily/googleTrends.js';
import { fetchCBNRates } from '../crawlers/daily/exchangeRates.js';
import { fetchBlackMarketRates } from '../crawlers/daily/blackMarketRates.js';
import { fetchNewsHeadlines } from '../crawlers/daily/newsHeadlines.js';
import { fetchConsumerSentiment } from '../crawlers/weekly/consumerSentiment.js';
import { fetchLifestyleTrends } from '../crawlers/weekly/lifestyleTrends.js';
import { fetchRegulatoryUpdates } from '../crawlers/weekly/regulatoryUpdates.js';
import { fetchFintechUpdates } from '../crawlers/weekly/fintechUpdates.js';

async function runAndLog(name, fetchFn) {
  console.log(`[scheduler] ${name}: starting`);
  try {
    const data = await fetchFn();
    console.log(`[scheduler] ${name}: fetched successfully`);
    return data;
  } catch (err) {
    console.error(`[scheduler] ${name}: FAILED - ${err.message}`);
  }
}

export function startScheduler() {
  console.log('[scheduler] Starting all cron jobs (WAT timezone)...');

  // Daily
  cron.schedule('0 7,12,17 * * *', () => runAndLog('googleTrends', () => fetchDailyTrends({ geo: 'NG' })), { timezone: 'Africa/Lagos' });
  cron.schedule('0 8 * * *', () => runAndLog('cbnRates', () => fetchCBNRates()), { timezone: 'Africa/Lagos' });
  cron.schedule('0 7,19 * * *', () => runAndLog('blackMarket', fetchBlackMarketRates), { timezone: 'Africa/Lagos' });
  cron.schedule('0 6 * * *', () => runAndLog('news', fetchNewsHeadlines), { timezone: 'Africa/Lagos' });

  // Weekly (Monday 6am WAT)
  cron.schedule('0 5 * * 1', () => {
    runAndLog('nairaland', fetchConsumerSentiment);
    runAndLog('bellanaija', fetchLifestyleTrends);
    runAndLog('regulatory', fetchRegulatoryUpdates);
    runAndLog('fintech', fetchFintechUpdates);
  }, { timezone: 'Africa/Lagos' });

  console.log('[scheduler] All schedules activated.');
}

