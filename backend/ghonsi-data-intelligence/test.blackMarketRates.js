/**
 * test.blackMarketRates.js
 * Run with: node test.blackMarketRates.js
 */

import { fetchBlackMarketRates } from "./src/crawlers/daily/blackMarketRates.js";

console.log("Testing Parallel Market Rates crawler...\n");

try {
  const result = await fetchBlackMarketRates();

  console.log("✅ Success!\n");
  console.log(`📡 Source    : ${result.source}`);
  console.log(`🏪 Market    : ${result.market}`);
  console.log(`🕐 Fetched   : ${result.fetchedAt}`);
  console.log(`📊 Freshness : ${result.freshness}`);
  console.log("\nParallel Market Rates (NGN):");
  console.log("─".repeat(55));

  for (const [code, rate] of Object.entries(result.rates)) {
    const change = rate.changePercent != null
      ? `${rate.changePercent > 0 ? "↑" : "↓"} ${Math.abs(rate.changePercent)}%`
      : "N/A";

    const spread = rate.sellRate && rate.buyRate
      ? `₦${(rate.sellRate - rate.buyRate).toFixed(2)} spread`
      : "";

    console.log(`\n${rate.pair}`);
    console.log(`   📈 Buy Rate  : ₦${rate.buyRate?.toLocaleString() ?? "N/A"}`);
    console.log(`   📉 Sell Rate : ₦${rate.sellRate?.toLocaleString() ?? "N/A"}`);
    console.log(`   🏦 CBN Rate  : ₦${rate.cbnRate?.toLocaleString() ?? "N/A"}`);
    console.log(`   📊 Change    : ${change}  ${spread}`);

    if (rate.cbnRate && rate.sellRate) {
      const premium = ((rate.sellRate - rate.cbnRate) / rate.cbnRate * 100).toFixed(2);
      console.log(`   💹 Black Mkt Premium: ${premium}% above CBN`);
    }
  }

  console.log("\n" + "─".repeat(55));
  console.log("\nFull result object:");
  console.log(JSON.stringify(result, null, 2));

} catch (err) {
  console.error("❌ Test failed:", err.message);
  process.exit(1);
}