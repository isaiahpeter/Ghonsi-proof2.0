import { fetchCPIReport } from './ghonsi-data-intelligence/src/crawlers/weekly/cpiReports.js';
const result = await fetchCPIReport();
console.log(JSON.stringify(result, null, 2));
