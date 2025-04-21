import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ArrowUpDown, FileText, Calendar, Box, Truck, AlertCircle, Check, Pause, X, Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Route } from "@/types/route";
import { getRoutesByBid, removeRouteFromBid } from "@/services/routesService";
import { toast as sonnerToast } from "sonner";
import { BidInvitationsTable } from "@/components/bids/invitations/BidInvitationsTable";
import { InviteCarriersButton } from "@/components/bids/InviteCarriersButton";

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
  currency?: string;
}

const BidDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [bid, setBid] = useState<Bid | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [routesLoading, setRoutesLoading] = useState(true);
  const { organization } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const canEdit = bid?.status === "draft";
  const canPublish = bid?.status === "draft" && (bid?.lanes || 0) > 0;
  const canPause = bid?.status === "active" || bid?.status === "published";
  const canResume = bid?.status === "paused";
  const canClose = bid?.status !== "closed" && bid?.status !== "draft";

  useEffect(() => {
    if (id && organization) {
      fetchBid();
    }
  }, [id, organization]);

  useEffect(() => {
    if (id) {
      fetchRoutes();
    }
  }, [id]);

  const fetchBid = async () => {
    try {
      console.log("Fetching bid details for:", id);
      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("id", id)
        .eq("org_id", organization?.id)
        .single();

      if (error) throw error;
      console.log("Bid details fetched:", data);
      setBid(data);
    } catch (error: any) {
      console.error("Error fetching bid:", error);
      toast({
        title: "Error",
        description: "Failed to load bid details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    if (!id) return;
    
    setRoutesLoading(true);
    try {
      console.log("Fetching routes for bid:", id);
      const routesData = await getRoutesByBid(id);
      console.log("Routes fetched successfully:", routesData);
      setRoutes(routesData);
    } catch (error: any) {
      console.error("Error fetching routes for bid:", error);
      toast({
        title: "Error",
        description: "Failed to load routes for this bid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRoutesLoading(false);
    }
  };

  const updateBidStatus = async (status: string) => {
    if (!bid) return;

    try {
      console.log(`Updating bid ${bid.id} status to ${status}`);
      const { error } = await supabase
        .from("bids")
        .update({ status })
        .eq("id", bid.id)
        .eq("org_id", organization?.id);

      if (error) throw error;

      setBid({ ...bid, status });
      toast({
        title: "Success",
        description: `Bid status updated to ${status}`,
      });
      console.log(`Bid status successfully updated to ${status}`);
    } catch (error: any) {
      console.error("Error updating bid status:", error);
      toast({
        title: "Error",
        description: "Failed to update bid status",
        variant: "destructive",
      });
    }
  };

  const handleRemoveRoute = async (routeId: string) => {
    if (!id) return;
    
    try {
      console.log(`Removing route ${routeId} from bid ${id}`);
      await removeRouteFromBid(routeId, id);
      
      setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== routeId));
      
      fetchBid();
      
      sonnerToast.success("Route removed from bid successfully");
      console.log("Route removed successfully");
    } catch (error: any) {
      console.error("Error removing route from bid:", error);
      sonnerToast.error("Failed to remove route from bid");
    }
  };

  const statusIcons = {
    draft: <FileText className="h-4 w-4 text-muted-foreground" />,
    published: <Check className="h-4 w-4 text-green-500" />,
    active: <ArrowUpDown className="h-4 w-4 text-blue-500" />,
    paused: <Pause className="h-4 w-4 text-amber-500" />,
    closed: <X className="h-4 w-4 text-destructive" />,
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const getEquipmentTypeLabel = (type?: string) => {
    if (!type) return "Not specified";
    switch (type) {
      case "dry_van":
        return "53' Dry Van";
      case "reefer":
        return "Reefer";
      case "flatbed":
        return "Flatbed";
      default:
        return type;
    }
  };

  const getRateDurationLabel = (duration?: string) => {
    if (!duration) return "Not specified";
    switch (duration) {
      case "1":
        return "1 Month";
      case "3":
        return "3 Months";
      case "6":
        return "6 Months";
      case "12":
        return "12 Months";
      default:
        return `${duration} Months`;
    }
  };

  const getModeLabel = (mode?: string) => {
    if (!mode) return "Not specified";
    switch (mode) {
      case "over_the_road":
        return "Over the Road";
      default:
        return mode;
    }
  };

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        </div>
      ) : !bid ? (
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Bid Not Found</h2>
          <p className="text-muted-foreground mb-4">The bid you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate("/bids")}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Bids
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="mr-2"
                onClick={() => navigate("/bids")}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{bid.name}</h1>
                <div className="flex items-center mt-1">
                  <Badge variant={getStatusBadgeVariant(bid.status)} className="mr-2">
                    {statusIcons[bid.status as keyof typeof statusIcons]}
                    <span className="ml-1">{bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}</span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Created {new Date(bid.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {canEdit && (
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/bids/${bid.id}/edit`)}
                >
                  Edit Bid
                </Button>
              )}
              {canPublish && (
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => updateBidStatus("published")}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              )}
              {canPause && (
                <Button 
                  variant="destructive"
                  onClick={() => updateBidStatus("paused")}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              {canResume && (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => updateBidStatus("active")}
                >
                  Resume
                </Button>
              )}
              {canClose && (
                <Button 
                  variant="outline"
                  onClick={() => updateBidStatus("closed")}
                >
                  <X className="h-4 w-4 mr-2" />
                  Close Bid
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="routes">Routes</TabsTrigger>
              <TabsTrigger value="carriers">Carriers</TabsTrigger>
              <TabsTrigger value="responses">Responses</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bid Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Equipment Type</h3>
                        <p className="flex items-center mt-1">
                          <Box className="h-4 w-4 mr-2 text-muted-foreground" />
                          {getEquipmentTypeLabel(bid.equipment_type)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Mode</h3>
                        <p className="flex items-center mt-1">
                          <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                          {getModeLabel(bid.mode)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Rate Duration</h3>
                        <p className="mt-1">{getRateDurationLabel(bid.rate_duration)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Last Date to Submit</h3>
                        <p className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatDate(bid.submission_date)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Start of Operations</h3>
                        <p className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatDate(bid.start_date)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Lanes</h3>
                        <p className="mt-1">{bid.lanes || 0}</p>
                      </div>
                    </div>

                    {bid.contract_file && (
                      <div className="mt-6 pt-4 border-t">
                        <h3 className="text-sm font-medium mb-2">RFP Contract</h3>
                        <a 
                          href={bid.contract_file} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Contract
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bid.instructions ? (
                      <div className="prose prose-sm max-w-full">
                        <p>{bid.instructions}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No instructions provided</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bid Status</CardTitle>
                  <CardDescription>Current status and progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm font-medium">{bid.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-forest h-2.5 rounded-full" 
                          style={{ width: `${bid.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {bid.status === "draft" && (
                      <Alert>
                        <AlertDescription>
                          This bid is still in draft mode. You need to add routes and publish it to start collecting responses.
                        </AlertDescription>
                      </Alert>
                    )}

                    {bid.status === "published" && (
                      <Alert variant="info">
                        <AlertDescription>
                          Your bid is published and ready to receive responses. Invite carriers to start receiving bids.
                        </AlertDescription>
                      </Alert>
                    )}

                    {bid.status === "paused" && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          This bid is currently paused. Carriers cannot submit responses while paused.
                        </AlertDescription>
                      </Alert>
                    )}

                    {bid.status === "closed" && (
                      <Alert variant="success">
                        <AlertDescription>
                          This bid is closed. No new responses can be submitted.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {(bid.status === "draft" || bid.lanes === 0) && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-6">
                      <h3 className="text-xl font-semibold mb-2">Next Steps</h3>
                      <p className="text-muted-foreground mb-4">
                        Add routes to your bid to continue setting up your RFP
                      </p>
                      <Button
                        className="bg-forest hover:bg-forest-600"
                        onClick={() => navigate(`/bids/${bid.id}/routes/new`)}
                      >
                        Add Routes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="routes">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Routes</CardTitle>
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/bids/${bid.id}/routes/new`)}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Route
                    </Button>
                  </div>
                  <CardDescription>
                    Manage the routes for this bid
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {routesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading routes...</p>
                    </div>
                  ) : routes.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No routes have been added to this bid yet</p>
                      <Button
                        className="bg-forest hover:bg-forest-600"
                        onClick={() => navigate(`/bids/${bid.id}/routes/new`)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Your First Route
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Origin</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Equipment Type</TableHead>
                            <TableHead>Commodity</TableHead>
                            <TableHead>Distance (mi)</TableHead>
                            <TableHead>Weekly Volume</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {routes.map((route) => (
                            <TableRow key={route.id}>
                              <TableCell className="font-medium">{route.origin_city}</TableCell>
                              <TableCell>{route.destination_city}</TableCell>
                              <TableCell>{route.equipment_type}</TableCell>
                              <TableCell>{route.commodity}</TableCell>
                              <TableCell>{route.distance || '-'}</TableCell>
                              <TableCell>{route.weekly_volume}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleRemoveRoute(route.id)}
                                  title="Remove route from bid"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="carriers">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Carriers</CardTitle>
                    {(bid.status === "published" || bid.status === "active") && (
                      <InviteCarriersButton
                        bidId={bid.id}
                        bidName={bid.name}
                        status={bid.status}
                        hasRoutes={(routes && routes.length > 0)}
                        onInvitationsSent={() => {
                          // Optionally reload invitations table data here if needed
                        }}
                      />
                    )}
                  </div>
                  <CardDescription>
                    Manage carriers invited to this bid
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bid.status === "draft" ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        You can invite carriers after publishing the bid
                      </p>
                    </div>
                  ) : (
                    <div>
                      <BidInvitationsTable bidId={bid.id} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="responses">
              <Card>
                <CardHeader>
                  <CardTitle>Responses</CardTitle>
                  <CardDescription>
                    Track carrier responses to your bid
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No responses have been received yet
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>
                    Analyze bid responses and make data-driven decisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      Analytics will be available once responses are received
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BidDetails;
