/**
 * test.newsHeadlines.js
 * Run with: node test.newsHeadlines.js
 */

import { fetchNewsHeadlines } from "./src/crawlers/daily/newsHeadlines.js";

console.log("Testing News Headlines RSS crawler...\n");

try {
  const result = await fetchNewsHeadlines();

  console.log("✅ Success!\n");
  console.log(`🕐 Fetched       : ${result.fetchedAt}`);
  console.log(`📰 Total         : ${result.totalHeadlines} headlines`);
  console.log(`❌ Failed sources: ${result.failedSources}`);
  console.log("\n" + "─".repeat(55));

  // Print top 3 headlines per source
  for (const [name, data] of Object.entries(result.bySource)) {
    const icon = data.status === "ok" ? "✅" : "❌";
    console.log(`\n${icon} ${name} (${data.category}) — ${data.count} headlines`);

    if (data.status === "error") {
      console.log(`   Error: ${data.error}`);
      continue;
    }

    data.headlines.slice(0, 3).forEach((h, i) => {
      console.log(`\n   ${i + 1}. ${h.title}`);
      if (h.publishedAt) console.log(`      📅 ${h.publishedAt}`);
      if (h.summary)     console.log(`      📝 ${h.summary.slice(0, 120)}...`);
      if (h.url)         console.log(`      🔗 ${h.url}`);
    });
  }

  console.log("\n" + "─".repeat(55));
  console.log(`\nLatest 5 headlines across all sources (sorted by date):`);
  result.allHeadlines.slice(0, 5).forEach((h, i) => {
    console.log(`\n${i + 1}. [${h.source}] ${h.title}`);
    console.log(`   📅 ${h.publishedAt}`);
  });

} catch (err) {
  console.error("❌ Test failed:", err.message);
  process.exit(1);
}