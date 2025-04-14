
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Truck, 
  FileSpreadsheet, 
  Map, 
  BarChart, 
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock dashboard data
  const stats = [
    {
      title: "Total Carriers",
      value: "38",
      change: "+12%",
      trend: "up",
      description: "Compared to last quarter",
      path: "/carriers"
    },
    {
      title: "Active Bids",
      value: "5",
      change: "+2",
      trend: "up",
      description: "New bids this month",
      path: "/bids"
    },
    {
      title: "Total Routes",
      value: "156",
      change: "+23",
      trend: "up",
      description: "New routes added",
      path: "/routes"
    },
    {
      title: "Avg. Cost per Mile",
      value: "$2.25",
      change: "-5.2%",
      trend: "down",
      description: "Savings from benchmark",
      path: "/analysis"
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back to FreightPro</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Link to={stat.path} key={index} className="block transition-transform hover:scale-105">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {index === 0 && <Truck className="h-4 w-4" />}
                    {index === 1 && <FileSpreadsheet className="h-4 w-4" />}
                    {index === 2 && <Map className="h-4 w-4" />}
                    {index === 3 && <BarChart className="h-4 w-4" />}
                    {stat.title}
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{stat.value}</CardTitle>
                    <span className={`flex items-center text-sm ${
                      stat.trend === 'up' 
                        ? (index === 3 ? 'text-red-500' : 'text-green-500')
                        : (index === 3 ? 'text-green-500' : 'text-red-500')
                    }`}>
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {stat.change}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

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
