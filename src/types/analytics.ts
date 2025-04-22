
export interface RouteAnalytics {
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

export interface AverageRateAnalytics {
  weightedAveragePerMile: number | null;
  totalResponses: number;
  nationalAverageComparison: number | null;
  nationalAverage: number | null;
}
