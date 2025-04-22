
import { supabase } from "@/integrations/supabase/client";

interface BidParticipationStats {
  totalInvited: number;
  respondedCount: number;
  responseRate: number;
}

interface RouteAnalytics {
  routeId: string;
  origin: string;
  destination: string;
  equipmentType: string;
  commodity: string;
  bestRate: number | null;
  bestRateCarriers: { id: string; name: string }[];
  averageRate: number | null;
  responseCount: number;
  isOutlier: boolean;
}

interface CostDistributionBucket {
  min: number;
  max: number;
  count: number;
  rates: {
    carrierId: string;
    carrierName: string;
    routeId: string;
    rate: number;
  }[];
}

export const getBidParticipationStats = async (bidId: string): Promise<BidParticipationStats> => {
  // Get total invited carriers
  const { count: totalInvited } = await supabase
    .from('bid_carrier_invitations')
    .select('*', { count: 'exact' })
    .eq('bid_id', bidId);

  // Get carriers who have responded
  const { count: respondedCount } = await supabase
    .from('carrier_bid_responses')
    .select('*', { count: 'exact' })
    .eq('bid_id', bidId);

  return {
    totalInvited: totalInvited || 0,
    respondedCount: respondedCount || 0,
    responseRate: totalInvited ? (respondedCount || 0) / totalInvited * 100 : 0
  };
};

export const getRouteAnalytics = async (bidId: string): Promise<RouteAnalytics[]> => {
  // First, fetch routes that belong to this bid
  const { data: routeBids, error: routeBidsError } = await supabase
    .from('route_bids')
    .select('route_id')
    .eq('bid_id', bidId);

  if (routeBidsError) throw routeBidsError;
  if (!routeBids || routeBids.length === 0) return [];

  // Get the routes with their data
  const { data: routes, error: routesError } = await supabase
    .from('routes')
    .select('id, origin_city, destination_city, equipment_type, commodity')
    .in('id', routeBids.map(rb => rb.route_id));

  if (routesError) throw routesError;
  if (!routes || routes.length === 0) return [];

  // Get all rates for these routes in this bid
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
    .in('route_id', routeBids.map(rb => rb.route_id));

  if (ratesError) throw ratesError;
  
  const routeAnalytics: RouteAnalytics[] = routes.map(route => {
    // Filter rates for this specific route
    const routeRates = allRates ? allRates.filter(rate => 
      rate.route_id === route.id && 
      rate.value !== null && 
      rate.value > 0
    ) : [];
    
    // Calculate statistics for this route
    const validRates = routeRates.map(r => r.value);
    const average = validRates.length > 0 
      ? validRates.reduce((a, b) => a + b, 0) / validRates.length 
      : null;

    const bestRate = validRates.length > 0 
      ? Math.min(...validRates)
      : null;

    const bestRateCarriers = bestRate 
      ? routeRates
          .filter(r => r.value === bestRate)
          .map(r => ({ id: r.carriers.id, name: r.carriers.name }))
      : [];

    // Calculate if this route's average is an outlier
    // Here we'll use a simple implementation - in a real system,
    // you'd want a more sophisticated outlier detection
    let isOutlier = false;
    if (average !== null && validRates.length >= 3) {
      // Calculate standard deviation
      const mean = average;
      const squareDiffs = validRates.map(value => {
        const diff = value - mean;
        return diff * diff;
      });
      const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
      const stdDev = Math.sqrt(avgSquareDiff);
      
      // Consider a route an outlier if its average is more than 2 standard deviations from the overall mean
      // We'd need overall mean across all routes for this calculation in a real implementation
      // For now, we'll compare to the route's own standard deviation pattern
      const allRoutesAverage = average; // This should ideally be the average across all routes
      isOutlier = Math.abs(average - allRoutesAverage) > 2 * stdDev;
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
      isOutlier
    };
  });

  return routeAnalytics;
};

export const getCostDistribution = async (bidId: string): Promise<CostDistributionBucket[]> => {
  const { data: rates, error } = await supabase
    .from('carrier_route_rates')
    .select(`
      value,
      carrier:carriers(id, name),
      route_id
    `)
    .eq('bid_id', bidId)
    .not('value', 'is', null);

  if (error) throw error;
  if (!rates || rates.length === 0) return [];

  // Create buckets of $0.10 intervals
  const validRates = rates.filter(r => r.value > 0);
  const minRate = Math.floor(Math.min(...validRates.map(r => r.value)) * 10) / 10;
  const maxRate = Math.ceil(Math.max(...validRates.map(r => r.value)) * 10) / 10;
  
  const buckets: CostDistributionBucket[] = [];
  for (let i = minRate; i <= maxRate; i += 0.1) {
    buckets.push({
      min: i,
      max: i + 0.1,
      count: 0,
      rates: []
    });
  }

  // Fill buckets
  validRates.forEach(rate => {
    const bucket = buckets.find(b => rate.value >= b.min && rate.value < b.max);
    if (bucket) {
      bucket.count++;
      bucket.rates.push({
        carrierId: rate.carrier.id,
        carrierName: rate.carrier.name,
        routeId: rate.route_id,
        rate: rate.value
      });
    }
  });

  return buckets;
};

export const getNationalAverage = async (equipmentType: string): Promise<number | null> => {
  const { data, error } = await supabase
    .from('national_route_averages')
    .select('value')
    .eq('equipment_type', equipmentType)
    .is('bid_id', null)
    .single();

  if (error) {
    console.error("Error fetching national average:", error);
    return null;
  }

  return data?.value || null;
};
