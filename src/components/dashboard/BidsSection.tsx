
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileUp, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Mock bid data
const mockBids = [
  { 
    id: 1, 
    name: "Q2 North America RFP", 
    status: "Active", 
    carriers: 12, 
    lanes: 45, 
    startDate: "2025-04-01", 
    endDate: "2025-04-14",
    progress: 65 
  },
  { 
    id: 2, 
    name: "Mexico Cross-Border", 
    status: "Draft", 
    carriers: 8, 
    lanes: 22, 
    startDate: "Not started", 
    endDate: "Not started",
    progress: 0 
  },
  { 
    id: 3, 
    name: "Europe Q1 Bid", 
    status: "Completed", 
    carriers: 15, 
    lanes: 67, 
    startDate: "2025-01-15", 
    endDate: "2025-02-15",
    progress: 100 
  },
  { 
    id: 4, 
    name: "Asia Pacific Lanes", 
    status: "Active", 
    carriers: 10, 
    lanes: 34, 
    startDate: "2025-03-20", 
    endDate: "2025-04-30",
    progress: 45 
  },
  { 
    id: 5, 
    name: "Specialized Equipment Bid", 
    status: "Planned", 
    carriers: 6, 
    lanes: 18, 
    startDate: "2025-05-01", 
    endDate: "2025-05-15",
    progress: 0 
  }
];

export function BidsSection() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bids</h1>
          <p className="text-muted-foreground mt-1">Create and manage RFPs across multiple lanes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="sm:w-auto">
            <FileUp className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button className="bg-forest hover:bg-forest-600 sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create New Bid
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <TabsList>
            <TabsTrigger value="all">All Bids</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bids..."
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value="all">
          <Card>
            <CardHeader className="px-6 py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">All Bids</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <CardDescription>
                {mockBids.length} bids found
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Name</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Status</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Carriers</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Lanes</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Start Date</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">End Date</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Progress</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockBids.map((bid) => (
                      <tr key={bid.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="font-medium">{bid.name}</div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={
                            bid.status === "Active" ? "default" :
                            bid.status === "Completed" ? "success" :
                            bid.status === "Draft" ? "secondary" :
                            "outline"
                          }>
                            {bid.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">{bid.carriers}</td>
                        <td className="py-3 px-2">{bid.lanes}</td>
                        <td className="py-3 px-2">{bid.startDate}</td>
                        <td className="py-3 px-2">{bid.endDate}</td>
                        <td className="py-3 px-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-forest h-2.5 rounded-full" 
                              style={{ width: `${bid.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">{bid.progress}%</span>
                        </td>
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
        </TabsContent>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Bids</CardTitle>
              <CardDescription>Bids that are currently in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This tab would display only the active bids in a similar table layout.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="draft">
          <Card>
            <CardHeader>
              <CardTitle>Draft Bids</CardTitle>
              <CardDescription>Bids that are still being prepared</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This tab would display only the draft bids in a similar table layout.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Bids</CardTitle>
              <CardDescription>Bids that have been finalized</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This tab would display only the completed bids in a similar table layout.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
