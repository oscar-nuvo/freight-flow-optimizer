
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { QuickTasksCard } from "@/components/dashboard/QuickTasksCard";
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
          <RecentActivityFeed />
          <QuickTasksCard />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
