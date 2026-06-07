import * as cheerio from 'cheerio';

// Test 3 known real IDs
for (const id of [1123, 1122, 1100]) {
  const res = await fetch(`https://nigerianstat.gov.ng/elibrary/read/${id}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // Find h2s that are NOT nav/sidebar items
  const h2s = [];
  $('h2').each((_, el) => {
    const text = $(el).text().trim();
    if (!['Data Release Calendar','Notifications','Highlights'].includes(text)) {
      h2s.push({ class: $(el).attr('class') || 'none', text: text.substring(0, 100) });
    }
  });

  // Also check the page's <title> tag
  const pageTitle = $('title').text().replace('| National Bureau of Statistics','').replace('Reports','').trim();

  console.log(`\n--- ID ${id} ---`);
  console.log('title tag:', pageTitle);
  console.log('candidate h2s:', JSON.stringify(h2s));

  // Print parent containers of download link to find title nearby
  const dlLink = $('a[href*="/download/"]').first();
  if (dlLink.length) {
    const parent = dlLink.closest('div, section, article');
    console.log('download parent class:', parent.attr('class'));
    console.log('download parent h2/h3:', parent.find('h2,h3').first().text().trim().substring(0,100));
    console.log('download parent p:', parent.find('p').first().text().trim().substring(0,100));
  }
}
