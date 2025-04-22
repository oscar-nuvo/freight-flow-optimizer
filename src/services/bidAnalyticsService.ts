import { supabase } from "@/integrations/supabase/client";

interface BidParticipationStats {
  totalInvited: number;
  respondedCount: number;
  responseRate: number;
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
