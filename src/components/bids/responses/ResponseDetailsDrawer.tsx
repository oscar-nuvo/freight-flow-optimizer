
import { useEffect, useState } from "react";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription,
  DrawerClose,
  DrawerFooter
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X } from "lucide-react";
import { format } from 'date-fns';
import { Route } from "@/types/route";

interface ResponseDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  response: any;
  routes: Route[];
  currency: string;
  loading?: boolean;
}

export function ResponseDetailsDrawer({ 
  open, 
  onClose, 
  response, 
  routes,
  currency,
  loading = false
}: ResponseDetailsDrawerProps) {
  const [routesWithRates, setRoutesWithRates] = useState<any[]>([]);

  useEffect(() => {
    if (response && routes) {
      // Map routes with their rates, if available
      const mappedRoutes = routes.map(route => {
        const rate = response.rates?.find((r: any) => r.route_id === route.id);
        return {
          ...route,
          rate: rate?.value,
          currency: rate?.currency || currency,
          comment: rate?.comment || ""
        };
      });
      
      setRoutesWithRates(mappedRoutes);
    }
  }, [response, routes, currency]);

  if (!open || !response) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh] overflow-auto">
        <DrawerHeader>
          <DrawerTitle className="text-xl flex items-center justify-between">
            <span>Response Details</span>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerTitle>
          <DrawerDescription>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Carrier</p>
                  <p className="font-medium">{response.carriers?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted At</p>
                  <p>{formatDate(response.submitted_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Responder Name</p>
                  <p>{response.responder_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Responder Email</p>
                  <p>{response.responder_email}</p>
                </div>
              </div>
            </div>
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 py-2">
          <h3 className="font-medium mb-2">Route Rates</h3>
          <div className="rounded-md border overflow-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routesWithRates.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>{route.origin_city}</TableCell>
                    <TableCell>{route.destination_city}</TableCell>
                    <TableCell>{route.equipment_type}</TableCell>
                    <TableCell>
                      {route.rate !== undefined && route.rate !== null 
                        ? `${route.rate} ${route.currency}`
                        : "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {route.comment || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <DrawerFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
