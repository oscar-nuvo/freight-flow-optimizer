
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EnhancedRoutesTableProps {
  routes: Route[] | null;
  isLoading: boolean;
  isError: boolean;
  onEditRoute?: (route: Route) => void;
  onDeleteRoute?: (route: Route) => void;
  selectedRoutes?: string[];
  onRouteSelect?: (routeId: string) => void;
  disabledRoutes?: Set<string>;
  emptyMessage?: string;
  isSearching?: boolean;
}

export function EnhancedRoutesTable({ 
  routes, 
  isLoading, 
  isError,
  onEditRoute, 
  onDeleteRoute,
  selectedRoutes = [],
  onRouteSelect,
  disabledRoutes = new Set(),
  emptyMessage = "No routes found. Create your first route to get started.",
  isSearching = false
}: EnhancedRoutesTableProps) {
  if (isLoading || isSearching) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSearching ? "Searching routes..." : "Loading routes..."}
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          There was an error loading routes. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!routes || routes.length === 0) {
    return <div className="py-8 text-center">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {onRouteSelect && <TableHead className="w-12"></TableHead>}
            <TableHead>Origin</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Equipment Type</TableHead>
            <TableHead>Commodity</TableHead>
            <TableHead>Weekly Volume</TableHead>
            <TableHead>Distance (mi)</TableHead>
            {!onRouteSelect && <TableHead>Associated Bids</TableHead>}
            {(onEditRoute || onDeleteRoute) && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route) => {
            const isSelected = selectedRoutes.includes(route.id);
            const isDisabled = disabledRoutes.has(route.id);
            
            return (
              <TableRow 
                key={route.id} 
                className={`
                  ${isSelected ? 'bg-muted/30' : ''} 
                  ${isDisabled ? 'opacity-50' : ''}
                  ${onRouteSelect && !isDisabled ? 'cursor-pointer' : ''}
                `}
                onClick={() => {
                  if (onRouteSelect && !isDisabled) {
                    onRouteSelect(route.id);
                  }
                }}
              >
                {onRouteSelect && (
                  <TableCell className="py-3 px-2">
                    <Checkbox 
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={() => {
                        if (onRouteSelect && !isDisabled) {
                          onRouteSelect(route.id);
                        }
                      }}
                      className="ml-2"
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{route.origin_city}</TableCell>
                <TableCell>{route.destination_city}</TableCell>
                <TableCell>{route.equipment_type}</TableCell>
                <TableCell>{route.commodity}</TableCell>
                <TableCell>{route.weekly_volume}</TableCell>
                <TableCell>{route.distance || '-'}</TableCell>
                {!onRouteSelect && (
                  <TableCell>{route.route_bids?.length || 0}</TableCell>
                )}
                {(onEditRoute || onDeleteRoute) && (
                  <TableCell className="text-right">
                    <RouteActions 
                      route={route} 
                      onEdit={onEditRoute || (() => {})} 
                      onDelete={onDeleteRoute || (() => {})}
                    />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
