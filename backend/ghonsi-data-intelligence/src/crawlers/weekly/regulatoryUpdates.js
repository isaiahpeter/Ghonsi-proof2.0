import * as cheerio from 'cheerio';

const SOURCES = [
  {
    agency: 'APCON',
    url: 'https://www.apcon.gov.ng/news',
    // Selector for the main content area
    containerSel: 'main, .content-area, .site-content, #main',
    itemSel: 'article, .post, .news-item, .entry',
    titleSel: 'h2 a, h3 a, .entry-title a',
  },
  {
    agency: 'FCCPC',
    // Correct URL from diagnostic
    url: 'https://fccpc.gov.ng/resources-library/publications/',
    containerSel: 'main, .content-area, .entry-content, #main',
    // We only want links that look like real publications, not navigation items
    itemSel: 'a[href*="resources-library/publications/"], a[href*="wp-content/uploads/"]',
    titleSel: '', // the <a> itself is the title element
  },
  {
    agency: 'NAFDAC',
    // Try the /news/ path (NAFDAC's site usually uses /news/)
    url: 'https://nafdac.gov.ng/news/',
    containerSel: 'main, .content-area, #main',
    itemSel: 'article, .post, .news-item, .entry',
    titleSel: 'h2 a, h3 a, .entry-title a',
  },
];

export async function fetchRegulatoryUpdates() {
  const results = [];
  for (const src of SOURCES) {
    try {
      const res = await fetch(src.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GhonsiBot/1.0)' }
      });
      if (!res.ok) {
        console.warn(`[regulatory] ${src.agency} returned ${res.status}`);
        continue;
      }
      const html = await res.text();
      const $ = cheerio.load(html);
      const container = $(src.containerSel).first().length ? $(src.containerSel).first() : $('body');

      // For FCCPC, the item selector is directly on <a> tags
      if (src.agency === 'FCCPC') {
        container.find(src.itemSel).each((i, el) => {
          const title = $(el).text().trim();
          const link = $(el).attr('href');
          // Filter out short navigation links
          if (title && link && title.length > 15) {
            results.push({
              title,
              url: link.startsWith('http') ? link : new URL(link, src.url).href,
              summary: '',
              agency: src.agency,
              category: 'general',
            });
          }
        });
      } else {
        // Standard article extraction for APCON and NAFDAC
        container.find(src.itemSel).each((i, el) => {
          const titleEl = $(el).find(src.titleSel).first();
          const title = titleEl.text().trim();
          const link = titleEl.attr('href');
          if (!title || !link || title.length < 10) return;
          results.push({
            title,
            url: link.startsWith('http') ? link : new URL(link, src.url).href,
            summary: $(el).find('.excerpt, .summary, p').first().text().trim(),
            agency: src.agency,
            category: 'general',
          });
        });
      }
      console.log(`[regulatory] ${src.agency}: ${results.length} items extracted`);
    } catch (err) {
      console.warn(`[regulatory] ${src.agency} failed: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return {
    fetchedAt: new Date().toISOString(),
    freshness: 'this week',
    totalItems: results.length,
    items: results,
  };
}