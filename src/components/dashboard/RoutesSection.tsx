
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MapPin, Filter, Search } from "lucide-react";
import { getRoutes, createRoute, updateRoute, deleteRoute } from "@/services/routesService";
import { Route, RouteFormValues, EquipmentType, RouteFilters } from "@/types/route";
import { RouteForm } from "@/components/routes/RouteForm";

export function RoutesSection() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<RouteFilters>({});
  const { toast } = useToast();

  const { data: routes, isLoading, refetch } = useQuery({
    queryKey: ["routes", filters],
    queryFn: () => getRoutes(filters),
  });

  const handleCreateRoute = async (values: RouteFormValues) => {
    try {
      await createRoute(values);
      toast({
        title: "Success",
        description: "Route created successfully",
      });
      setIsCreateModalOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create route",
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

  const equipmentTypes: EquipmentType[] = ["Dry Van", "Reefer", "Flatbed"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Routes</h1>
          <p className="text-muted-foreground mt-1">Manage your transportation routes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button className="bg-forest hover:bg-forest-600 sm:w-auto" onClick={() => setIsCreateModalOpen(true)}>
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
            <Input
              placeholder="Origin city"
              value={filters.origin_city || ""}
              onChange={(e) => setFilters(f => ({ ...f, origin_city: e.target.value }))}
            />
          </div>
          <div>
            <Input
              placeholder="Destination city"
              value={filters.destination_city || ""}
              onChange={(e) => setFilters(f => ({ ...f, destination_city: e.target.value }))}
            />
          </div>
          <div>
            <Select
              value={filters.equipment_type}
              onValueChange={(value) => setFilters(f => ({ ...f, equipment_type: value as EquipmentType }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Equipment Type" />
              </SelectTrigger>
              <SelectContent>
                {equipmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setFilters({})}
            >
              Reset Filters
            </Button>
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
                <Input
                  placeholder="Search routes..."
                  className="pl-9"
                  value={filters.commodity || ""}
                  onChange={(e) => setFilters(f => ({ ...f, commodity: e.target.value }))}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
          <CardDescription>
            {routes?.length || 0} routes found
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Equipment Type</TableHead>
                  <TableHead>Commodity</TableHead>
                  <TableHead>Weekly Volume</TableHead>
                  <TableHead>Distance (mi)</TableHead>
                  <TableHead>Associated Bids</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes?.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.origin_city}</TableCell>
                    <TableCell>{route.destination_city}</TableCell>
                    <TableCell>{route.equipment_type}</TableCell>
                    <TableCell>{route.commodity}</TableCell>
                    <TableCell>{route.weekly_volume}</TableCell>
                    <TableCell>{route.distance || '-'}</TableCell>
                    <TableCell>{(route as any).route_bids?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRoute(route)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Route</AlertDialogTitle>
          </AlertDialogHeader>
          <RouteForm onSubmit={handleCreateRoute} />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
