import * as cheerio from 'cheerio';

const res = await fetch('https://nigerianstat.gov.ng/elibrary', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
});
const html = await res.text();
const $ = cheerio.load(html);

console.log('Title:', $('title').text());

const pdfs = $('a[href*=".pdf"]');
console.log('PDF links:', pdfs.length);
pdfs.each((i, el) => {
  console.log($(el).text().trim().substring(0, 80), '->', $(el).attr('href').substring(0, 100));
});

if (pdfs.length === 0) {
  console.log('No PDFs. All links:');
  $('a').each((i, el) => {
    const h = $(el).attr('href') || '';
    if (h.length > 5) console.log($(el).text().trim().substring(0, 50), '->', h.substring(0, 80));
  });
}
