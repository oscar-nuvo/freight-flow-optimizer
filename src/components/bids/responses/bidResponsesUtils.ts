
/**
 * Helper to get the latest unique carrier responses.
 * Returns a list with only the latest (by submitted_at then version) response per carrier.
 */
export function filterLatestCarrierResponses(responses: any[]): any[] {
  const latestByCarrier = new Map<string, any>();

  for (const resp of responses) {
    // Prefer submitted_at timestamp, fallback to version
    const carrierId = resp.carrier_id;
    const existing = latestByCarrier.get(carrierId);

    const isLater = (() => {
      if (!existing) return true;
      const dateA = resp.submitted_at ? new Date(resp.submitted_at).getTime() : 0;
      const dateB = existing.submitted_at ? new Date(existing.submitted_at).getTime() : 0;
      if (dateA !== dateB) return dateA > dateB;
      // If timestamp ties, fall back to version
      return (resp.version || 0) > (existing.version || 0);
    })();

    if (isLater) {
      latestByCarrier.set(carrierId, resp);
    }
  }

  return Array.from(latestByCarrier.values());
}
