import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileUp, Filter, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { BidsTable } from "@/components/bids/BidsTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Bid } from "@/types/bid";

interface Bid {
  id: string;
  name: string;
  status: string;
  lanes?: number;
  carriers?: number;
  start_date?: string;
  end_date?: string;
  submission_date?: string;
  progress?: number;
  created_at: string;
  updated_at: string;
  org_id: string;
  rate_duration?: string;
  mode?: string;
  equipment_type?: string;
  instructions?: string;
  contract_file?: string;
}

export function BidsSection() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  
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
      
      setBids(data as Bid[] || []);
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

  const filterBids = (bids: Bid[], status?: string) => {
    return bids.filter(bid => {
      const matchesSearch = bid.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (!status || status === "all") return true;
      
      if (status === "active") {
        return bid.status === "active" || bid.status === "published";
      }
      
      return bid.status === status;
    });
  };

  const handleCreateBid = () => {
    if (organization?.subscription_status === "free" && bids.length >= 10) {
      setShowUpgradeDialog(true);
    } else {
      navigate("/bids/new");
    }
  };

  const handleUpgrade = () => {
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
      case "closed":
        return "secondary";
      case "draft":
        return "outline";
      case "published":
        return "default";
      case "paused":
        return "destructive";
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
                Free tier: You can create up to 10 bids.
              </p>
              <p className="text-xs text-amber-700">
                {bids.length === 0 
                  ? "You haven't created any bids yet." 
                  : bids.length >= 10 
                    ? "You have reached your free tier limit. Upgrade to create more bids." 
                    : `You have created ${bids.length} of 10 allowed bids.`}
              </p>
            </div>
            {bids.length >= 10 && (
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                {loading ? "Loading bids..." : `${filterBids(bids).length} bids found`}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              <BidsTable bids={filterBids(bids)} loading={loading} />
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
              <BidsTable bids={filterBids(bids, "active")} loading={loading} />
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
              <BidsTable bids={filterBids(bids, "draft")} loading={loading} />
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
              <BidsTable bids={filterBids(bids, "completed")} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to create more bids</DialogTitle>
            <DialogDescription>
              You've reached the limit of 10 bids on the free tier. Upgrade now to create unlimited bids and access additional features.
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
