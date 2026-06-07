export async function fetchMPCDecisions() {
  return {
    source: 'CBN MPC',
    fetchedAt: new Date().toISOString(),
    freshness: 'unavailable',
    error: 'Not yet implemented – needs PDF parser for https://www.cbn.gov.ng/MonetaryPolicy/MPC.asp',
    indicators: [],
  };
}

