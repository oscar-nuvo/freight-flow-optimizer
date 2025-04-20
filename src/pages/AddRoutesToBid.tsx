
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getRoutes, associateRouteWithBid, getRoutesByBid, createRoute } from "@/services/routesService";
import { Route, EquipmentType, RouteFilters, RouteFormValues } from "@/types/route";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Search, Filter, MapPin, Plus } from "lucide-react";
import { RoutesFilter } from "@/components/routes/RoutesFilter";
import { CreateRouteModal } from "@/components/routes/CreateRouteModal";

const AddRoutesToBid = () => {
  const { id: bidId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<RouteFilters>({});
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);

  const { data: routesData, isLoading: isRoutesLoading, refetch: refetchRoutes } = useQuery({
    queryKey: ["routes", filters],
    queryFn: () => getRoutes(filters),
  });

  const { data: existingBidRoutes, isLoading: isExistingRoutesLoading, refetch: refetchBidRoutes } = useQuery({
    queryKey: ["bidRoutes", bidId],
    queryFn: () => bidId ? getRoutesByBid(bidId) : Promise.resolve([]),
    enabled: !!bidId,
  });

  const existingRouteIds = new Set(existingBidRoutes?.map(route => route.id) || []);

  const routes: Route[] | undefined = routesData?.map(route => ({
    ...route,
    equipment_type: route.equipment_type as EquipmentType
  }));

  const filteredRoutes = routes?.filter(route => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      route.origin_city.toLowerCase().includes(term) ||
      route.destination_city.toLowerCase().includes(term) ||
      route.commodity.toLowerCase().includes(term)
    );
  });

  const handleFilterChange = (newFilters: RouteFilters) => {
    setFilters(newFilters);
  };

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
        
        // Specific success toast for route creation and bid association
        toast({
          title: "Route Added Successfully", 
          description: `This new route has been added to the bid`, 
          variant: "success"  // Use the success variant if available
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

        <RoutesFilter 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />

        <Card>
          <CardHeader className="px-6 py-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Available Routes</CardTitle>
              <div className="flex space-x-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search routes..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
            <CardDescription>
              {filteredRoutes?.length || 0} routes found ({existingBidRoutes?.length || 0} already added)
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            {isLoading ? (
              <div className="py-8 text-center">Loading routes...</div>
            ) : !filteredRoutes || filteredRoutes.length === 0 ? (
              <div className="py-8 text-center">
                No routes found. Create your first route to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground w-16"></th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Origin</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Destination</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Equipment Type</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Commodity</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Weekly Volume</th>
                      <th className="py-3 px-2 text-left font-medium text-muted-foreground">Distance (mi)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoutes.map((route) => {
                      const isRouteAssociated = existingRouteIds.has(route.id);
                      return (
                        <tr 
                          key={route.id} 
                          className={`border-b hover:bg-muted/50 ${selectedRoutes.includes(route.id) ? 'bg-muted/30' : ''} ${isRouteAssociated ? 'opacity-50' : ''}`}
                          onClick={() => !isRouteAssociated && handleRouteSelect(route.id)}
                        >
                          <td className="py-3 px-2">
                            <Checkbox 
                              checked={selectedRoutes.includes(route.id)}
                              disabled={isRouteAssociated}
                              onCheckedChange={() => handleRouteSelect(route.id)}
                              className="ml-2"
                            />
                          </td>
                          <td className="py-3 px-2 font-medium">{route.origin_city}</td>
                          <td className="py-3 px-2">{route.destination_city}</td>
                          <td className="py-3 px-2">{route.equipment_type}</td>
                          <td className="py-3 px-2">{route.commodity}</td>
                          <td className="py-3 px-2">{route.weekly_volume}</td>
                          <td className="py-3 px-2">{route.distance || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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

