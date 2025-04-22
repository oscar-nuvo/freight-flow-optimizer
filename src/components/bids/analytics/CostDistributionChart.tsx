
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
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
    rates: bucket.rates
  }));

  return (
    <div className="w-full h-[300px]">
      <BarChart width={800} height={300} data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            
            const data = payload[0].payload;
            return (
              <Card className="p-3 bg-white shadow-lg">
                <div className="text-sm">
                  <div className="font-medium">{data.name}</div>
                  <div>{data.count} rate{data.count !== 1 ? 's' : ''}</div>
                </div>
              </Card>
            );
          }}
        />
        <Bar dataKey="count" fill="#10B981" />
        {nationalAverage && (
          <ReferenceLine
            x={nationalAverage}
            stroke="#EF4444"
            strokeDasharray="3 3"
            label={{ value: 'National Avg', position: 'top' }}
          />
        )}
      </BarChart>
    </div>
  );
}
