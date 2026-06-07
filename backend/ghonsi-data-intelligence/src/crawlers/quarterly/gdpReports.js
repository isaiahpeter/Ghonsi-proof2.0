export async function fetchGDPReports() {
  return {
    source: 'NBS GDP',
    fetchedAt: new Date().toISOString(),
    freshness: 'unavailable',
    error: 'Not yet implemented – needs PDF parser for NBS GDP reports',
    indicators: [],
  };
}

