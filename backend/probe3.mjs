import { fetchNBSReports } from './ghonsi-data-intelligence/src/crawlers/weekly/nbsReports.js';
const result = await fetchNBSReports({ limit: 5 });
console.log(JSON.stringify(result, null, 2));
