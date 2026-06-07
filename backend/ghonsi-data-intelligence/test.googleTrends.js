/**
 * test.googleTrends.js
 * Run with: node test.googleTrends.js
 */

import { fetchDailyTrends } from "./src/crawlers/daily/googleTrends.js";

console.log("Testing Google Trends Nigeria RSS crawler...\n");

try {
  const result = await fetchDailyTrends({ limit: 20 });

  console.log("✅ Success!\n");
  console.log(`📍 Country : ${result.geo}`);
  console.log(`🕐 Fetched : ${result.fetchedAt}`);
  console.log(`📊 Trends  : ${result.totalFetched}`);
  console.log("\nTop 20 Trending Searches in Nigeria:");
  console.log("─".repeat(55));

  result.trends.forEach((t) => {
    console.log(`\n#${t.rank} — ${t.query} (${t.trafficVolume})`);
    if (t.pubDate) console.log(`   📅 ${t.pubDate}`);
    if (t.articles.length > 0) {
      console.log(`   📰 ${t.articles[0].title}`);
      console.log(`      Source: ${t.articles[0].source}`);
      console.log(`      URL:    ${t.articles[0].url}`);
    }
  });

  console.log("\n" + "─".repeat(55));
  console.log("\nSample full trend object (first result):");
  console.log(JSON.stringify(result.trends[0], null, 2));

} catch (err) {
  console.error("❌ Test failed:", err.message);
  process.exit(1);
}