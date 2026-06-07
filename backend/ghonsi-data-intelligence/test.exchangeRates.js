/**
 * test.exchangeRates.js
 * Run with: node test.exchangeRates.js
 */

import { fetchCBNRates } from "./src/crawlers/daily/exchangeRates.js";

console.log("Testing CBN Exchange Rates crawler...\n");

try {
  const result = await fetchCBNRates();

  console.log("✅ Success!\n");
  console.log(`📡 Source    : ${result.source}`);
  console.log(`🔗 URL       : ${result.sourceUrl}`);
  console.log(`🕐 Fetched   : ${result.fetchedAt}`);
  console.log(`📊 Freshness : ${result.freshness}`);
  console.log("\nOfficial CBN Rates (NGN):");
  console.log("─".repeat(55));

  for (const [code, rate] of Object.entries(result.rates)) {
    if (!rate) {
      console.log(`\n${code}/NGN — ❌ Failed to fetch`);
      continue;
    }
    console.log(`\n${rate.pair}`);
    console.log(`   📅 Date         : ${rate.date}`);
    console.log(`   📈 Buying Rate  : ₦${rate.buyingRate?.toLocaleString() ?? "N/A"}`);
    console.log(`   ⚖️  Central Rate : ₦${rate.centralRate?.toLocaleString() ?? "N/A"}`);
    console.log(`   📉 Selling Rate : ₦${rate.sellingRate?.toLocaleString() ?? "N/A"}`);
  }

  console.log("\n" + "─".repeat(55));
  console.log("\nFull result object:");
  console.log(JSON.stringify(result, null, 2));

} catch (err) {
  console.error("❌ Test failed:", err.message);
  process.exit(1);
}