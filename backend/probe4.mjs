import * as cheerio from 'cheerio';

const res = await fetch('https://nigerianstat.gov.ng/elibrary/read/1123', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
});
const html = await res.text();
const $ = cheerio.load(html);

// Dump ALL headings
console.log('=== ALL HEADINGS ===');
$('h1,h2,h3,h4,h5').each((i, el) => {
  console.log(`${el.tagName} [${$(el).attr('class') || ''}]:`, $(el).text().trim().substring(0, 120));
});

// Dump main content area candidates
console.log('\n=== MAIN/ARTICLE/SECTION text ===');
$('main, article, .content, .main-content, #content, .container').first().find('p,h1,h2,h3,h4,span').slice(0,10).each((i, el) => {
  const t = $(el).text().trim();
  if (t.length > 5) console.log(`  ${el.tagName}:`, t.substring(0, 120));
});

// Check what IDs actually appear in links on the listing page
console.log('\n=== CHECKING LISTING PAGE FOR ID RANGE ===');
const res2 = await fetch('https://nigerianstat.gov.ng/elibrary', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
});
const html2 = await res2.text();
const $2 = cheerio.load(html2);
const ids = [];
$2('a[href*="/elibrary/read/"]').each((_, el) => {
  const m = ($2(el).attr('href') || '').match(/\/elibrary\/read\/(\d+)/);
  if (m) ids.push(parseInt(m[1]));
});
ids.sort((a,b) => b - a);
console.log('Total IDs found:', ids.length);
console.log('Top 10 IDs:', ids.slice(0, 10));
console.log('Bottom 5 IDs:', ids.slice(-5));
