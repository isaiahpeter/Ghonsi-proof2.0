export async function fetchAPCONSpend() {
  return {
    source: 'APCON Ad Spend',
    fetchedAt: new Date().toISOString(),
    freshness: 'unavailable',
    error: 'Not yet implemented – needs PDF parser',
    indicators: [],
  };
}

