// src/crawlers/daily/fuelPrices.js
import * as cheerio from 'cheerio';

const SOURCE = 'depotdata.ng';
const SOURCE_URL = 'https://depotdata.ng';

export async function fetchFuelPrices() {
  const fetchedAt = new Date().toISOString();
  try {
    const response = await fetch(SOURCE_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Find the main price table. The page has a table with headers: Depot, AGO, PMS, DPK, ATK.
    // The rows contain depot name and price cells.
    const rows = [];
    $('table tr').each((i, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 4) { // at least Depot, AGO, PMS, DPK
        const depotName = $(cells[0]).text().trim();
        const agoText = $(cells[1]).text().trim();
        const pmsText = $(cells[2]).text().trim();
        const dpkText = $(cells[3]).text().trim();
        const atkText = cells.length >= 5 ? $(cells[4]).text().trim() : '';

        const parsePrice = (text) => {
          if (!text || text === '—' || text === '-' || text === '') return null;
          const cleaned = text.replace(/,/g, '').replace(/₦/g, '');
          const num = parseFloat(cleaned);
          return isNaN(num) ? null : num;
        };

        rows.push({
          depot: depotName,
          ago: parsePrice(agoText),
          pms: parsePrice(pmsText),
          dpk: parsePrice(dpkText),
          atk: parsePrice(atkText),
        });
      }
    });

    if (rows.length === 0) throw new Error('No price rows found');

    // Find specific depots
    const findDepot = (name) => rows.find(r => r.depot.toLowerCase().includes(name.toLowerCase())) || null;
    const dangote = findDepot('dangote1');
    const nnpc = findDepot('nnpc depot') || rows.find(r => r.depot.toLowerCase().includes('nnpc'));
    const matrix = findDepot('matrix energy');
    const pinnacle = findDepot('pinnacle oil');
    const rain = findDepot('rain oil');

    // Calculate average PMS price across all depots with a valid >0 PMS price
    const validPMS = rows.filter(r => r.pms && r.pms > 0).map(r => r.pms);
    const averagePMS = validPMS.length > 0
      ? Math.round((validPMS.reduce((a, b) => a + b, 0) / validPMS.length) * 100) / 100
      : null;

    // Primary price: Dangote PMS (most referenced)
    const primaryPrice = dangote?.pms ?? nnpc?.pms ?? matrix?.pms ?? averagePMS;
    const dateStr = fetchedAt.split('T')[0];

    const result = {
      source: SOURCE,
      sourceUrl: SOURCE_URL,
      fetchedAt,
      freshness: primaryPrice !== null ? 'today' : 'unavailable',
      price: primaryPrice,
      currency: 'NGN',
      details: {
        dangote: { pms: dangote?.pms ?? null, ago: dangote?.ago ?? null, dpk: dangote?.dpk ?? null },
        nnpc: { pms: nnpc?.pms ?? null, ago: nnpc?.ago ?? null },
        matrix: { pms: matrix?.pms ?? null },
        pinnacle: { pms: pinnacle?.pms ?? null },
        rain: { pms: rain?.pms ?? null },
        averagePMS,
      },
      extracted_content: primaryPrice !== null
        ? `Dangote PMS: ₦${primaryPrice}/litre, Average PMS: ₦${averagePMS}/litre as at ${dateStr}.`
        : `Fuel price data unavailable from depotdata.ng on ${dateStr}.`,
      key_values: JSON.stringify({
        dangote_pms: dangote?.pms ?? null,
        average_pms: averagePMS,
        nnpc_pms: nnpc?.pms ?? null,
        matrix_pms: matrix?.pms ?? null,
        date: dateStr,
      }),
    };

    return result;
  } catch (error) {
    console.error('[fuelPrices] Fetch error:', error.message);
    return {
      source: SOURCE,
      sourceUrl: SOURCE_URL,
      fetchedAt,
      freshness: 'unavailable',
      price: null,
      currency: 'NGN',
      details: null,
      extracted_content: `Fuel price fetch failed: ${error.message}`,
      key_values: JSON.stringify({ error: error.message }),
    };
  }
}

