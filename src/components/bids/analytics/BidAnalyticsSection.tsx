
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  getBidParticipationStats,
  getCostDistribution,
} from '@/services/bidAnalyticsService';
import { getRouteAnalytics } from '@/services/bidRouteAnalyticsService';
import { getAverageRateAnalytics } from '@/services/bidAverageRateService';
import { RouteAnalyticsTable } from './RouteAnalyticsTable';
import { CostDistributionChart } from './CostDistributionChart';
import { AverageRateCard } from './AverageRateCard';
import { AlertTriangle } from 'lucide-react';
import type { RouteAnalytics, AverageRateAnalytics } from '@/types/analytics';

interface BidAnalyticsSectionProps {
  bidId: string;
  equipmentType?: string;
}

export function BidAnalyticsSection({ bidId, equipmentType }: BidAnalyticsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [participationStats, setParticipationStats] = useState<any>(null);
  const [routeAnalytics, setRouteAnalytics] = useState<RouteAnalytics[]>([]);
  const [averageRateAnalytics, setAverageRateAnalytics] = useState<AverageRateAnalytics | null>(null);
  const [costDistribution, setCostDistribution] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const [stats, routeData, averageRate, distribution] = await Promise.all([
          getBidParticipationStats(bidId),
          getRouteAnalytics(bidId),
          getAverageRateAnalytics(bidId),
          getCostDistribution(bidId)
        ]);

        setParticipationStats(stats);
        setRouteAnalytics(routeData);
        setAverageRateAnalytics(averageRate);
        setCostDistribution(distribution);
      } catch (error) {
        console.error('Error loading analytics:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load analytics data. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [bidId, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
      </div>
    );
  }

  if (!participationStats || routeAnalytics.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No analytics data available yet. Analytics will be shown once carriers start submitting responses.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bid Participation</CardTitle>
            <CardDescription>Current response rate from invited carriers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={participationStats.responseRate} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{participationStats.respondedCount} of {participationStats.totalInvited} carriers responded</span>
                <span>{participationStats.responseRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <AverageRateCard 
          analytics={averageRateAnalytics || {
            weightedAveragePerMile: null,
            totalResponses: 0,
            nationalAverageComparison: null,
            nationalAverage: null
          }}
          isLoading={loading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Distribution</CardTitle>
          <CardDescription>Distribution of rates per mile across all routes</CardDescription>
        </CardHeader>
        <CardContent>
          <CostDistributionChart data={costDistribution} nationalAverage={null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Route Analytics</CardTitle>
          <CardDescription>Detailed analytics for each route</CardDescription>
        </CardHeader>
        <CardContent>
          <RouteAnalyticsTable data={routeAnalytics} />
        </CardContent>
      </Card>
    </div>
  );
}
