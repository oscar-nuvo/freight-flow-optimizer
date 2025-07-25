
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { 
  Truck, 
  FileSpreadsheet, 
  Map, 
  BarChart
} from "lucide-react";

const Dashboard = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back to FreightPro</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStatCard
            title="Total Carriers"
            value={stats?.totalCarriers ?? 0}
            description="Carriers in your organization"
            icon={Truck}
            path="/carriers"
            isLoading={isLoading}
          />
          
          <DashboardStatCard
            title="Active Bids"
            value={stats?.activeBids ?? 0}
            description="Currently active bids"
            icon={FileSpreadsheet}
            path="/bids"
            isLoading={isLoading}
          />
          
          <DashboardStatCard
            title="Total Routes"
            value={stats?.totalRoutes ?? 0}
            description="Active routes in your organization"
            icon={Map}
            path="/routes"
            isLoading={isLoading}
          />
          
          <DashboardStatCard
            title="Avg. Cost per Mile"
            value="$2.25"
            description="Savings from benchmark"
            icon={BarChart}
            path="/analysis"
            isLoading={false}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            Error loading dashboard statistics. Please try refreshing the page.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="font-medium">New bid created</p>
                    <p className="text-sm text-muted-foreground">Q2 North America RFP was created</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="font-medium">Carrier added</p>
                    <p className="text-sm text-muted-foreground">ABC Logistics was added to the system</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                  <div>
                    <p className="font-medium">Route updated</p>
                    <p className="text-sm text-muted-foreground">Los Angeles to Chicago rate updated</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <div>
                    <p className="font-medium">Bid completed</p>
                    <p className="text-sm text-muted-foreground">Europe Q1 Bid was marked as completed</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Tasks</CardTitle>
              <CardDescription>
                Actions that need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-muted/50">
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-100 p-2 rounded-md">
                      <FileSpreadsheet className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Complete Q2 North America RFP</p>
                      <p className="text-sm text-muted-foreground">Waiting on 5 carrier responses</p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: "65%" }}></div>
                        </div>
                        <p className="text-xs text-right mt-1">65% complete</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-md bg-muted/50">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-2 rounded-md">
                      <Truck className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Verify Carrier Documentation</p>
                      <p className="text-sm text-muted-foreground">3 carriers require insurance verification</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-md bg-muted/50">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-2 rounded-md">
                      <Map className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Review New Routes</p>
                      <p className="text-sm text-muted-foreground">12 routes added in the last week</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
