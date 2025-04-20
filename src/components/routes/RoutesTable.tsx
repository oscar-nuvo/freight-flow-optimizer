
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Route, EquipmentType } from "@/types/route";
import { RouteActions } from "./RouteActions";

interface RoutesTableProps {
  routes: Route[] | null;
  isLoading: boolean;
  onEditRoute: (route: Route) => void;
  onDeleteRoute: (route: Route) => void;
}

export function RoutesTable({ 
  routes, 
  isLoading, 
  onEditRoute, 
  onDeleteRoute 
}: RoutesTableProps) {
  if (isLoading) {
    return <div className="py-8 text-center">Loading routes...</div>;
  }

  if (!routes || routes.length === 0) {
    return <div className="py-8 text-center">No routes found. Create your first route to get started.</div>;
  }

  return (
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
          {routes.map((routeData) => {
            // Ensure type safety by casting the route data to the correct type
            const route: Route = {
              ...routeData,
              equipment_type: routeData.equipment_type as EquipmentType,
              route_bids: routeData.route_bids || []
            };
            
            return (
              <TableRow key={route.id}>
                <TableCell className="font-medium">{route.origin_city}</TableCell>
                <TableCell>{route.destination_city}</TableCell>
                <TableCell>{route.equipment_type}</TableCell>
                <TableCell>{route.commodity}</TableCell>
                <TableCell>{route.weekly_volume}</TableCell>
                <TableCell>{route.distance || '-'}</TableCell>
                <TableCell>{route.route_bids?.length || 0}</TableCell>
                <TableCell className="text-right">
                  <RouteActions 
                    route={route} 
                    onEdit={onEditRoute} 
                    onDelete={onDeleteRoute}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
