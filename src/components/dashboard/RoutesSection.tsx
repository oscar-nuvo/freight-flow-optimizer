
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { MapPin, Filter, Search } from "lucide-react";
import { getRoutes, createRoute, updateRoute, deleteRoute } from "@/services/routesService";
import { Route, RouteFormValues, EquipmentType, RouteFilters } from "@/types/route";
import { RouteForm } from "@/components/routes/RouteForm";
import { RoutesFilter } from "@/components/routes/RoutesFilter";
import { RoutesTable } from "@/components/routes/RoutesTable";

export function RoutesSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routeToEdit, setRouteToEdit] = useState<Route | null>(null);
  const [filters, setFilters] = useState<RouteFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: routesData, isLoading, refetch } = useQuery({
    queryKey: ["routes", filters],
    queryFn: () => getRoutes(filters),
  });

  // Ensure routes have the correct type by casting equipment_type to EquipmentType
  const routes: Route[] | undefined = routesData?.map(route => ({
    ...route,
    equipment_type: route.equipment_type as EquipmentType
  }));

  const handleCreateOrUpdateRoute = async (values: RouteFormValues) => {
    try {
      if (routeToEdit) {
        await updateRoute(routeToEdit.id, values);
        toast({
          title: "Success",
          description: "Route updated successfully",
        });
      } else {
        await createRoute(values);
        toast({
          title: "Success",
          description: "Route created successfully",
        });
      }
      setIsModalOpen(false);
      setRouteToEdit(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save route",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoute = async (route: Route) => {
    try {
      await deleteRoute(route.id);
      toast({
        title: "Success",
        description: "Route deleted successfully",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete route",
        variant: "destructive",
      });
    }
  };

  const handleEditRoute = (route: Route) => {
    setRouteToEdit(route);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setRouteToEdit(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRouteToEdit(null);
  };

  const handleFilterChange = (newFilters: RouteFilters) => {
    setFilters(newFilters);
  };

  // Filter routes by search term across multiple fields
  const filteredRoutes = routes?.filter(route => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      route.origin_city.toLowerCase().includes(term) ||
      route.destination_city.toLowerCase().includes(term) ||
      route.commodity.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Routes</h1>
          <p className="text-muted-foreground mt-1">Manage your transportation routes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button className="bg-forest hover:bg-forest-600 sm:w-auto" onClick={handleOpenCreateModal}>
            <MapPin className="h-4 w-4 mr-2" />
            Create Route
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
            <CardTitle className="text-lg">All Routes</CardTitle>
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
            {filteredRoutes?.length || 0} routes found
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <RoutesTable 
            routes={filteredRoutes || null} 
            isLoading={isLoading}
            onEditRoute={handleEditRoute}
            onDeleteRoute={handleDeleteRoute}
          />
        </CardContent>
      </Card>

      <AlertDialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {routeToEdit ? "Edit Route" : "Create New Route"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <RouteForm 
            onSubmit={handleCreateOrUpdateRoute} 
            defaultValues={routeToEdit || undefined}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
