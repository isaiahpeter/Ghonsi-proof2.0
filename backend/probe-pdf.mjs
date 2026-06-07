import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const res = await fetch('https://nigerianstat.gov.ng/download/1239', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
});
const buffer = Buffer.from(await res.arrayBuffer());

const parser = new PDFParse({ data: buffer });
const result = await parser.getText();
console.log('Pages:', result.pages.length);
console.log('Sample text:', result.text.substring(0, 800));
