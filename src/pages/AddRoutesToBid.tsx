
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { associateRouteWithBid, getRoutesByBid, createRoute } from "@/services/routesService";
import { RouteFormValues } from "@/types/route";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, MapPin, Plus } from "lucide-react";
import { CreateRouteModal } from "@/components/routes/CreateRouteModal";
import { EnhancedRoutesFilter } from "@/components/routes/EnhancedRoutesFilter";
import { EnhancedRoutesTable } from "@/components/routes/EnhancedRoutesTable";
import { useRouteSearch } from "@/hooks/useRouteSearch";

const AddRoutesToBid = () => {
  const { id: bidId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);

  // Use the custom hook for route search
  const {
    routes,
    isLoading: isRoutesLoading,
    isSearching,
    isError,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    refetch: refetchRoutes,
    resultsCount
  } = useRouteSearch();

  // Fetch routes already associated with this bid
  const { data: existingBidRoutes, isLoading: isExistingRoutesLoading, refetch: refetchBidRoutes } = useQuery({
    queryKey: ["bidRoutes", bidId],
    queryFn: () => bidId ? getRoutesByBid(bidId) : Promise.resolve([]),
    enabled: !!bidId,
  });

  // Create a set of existing route IDs for fast lookup
  const existingRouteIds = new Set(existingBidRoutes?.map(route => route.id) || []);

  const handleRouteSelect = (routeId: string) => {
    if (existingRouteIds.has(routeId)) {
      return;
    }

    setSelectedRoutes(prev => 
      prev.includes(routeId) 
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  const handleAddRoutes = async () => {
    if (!bidId || selectedRoutes.length === 0) return;

    setIsSubmitting(true);
    try {
      for (const routeId of selectedRoutes) {
        await associateRouteWithBid(routeId, bidId);
      }

      toast({
        title: "Success",
        description: `${selectedRoutes.length} routes added to bid successfully`,
      });

      navigate(`/bids/${bidId}`);
    } catch (error: any) {
      console.error("Error adding routes to bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add routes to bid",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRoute = async (values: RouteFormValues) => {
    setIsCreatingRoute(true);
    try {
      console.log("Creating new route:", values);
      const newRoute = await createRoute(values);
      console.log("Route created successfully:", newRoute);

      if (newRoute && bidId) {
        console.log("Associating new route with bid:", bidId);
        await associateRouteWithBid(newRoute.id, bidId);
        
        toast({
          title: "Route Added Successfully", 
          description: `This new route has been added to the bid`
        });

        refetchRoutes(); // Refresh the routes list
        refetchBidRoutes(); // Refresh the bid routes list
      }
      setIsCreateModalOpen(false);
    } catch (error: any) {
      console.error("Error creating route:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create route",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRoute(false);
    }
  };

  const isLoading = isRoutesLoading || isExistingRoutesLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => navigate(`/bids/${bidId}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Bid
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Add Routes to Bid</h1>
              <p className="text-muted-foreground mt-1">Select or create routes to add to this bid</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              variant="outline"
              className="sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Route
            </Button>
            <Button 
              onClick={handleAddRoutes}
              disabled={selectedRoutes.length === 0 || isSubmitting}
              className="bg-forest hover:bg-forest-600"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Add {selectedRoutes.length} Routes to Bid
            </Button>
          </div>
        </div>

        <EnhancedRoutesFilter 
          filters={filters} 
          onFilterChange={setFilters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isSearching={isSearching}
          resultsCount={resultsCount}
        />

        <Card>
          <CardHeader className="px-6 py-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Available Routes</CardTitle>
              <div className="text-sm text-muted-foreground">
                {resultsCount} routes found
              </div>
            </div>
            <CardDescription>
              {existingBidRoutes?.length ? `${existingBidRoutes.length} routes already added to this bid` : "No routes added to this bid yet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <EnhancedRoutesTable 
              routes={routes} 
              isLoading={isLoading}
              isError={isError}
              isSearching={isSearching}
              selectedRoutes={selectedRoutes}
              onRouteSelect={handleRouteSelect}
              disabledRoutes={existingRouteIds}
              emptyMessage={
                searchTerm || (filters && Object.values(filters).some(Boolean))
                  ? "No routes match your search criteria. Try adjusting your filters."
                  : "No routes found. Create your first route to get started."
              }
            />
          </CardContent>
        </Card>

        <CreateRouteModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onRouteCreated={handleCreateRoute}
          isSubmitting={isCreatingRoute}
        />
      </div>
    </DashboardLayout>
  );
};

export default AddRoutesToBid;
