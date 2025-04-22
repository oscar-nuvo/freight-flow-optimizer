
import { supabase } from "@/integrations/supabase/client";
import type { AverageRateAnalytics } from "@/types/analytics";

export const getAverageRateAnalytics = async (bidId: string): Promise<AverageRateAnalytics> => {
  // Get all routes with their distances
  const { data: routes, error: routesError } = await supabase
    .from('routes')
    .select('id, distance')
    .eq('is_deleted', false);

  if (routesError) throw routesError;

  // Create a map of route IDs to distances
  const routeDistances = new Map<string, number>();
  routes?.forEach(route => {
    if (route.distance) {
      routeDistances.set(route.id, route.distance);
    }
  });

  // Get all rates for this bid
  const { data: rates, error: ratesError } = await supabase
    .from('carrier_route_rates')
    .select(`
      value,
      route_id
    `)
    .eq('bid_id', bidId)
    .not('value', 'is', null);

  if (ratesError) throw ratesError;
  if (!rates) return { weightedAveragePerMile: null, totalResponses: 0, nationalAverageComparison: null, nationalAverage: null };

  // Calculate per-mile rates
  const ratesWithDistance = rates.map(rate => {
    const distance = routeDistances.get(rate.route_id);
    return {
      value: rate.value,
      perMileRate: distance ? rate.value / distance : null,
      distance
    };
  }).filter(rate => rate.perMileRate !== null);

  const totalResponses = ratesWithDistance.length;
  
  if (totalResponses === 0) {
    return {
      weightedAveragePerMile: null,
      totalResponses: 0,
      nationalAverageComparison: null,
      nationalAverage: null
    };
  }

  // Calculate weighted average per mile
  const totalDistance = ratesWithDistance.reduce((sum, rate) => sum + (rate.distance || 0), 0);
  const weightedSum = ratesWithDistance.reduce((sum, rate) => {
    return sum + (rate.perMileRate || 0) * (rate.distance || 0);
  }, 0);

  const weightedAveragePerMile = totalDistance > 0 ? weightedSum / totalDistance : null;

  // Get national average (assuming we have equipment type)
  const { data: nationalAverageData } = await supabase
    .from('national_route_averages')
    .select('value')
    .is('bid_id', null)
    .single();

  const nationalAverage = nationalAverageData?.value || null;
  const nationalAverageComparison = nationalAverage && weightedAveragePerMile
    ? ((weightedAveragePerMile - nationalAverage) / nationalAverage) * 100
    : null;

  return {
    weightedAveragePerMile,
    totalResponses,
    nationalAverageComparison,
    nationalAverage
  };
};
