
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
  distance: number | null;
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
    .select('id, origin_city, destination_city, equipment_type, commodity, distance')
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
    .not('value', 'is', null);

  if (ratesError) throw ratesError;
  
  const routeAnalytics: RouteAnalytics[] = routes.map(route => {
    // Filter rates for this specific route
    const routeRates = allRates ? allRates.filter(rate => 
      rate.route_id === route.id
    ) : [];
    
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

    // Simplified outlier detection
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

  return routeAnalytics;
};

export const getCostDistribution = async (bidId: string): Promise<CostDistributionBucket[]> => {
  // First, fetch routes that belong to this bid to get their distances
  const { data: routeBids, error: routeBidsError } = await supabase
    .from('route_bids')
    .select('route_id')
    .eq('bid_id', bidId);

  if (routeBidsError) throw routeBidsError;
  if (!routeBids || routeBids.length === 0) return [];

  // Get the routes with their distances
  const { data: routes, error: routesError } = await supabase
    .from('routes')
    .select('id, distance')
    .in('id', routeBids.map(rb => rb.route_id));

  if (routesError) throw routesError;
  
  // Create a map of route IDs to distances for easy lookup
  const routeDistances = new Map<string, number | null>();
  if (routes) {
    routes.forEach(route => {
      routeDistances.set(route.id, route.distance);
    });
  }

  const { data: rates, error } = await supabase
    .from('carrier_route_rates')
    .select(`
      value,
      route_id,
      carrier:carriers(id, name),
      route_id
    `)
    .eq('bid_id', bidId)
    .not('value', 'is', null);

  if (error) throw error;
  if (!rates || rates.length === 0) return [];

  // Convert rates to per-mile rates if distance is available
  const perMileRates = rates.map(r => {
    const distance = routeDistances.get(r.route_id);
    const perMileValue = distance && distance > 0 ? r.value / distance : r.value;
    return {
      ...r,
      originalValue: r.value,
      value: perMileValue
    };
  }).filter(r => r.value > 0);

  // Create buckets of $0.10 intervals
  const minRate = Math.floor(Math.min(...perMileRates.map(r => r.value)) * 10) / 10;
  const maxRate = Math.ceil(Math.max(...perMileRates.map(r => r.value)) * 10) / 10;
  
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
  perMileRates.forEach(rate => {
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
