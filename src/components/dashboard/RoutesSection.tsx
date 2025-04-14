
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin } from "lucide-react";

// Mock routes data
const mockRoutes = [
  { 
    id: 1, 
    origin: "Los Angeles, CA", 
    destination: "Chicago, IL", 
    distance: 2015, 
    carriers: 8, 
    avgRate: "$2.45", 
    bestRate: "$2.10", 
    bids: 3 
  },
  { 
    id: 2, 
    origin: "New York, NY", 
    destination: "Miami, FL", 
    distance: 1280, 
    carriers: 12, 
    avgRate: "$2.10", 
    bestRate: "$1.85", 
    bids: 4 
  },
  { 
    id: 3, 
    origin: "Seattle, WA", 
    destination: "Denver, CO", 
    distance: 1330, 
    carriers: 6, 
    avgRate: "$2.30", 
    bestRate: "$2.05", 
    bids: 2 
  },
  { 
    id: 4, 
    origin: "Dallas, TX", 
    destination: "Atlanta, GA", 
    distance: 795, 
    carriers: 10, 
    avgRate: "$1.95", 
    bestRate: "$1.75", 
    bids: 5 
  },
  { 
    id: 5, 
    origin: "Chicago, IL", 
    destination: "Phoenix, AZ", 
    distance: 1750, 
    carriers: 7, 
    avgRate: "$2.25", 
    bestRate: "$2.00", 
    bids: 3 
  },
];

export function RoutesSection() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Routes</h1>
          <p className="text-muted-foreground mt-1">View all routes and associated rates</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button className="bg-forest hover:bg-forest-600 sm:w-auto">
            <MapPin className="h-4 w-4 mr-2" />
            Create Route
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-lg">Route Search</CardTitle>
          <CardDescription>
            Search for specific routes or filter by criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Origin</label>
            <Input placeholder="Enter origin city" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Destination</label>
            <Input placeholder="Enter destination city" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Equipment Type</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                <SelectItem value="dry-van">Dry Van</SelectItem>
                <SelectItem value="reefer">Reefer</SelectItem>
                <SelectItem value="flatbed">Flatbed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full">Search Routes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-6 py-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">All Routes</CardTitle>
            <div className="flex space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search routes..." className="pl-9" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
          <CardDescription>
            {mockRoutes.length} routes found
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-2 text-left font-medium text-muted-foreground">Origin</th>
                  <th className="py-3 px-2 text-left font-medium text-muted-foreground">Destination</th>
                  <th className="py-3 px-2 text-left font-medium text-muted-foreground">Distance (mi)</th>
                  <th className="py-3 px-2 text-left font-medium text-muted-foreground">Carriers</th>
                  <th className="py-3 px-2 text-left font-medium text-muted-foreground">Avg Rate (per mi)</th>
                  <th className="py-3 px-2 text-left font-medium text-muted-foreground">Best Rate (per mi)</th>
                  <th className="py-3 px-2 text-left font-medium text-muted-foreground">Bids</th>
                  <th className="py-3 px-2 text-left font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {mockRoutes.map((route) => (
                  <tr key={route.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2">
                      <div className="font-medium">{route.origin}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium">{route.destination}</div>
                    </td>
                    <td className="py-3 px-2">{route.distance.toLocaleString()}</td>
                    <td className="py-3 px-2">{route.carriers}</td>
                    <td className="py-3 px-2">{route.avgRate}</td>
                    <td className="py-3 px-2 text-forest font-medium">{route.bestRate}</td>
                    <td className="py-3 px-2">{route.bids}</td>
                    <td className="py-3 px-2 text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
