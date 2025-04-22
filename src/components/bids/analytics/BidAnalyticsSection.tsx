
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  getBidParticipationStats,
  getRouteAnalytics,
  getCostDistribution,
  getNationalAverage 
} from '@/services/bidAnalyticsService';
import { RouteAnalyticsTable } from './RouteAnalyticsTable';
import { CostDistributionChart } from './CostDistributionChart';
import { AlertTriangle } from 'lucide-react';

interface BidAnalyticsSectionProps {
  bidId: string;
  equipmentType?: string;
}

export function BidAnalyticsSection({ bidId, equipmentType }: BidAnalyticsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [participationStats, setParticipationStats] = useState<any>(null);
  const [routeAnalytics, setRouteAnalytics] = useState<any[]>([]);
  const [costDistribution, setCostDistribution] = useState<any[]>([]);
  const [nationalAverage, setNationalAverage] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const [stats, analytics, distribution] = await Promise.all([
          getBidParticipationStats(bidId),
          getRouteAnalytics(bidId),
          getCostDistribution(bidId)
        ]);

        setParticipationStats(stats);
        setRouteAnalytics(analytics);
        setCostDistribution(distribution);

        if (equipmentType) {
          const avgRate = await getNationalAverage(equipmentType);
          setNationalAverage(avgRate);
        }
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
  }, [bidId, equipmentType]);

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

  // Calculate weighted average rate (per mile) across all routes
  const routesWithRates = routeAnalytics.filter(route => route.averageRate !== null);
  const totalResponses = routesWithRates.reduce((sum, route) => sum + route.responseCount, 0);
  
  const weightedAverageRate = totalResponses > 0
    ? routesWithRates.reduce((sum, route) => 
        sum + (route.averageRate * route.responseCount), 0) / totalResponses
    : null;

  const nationalAverageComparison = nationalAverage && weightedAverageRate
    ? ((weightedAverageRate - nationalAverage) / nationalAverage) * 100
    : null;

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

        <Card>
          <CardHeader>
            <CardTitle>Average Rate</CardTitle>
            <CardDescription>
              Average rate per mile across all routes
              {nationalAverage && ` compared to national average`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {weightedAverageRate 
                  ? `$${weightedAverageRate.toFixed(2)}/mile` 
                  : 'No rate data available'}
              </div>
              {nationalAverageComparison !== null && (
                <div className={`text-sm ${nationalAverageComparison > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {nationalAverageComparison > 0 ? '↑' : '↓'} {Math.abs(nationalAverageComparison).toFixed(1)}% vs national average
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Distribution</CardTitle>
          <CardDescription>Distribution of rates per mile across all routes</CardDescription>
        </CardHeader>
        <CardContent>
          <CostDistributionChart data={costDistribution} nationalAverage={nationalAverage} />
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
