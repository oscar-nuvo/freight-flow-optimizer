
import { Route } from "@/types/route";
import { useRouteBids } from "@/hooks/useRouteBids";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface BidRoutesDisplayProps {
  bidId: string;
}

export function BidRoutesDisplay({ bidId }: BidRoutesDisplayProps) {
  const { data: routes, isLoading, isError, error } = useRouteBids(bidId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading routes...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load routes'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!routes?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No routes found for this bid.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Origin</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead>Equipment Type</TableHead>
          <TableHead>Commodity</TableHead>
          <TableHead>Weekly Volume</TableHead>
          <TableHead>Distance (mi)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {routes.map((route) => (
          <TableRow key={route.id}>
            <TableCell className="font-medium">{route.origin_city}</TableCell>
            <TableCell>{route.destination_city}</TableCell>
            <TableCell>{route.equipment_type}</TableCell>
            <TableCell>{route.commodity}</TableCell>
            <TableCell>{route.weekly_volume}</TableCell>
            <TableCell>{route.distance || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
