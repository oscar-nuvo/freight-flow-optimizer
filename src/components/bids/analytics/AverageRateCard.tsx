
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
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

  const { weightedAveragePerMile, nationalAverageComparison, nationalAverage } = analytics;
  
  const isHigher = nationalAverageComparison && nationalAverageComparison > 0;
  const comparisonColor = isHigher ? 'text-red-500' : 'text-green-500';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Rate</CardTitle>
        <CardDescription>
          Average rate per mile across all routes
          {nationalAverage && ` compared to national average`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-2xl font-bold">
            {weightedAveragePerMile 
              ? `$${weightedAveragePerMile.toFixed(2)}/mile` 
              : 'No rate data available'}
          </div>
          
          {nationalAverageComparison !== null && nationalAverage && (
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 ${comparisonColor}`}>
                {isHigher ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {Math.abs(nationalAverageComparison).toFixed(1)}%
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {isHigher ? 'above' : 'below'} national average (${nationalAverage.toFixed(2)}/mile)
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
