
import { supabase } from "@/integrations/supabase/client";
import type { RouteAnalytics } from "@/types/analytics";

export const getRouteAnalytics = async (bidId: string): Promise<RouteAnalytics[]> => {
  const { data: routeBids, error: routeBidsError } = await supabase
    .from('route_bids')
    .select('route_id')
    .eq('bid_id', bidId);

  if (routeBidsError) throw routeBidsError;
  if (!routeBids || routeBids.length === 0) return [];

  const { data: routes, error: routesError } = await supabase
    .from('routes')
    .select('id, origin_city, destination_city, equipment_type, commodity, distance')
    .in('id', routeBids.map(rb => rb.route_id));

  if (routesError) throw routesError;
  if (!routes) return [];

  const { data: allRates, error: ratesError } = await supabase
    .from('carrier_route_rates')
    .select(`
      id,
      bid_id,
      route_id,
      carrier_id,
      value,
      carriers(id, name)
    `)
    .eq('bid_id', bidId)
    .not('value', 'is', null);

  if (ratesError) throw ratesError;

  return routes.map(route => {
    const routeRates = allRates ? allRates.filter(rate => rate.route_id === route.id) : [];
    const validRates = routeRates.map(r => r.value);
    
    const average = validRates.length > 0 
      ? validRates.reduce((a, b) => a + b, 0) / validRates.length 
      : null;

    const bestRate = validRates.length > 0 
      ? Math.min(...validRates)
      : null;

    const bestRateCarriers = bestRate !== null 
      ? routeRates
          .filter(r => r.value === bestRate)
          .map(r => ({ id: r.carriers.id, name: r.carriers.name }))
      : [];

    let isOutlier = false;
    if (average !== null && validRates.length >= 3) {
      const mean = average;
      const squareDiffs = validRates.map(value => {
        const diff = value - mean;
        return diff * diff;
      });
      const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
      const stdDev = Math.sqrt(avgSquareDiff);
      
      isOutlier = Math.abs(average - mean) > 2 * stdDev;
    }

    return {
      routeId: route.id,
      origin: route.origin_city,
      destination: route.destination_city,
      equipmentType: route.equipment_type,
      commodity: route.commodity,
      bestRate,
      bestRateCarriers,
      averageRate: average,
      responseCount: routeRates.length,
      isOutlier,
      distance: route.distance
    };
  });
};
