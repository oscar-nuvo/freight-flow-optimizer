
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  TrendingDown,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

// Mock data for charts
const carrierPerformanceData = [
  { name: 'ABC Logistics', performance: 92 },
  { name: 'XYZ Transport', performance: 88 },
  { name: 'Swift Carriers', performance: 76 },
  { name: 'Global Shipping', performance: 95 },
  { name: 'Mexico Express', performance: 83 },
];

const bidProgressData = [
  { name: 'Q2 North America', complete: 65, incomplete: 35 },
  { name: 'Mexico Cross-Border', complete: 0, incomplete: 100 },
  { name: 'Europe Q1', complete: 100, incomplete: 0 },
  { name: 'Asia Pacific', complete: 45, incomplete: 55 },
  { name: 'Specialized Equipment', complete: 0, incomplete: 100 },
];

const rateHistoryData = [
  { month: 'Jan', rate: 2.15 },
  { month: 'Feb', rate: 2.22 },
  { month: 'Mar', rate: 2.30 },
  { month: 'Apr', rate: 2.25 },
  { month: 'May', rate: 2.18 },
  { month: 'Jun', rate: 2.20 },
  { month: 'Jul', rate: 2.32 },
  { month: 'Aug', rate: 2.40 },
  { month: 'Sep', rate: 2.35 },
  { month: 'Oct', rate: 2.28 },
  { month: 'Nov', rate: 2.25 },
  { month: 'Dec', rate: 2.20 },
];

export function AnalysisSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analysis</h1>
        <p className="text-muted-foreground mt-1">Data-driven insights to optimize your procurement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rate per Mile</CardTitle>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">$2.25</CardTitle>
              <span className="flex items-center text-sm text-red-500">
                <TrendingUp className="h-4 w-4 mr-1" />
                +4.2%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Compared to last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Carriers</CardTitle>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">32</CardTitle>
              <span className="flex items-center text-sm text-green-500">
                <TrendingUp className="h-4 w-4 mr-1" />
                +3
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              3 new carriers added this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cost Savings</CardTitle>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">$45,280</CardTitle>
              <span className="flex items-center text-sm text-green-500">
                <TrendingDown className="h-4 w-4 mr-1" />
                -8.5%
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Cost savings from last quarter
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChartIcon className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="carriers" className="flex items-center">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Carriers
          </TabsTrigger>
          <TabsTrigger value="bids" className="flex items-center">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Bids
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="flex justify-end">
            <Select defaultValue="6months">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Rate Trends Over Time</CardTitle>
              <CardDescription>
                Average rate per mile across all lanes
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rateHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[2, 'auto']} />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Rate per Mile']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#2C5E1A" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Carriers</CardTitle>
                <CardDescription>
                  Based on on-time delivery and service quality
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={carrierPerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Performance Score']}
                    />
                    <Bar dataKey="performance" fill="#2C5E1A" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Bid Progress</CardTitle>
                <CardDescription>
                  Completion rate of active bids
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bidProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="complete" stackId="a" fill="#2C5E1A" />
                    <Bar dataKey="incomplete" stackId="a" fill="#e0e0e0" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="carriers" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Carrier Analytics</CardTitle>
              <CardDescription>
                Detailed metrics on carrier performance and rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <div className="flex flex-col items-center text-muted-foreground">
                  <AlertCircle className="h-10 w-10 mb-4" />
                  <p>Carrier analytics will be implemented in a future version</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bids" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Bid Analytics</CardTitle>
              <CardDescription>
                Insights on bid performance and outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <div className="flex flex-col items-center text-muted-foreground">
                  <AlertCircle className="h-10 w-10 mb-4" />
                  <p>Bid analytics will be implemented in a future version</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
