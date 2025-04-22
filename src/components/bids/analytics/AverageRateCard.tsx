
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { AverageRateAnalytics } from "@/types/analytics";

interface AverageRateCardProps {
  analytics: AverageRateAnalytics;
  isLoading: boolean;
}

export function AverageRateCard({ analytics, isLoading }: AverageRateCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Average Rate</CardTitle>
          <CardDescription>Loading average rate data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { weightedAveragePerMile, nationalAverageComparison } = analytics;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Rate</CardTitle>
        <CardDescription>
          Average rate per mile across all routes
          {analytics.nationalAverage && ` compared to national average`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {weightedAveragePerMile 
              ? `$${weightedAveragePerMile.toFixed(2)}/mile` 
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
  );
}
