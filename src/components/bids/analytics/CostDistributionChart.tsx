
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Card } from '@/components/ui/card';

interface CostDistributionProps {
  data: {
    min: number;
    max: number;
    count: number;
    rates: {
      carrierId: string;
      carrierName: string;
      routeId: string;
      rate: number;
    }[];
  }[];
  nationalAverage: number | null;
}

export function CostDistributionChart({ data, nationalAverage }: CostDistributionProps) {
  const chartData = data.map(bucket => ({
    name: `$${bucket.min.toFixed(2)}-${bucket.max.toFixed(2)}`,
    count: bucket.count,
    rates: bucket.rates,
    // Add a tooltip label that's more descriptive
    tooltipLabel: `$${bucket.min.toFixed(2)} to $${bucket.max.toFixed(2)} per mile`
  }));

  return (
    <div className="w-full h-[400px]"> {/* Increased height for better visibility */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            label={{ 
              value: 'Number of Responses', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#6B7280' }
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const data = payload[0].payload;
              
              return (
                <Card className="p-3 bg-white shadow-lg border">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Rate Range</p>
                    <p className="text-sm text-muted-foreground">{data.tooltipLabel}</p>
                    <p className="text-sm font-medium">
                      {data.count} carrier{data.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Card>
              );
            }}
          />
          <Bar 
            dataKey="count" 
            fill="#2C5E1A" // Using the forest green color from the theme
            radius={[4, 4, 0, 0]} // Slightly rounded corners
          />
          {nationalAverage && (
            <ReferenceLine
              x={nationalAverage}
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: 'National Average',
                position: 'top',
                fill: '#EF4444',
                fontSize: 12
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

