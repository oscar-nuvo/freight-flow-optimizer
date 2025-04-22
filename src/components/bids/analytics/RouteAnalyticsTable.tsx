
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RouteAnalyticsTableProps {
  data: {
    routeId: string;
    origin: string;
    destination: string;
    equipmentType: string;
    commodity: string;
    bestRate: number | null;
    bestRateCarriers: { id: string; name: string }[];
    averageRate: number | null;
    responseCount: number;
    isOutlier: boolean;
  }[];
}

export function RouteAnalyticsTable({ data }: RouteAnalyticsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Origin</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Equipment</TableHead>
            <TableHead>Best Rate</TableHead>
            <TableHead>Average Rate</TableHead>
            <TableHead>Responses</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((route) => (
            <TableRow key={route.routeId}>
              <TableCell>{route.origin}</TableCell>
              <TableCell>{route.destination}</TableCell>
              <TableCell>{route.equipmentType}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {route.bestRate 
                    ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            ${route.bestRate.toFixed(2)}/mile
                          </TooltipTrigger>
                          <TooltipContent>
                            Best rate by: {route.bestRateCarriers.map(c => c.name).join(', ')}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                    : '-'
                  }
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {route.averageRate 
                    ? (
                      <>
                        ${route.averageRate.toFixed(2)}/mile
                        {route.isOutlier && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                This rate is an outlier (±2 SD from mean)
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </>
                    )
                    : '-'
                  }
                </div>
              </TableCell>
              <TableCell>{route.responseCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
