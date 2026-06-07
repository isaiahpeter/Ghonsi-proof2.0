import fetch from "node-fetch";
import * as cheerio from "cheerio";

const html = await fetch(
  "https://fccpc.gov.ng/resources-library/publications/"
).then(r => r.text());

const $ = cheerio.load(html);

$("a").each((_, el) => {
  const text = $(el).text().trim();
  const href = $(el).attr("href");

  if (text.length > 30) {
    console.log({
      text,
      href,
    });
  }
});