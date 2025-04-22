
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
  const { data: routes, error: routesError } = await supabase
    .from('routes')
    .select(`
      id,
      origin_city,
      destination_city,
      equipment_type,
      commodity,
      route_bids!inner(
        bid_id,
        carrier_route_rates(
          value,
          carrier:carriers(id, name)
        )
      )
    `)
    .eq('route_bids.bid_id', bidId);

  if (routesError) throw routesError;

  const routeAnalytics: RouteAnalytics[] = routes.map(route => {
    const rates = route.route_bids.flatMap(bid => 
      bid.carrier_route_rates.map(rate => ({
        value: rate.value,
        carrier: rate.carrier
      }))
    ).filter(rate => rate.value !== null && rate.value > 0);

    const validRates = rates.map(r => r.value);
    const average = validRates.length > 0 
      ? validRates.reduce((a, b) => a + b, 0) / validRates.length 
      : null;

    const bestRate = validRates.length > 0 
      ? Math.min(...validRates)
      : null;

    const bestRateCarriers = bestRate 
      ? rates
          .filter(r => r.value === bestRate)
          .map(r => ({ id: r.carrier.id, name: r.carrier.name }))
      : [];

    // Calculate if this route's average is an outlier
    // (simplified - you might want to make this more sophisticated)
    const isOutlier = false; // TODO: Implement outlier detection

    return {
      routeId: route.id,
      origin: route.origin_city,
      destination: route.destination_city,
      equipmentType: route.equipment_type,
      commodity: route.commodity,
      bestRate,
      bestRateCarriers,
      averageRate: average,
      responseCount: rates.length,
      isOutlier
    };
  });

  return routeAnalytics;
};

export const getCostDistribution = async (bidId: string): Promise<CostDistributionBucket[]> => {
  const { data: rates } = await supabase
    .from('carrier_route_rates')
    .select(`
      value,
      carrier:carriers(id, name),
      route_id
    `)
    .eq('bid_id', bidId)
    .not('value', 'is', null);

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
  const { data } = await supabase
    .from('national_route_averages')
    .select('value')
    .eq('equipment_type', equipmentType)
    .is('bid_id', null)
    .single();

  return data?.value || null;
};
