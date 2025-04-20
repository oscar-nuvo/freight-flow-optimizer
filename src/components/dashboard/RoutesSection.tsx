
import { useState } from "react";
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
import { MapPin, Plus } from "lucide-react";
import { createRoute, updateRoute, deleteRoute } from "@/services/routesService";
import { Route, RouteFormValues } from "@/types/route";
import { RouteForm } from "@/components/routes/RouteForm";
import { EnhancedRoutesFilter } from "@/components/routes/EnhancedRoutesFilter";
import { EnhancedRoutesTable } from "@/components/routes/EnhancedRoutesTable";
import { useRouteSearch } from "@/hooks/useRouteSearch";

export function RoutesSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routeToEdit, setRouteToEdit] = useState<Route | null>(null);
  const { toast } = useToast();
  
  const {
    routes,
    isLoading,
    isSearching,
    isError,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    refetch,
    resultsCount
  } = useRouteSearch();

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
            <CardTitle className="text-lg">All Routes</CardTitle>
            <div className="text-sm text-muted-foreground">
              {resultsCount} routes found
            </div>
          </div>
          <CardDescription>
            {searchTerm || (filters && Object.values(filters).some(Boolean)) 
              ? "Filtered results based on your search criteria" 
              : "Showing all routes"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <EnhancedRoutesTable 
            routes={routes} 
            isLoading={isLoading}
            isError={isError}
            isSearching={isSearching}
            onEditRoute={handleEditRoute}
            onDeleteRoute={handleDeleteRoute}
            emptyMessage={
              searchTerm || (filters && Object.values(filters).some(Boolean))
                ? "No routes match your search criteria. Try adjusting your filters."
                : "No routes found. Create your first route to get started."
            }
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
