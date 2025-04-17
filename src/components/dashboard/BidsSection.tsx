
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileUp, Filter, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Bid {
  id: string;
  name: string;
  status: string;
  lanes?: number;
  carriers?: number;
  start_date?: string;
  end_date?: string;
  progress?: number;
  created_at: string;
  updated_at: string;
  org_id: string;
}

export function BidsSection() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { user, organization } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (organization) {
      fetchBids();
    }
  }, [organization]);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("org_id", organization?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBids(data || []);
    } catch (error: any) {
      console.error("Error fetching bids:", error);
      toast({
        title: "Error",
        description: "Failed to load bids. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBid = () => {
    // Check if on free tier and already has a bid
    if (organization?.subscription_status === "free" && bids.length >= 1) {
      setShowUpgradeDialog(true);
    } else {
      // Allow creating a bid
      navigate("/bids/new");
    }
  };

  const handleUpgrade = () => {
    // Here you would navigate to the upgrade page or open a checkout flow
    toast({
      title: "Upgrade coming soon",
      description: "The upgrade functionality will be available soon.",
    });
    setShowUpgradeDialog(false);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "draft":
        return "outline";
      default:
        return "default";
    }
  };

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
          <Button 
            className="bg-forest hover:bg-forest-600 sm:w-auto"
            onClick={handleCreateBid}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Bid
          </Button>
        </div>
      </div>

      {organization?.subscription_status === "free" && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Free tier: You can create 1 bid.
              </p>
              <p className="text-xs text-amber-700">
                {bids.length === 0 
                  ? "You haven't created any bids yet." 
                  : bids.length === 1 
                    ? "You have created your free bid. Upgrade to create more." 
                    : `You have created ${bids.length} bids.`}
              </p>
            </div>
            {bids.length >= 1 && (
              <Button 
                size="sm" 
                className="ml-auto bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => setShowUpgradeDialog(true)}
              >
                Upgrade
              </Button>
            )}
          </CardContent>
        </Card>
      )}

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
                {loading ? "Loading bids..." : `${bids.length} bids found`}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
                </div>
              ) : bids.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">You haven't created any bids yet</p>
                  <Button 
                    className="bg-forest hover:bg-forest-600"
                    onClick={handleCreateBid}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first bid
                  </Button>
                </div>
              ) : (
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
                      {bids.map((bid) => (
                        <tr key={bid.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <div className="font-medium">{bid.name}</div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant={getStatusBadgeVariant(bid.status)}>
                              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">{bid.carriers || 0}</td>
                          <td className="py-3 px-2">{bid.lanes || 0}</td>
                          <td className="py-3 px-2">{bid.start_date || "Not set"}</td>
                          <td className="py-3 px-2">{bid.end_date || "Not set"}</td>
                          <td className="py-3 px-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-forest h-2.5 rounded-full" 
                                style={{ width: `${bid.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{bid.progress || 0}%</span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/bids/${bid.id}`)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {bids.filter(bid => bid.status === "active").length === 0 
                    ? "No active bids found." 
                    : "This tab would display only the active bids in a similar table layout."}
                </p>
              )}
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
              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {bids.filter(bid => bid.status === "draft").length === 0 
                    ? "No draft bids found." 
                    : "This tab would display only the draft bids in a similar table layout."}
                </p>
              )}
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
              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {bids.filter(bid => bid.status === "completed").length === 0 
                    ? "No completed bids found." 
                    : "This tab would display only the completed bids in a similar table layout."}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to create more bids</DialogTitle>
            <DialogDescription>
              You've reached the limit of 1 bid on the free tier. Upgrade now to create unlimited bids and access additional features.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h3 className="font-medium mb-2">Premium features include:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
                Unlimited bids
              </li>
              <li className="flex items-center">
                <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
                Advanced bid analytics
              </li>
              <li className="flex items-center">
                <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
                Priority support
              </li>
              <li className="flex items-center">
                <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
                Custom bid templates
              </li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpgrade} className="bg-forest hover:bg-forest-600">
              Upgrade to Premium
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
