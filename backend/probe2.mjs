import * as cheerio from 'cheerio';

// Probe the most recent publication detail page
const res = await fetch('https://nigerianstat.gov.ng/elibrary/read/1123', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
});
const html = await res.text();
const $ = cheerio.load(html);

// Print page title + any likely metadata containers
console.log('Title tag:', $('title').text().trim());
console.log('h1:', $('h1').first().text().trim());
console.log('h2:', $('h2').first().text().trim());
console.log('h3:', $('h3').first().text().trim());

// Look for date, category, description
$('[class*="date"], [class*="category"], [class*="meta"], [class*="publish"], [class*="desc"]').each((i, el) => {
  console.log(`[${$(el).attr('class')}]:`, $(el).text().trim().substring(0, 120));
});

// Any download/PDF links on the detail page?
console.log('\n--- Download links ---');
$('a[href*="download"], a[href*=".pdf"], a[href*="file"]').each((i, el) => {
  console.log($(el).text().trim(), '->', $(el).attr('href'));
});
