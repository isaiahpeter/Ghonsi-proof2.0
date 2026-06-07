export async function fetchFinancialStability() {
  return {
    source: 'CBN Financial Stability',
    fetchedAt: new Date().toISOString(),
    freshness: 'unavailable',
    error: 'Not yet implemented – needs PDF parser',
    indicators: [],
  };
}

