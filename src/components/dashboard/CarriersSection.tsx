
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, FileUp, Filter } from "lucide-react";
import { useState } from "react";

// Mock carrier data
const mockCarriers = [
  { id: 1, name: "ABC Logistics", status: "Active", type: "FTL", locations: "US, Canada", lastUpdated: "2025-04-10" },
  { id: 2, name: "XYZ Transport", status: "Active", type: "LTL", locations: "US, Mexico", lastUpdated: "2025-04-09" },
  { id: 3, name: "Swift Carriers", status: "Inactive", type: "FTL", locations: "US", lastUpdated: "2025-04-05" },
  { id: 4, name: "Global Shipping", status: "Active", type: "FTL, LTL", locations: "Global", lastUpdated: "2025-04-01" },
  { id: 5, name: "Mexico Express", status: "Pending", type: "FTL", locations: "Mexico", lastUpdated: "2025-03-28" },
];

export function CarriersSection() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredCarriers = mockCarriers.filter(carrier => 
    carrier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Carriers</h1>
          <p className="text-muted-foreground mt-1">Manage your transportation providers</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="sm:w-auto">
            <FileUp className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button className="bg-forest hover:bg-forest-600 sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Carrier
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <TabsList>
            <TabsTrigger value="all">All Carriers</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search carriers..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="px-6 py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">All Carriers</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <CardDescription>
                {filteredCarriers.length} carriers found
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Name</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Status</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Type</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Locations</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Last Updated</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCarriers.length > 0 ? (
                      filteredCarriers.map((carrier) => (
                        <tr key={carrier.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <div className="font-medium">{carrier.name}</div>
                          </td>
                          <td className="py-3 px-2">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              carrier.status === "Active" ? "bg-green-100 text-green-800" :
                              carrier.status === "Inactive" ? "bg-gray-100 text-gray-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {carrier.status}
                            </div>
                          </td>
                          <td className="py-3 px-2">{carrier.type}</td>
                          <td className="py-3 px-2">{carrier.locations}</td>
                          <td className="py-3 px-2">{carrier.lastUpdated}</td>
                          <td className="py-3 px-2 text-right">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-muted-foreground">
                          No carriers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Carriers</CardTitle>
              <CardDescription>View and manage your active carriers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This tab would display only the active carriers in a similar table layout.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Carriers</CardTitle>
              <CardDescription>Carriers waiting for approval or additional information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This tab would display only the pending carriers in a similar table layout.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inactive">
          <Card>
            <CardHeader>
              <CardTitle>Inactive Carriers</CardTitle>
              <CardDescription>Carriers that are currently not in use</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This tab would display only the inactive carriers in a similar table layout.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
