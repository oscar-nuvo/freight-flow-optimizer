
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Route } from "@/types/route";
import { RouteRateFormValue } from "@/types/bidResponse";

interface RouteRatesFormProps {
  routes: Route[];
  initialValues: Record<string, RouteRateFormValue>;
  onChange: (values: Record<string, RouteRateFormValue>) => void;
  currency: string;
}

export function RouteRatesForm({ routes, initialValues, onChange, currency }: RouteRatesFormProps) {
  const [rateValues, setRateValues] = useState<Record<string, RouteRateFormValue>>(initialValues || {});

  useEffect(() => {
    setRateValues(initialValues || {});
  }, [initialValues]);

  const handleRateChange = (routeId: string, value: string) => {
    // Convert empty string to null, otherwise parse as number
    const numericValue = value === "" ? null : parseFloat(value);
    
    const updatedValues = {
      ...rateValues,
      [routeId]: {
        ...((rateValues[routeId] || {}) as RouteRateFormValue),
        value: isNaN(numericValue as number) ? null : numericValue
      }
    };
    
    setRateValues(updatedValues);
    onChange(updatedValues);
  };

  const handleCommentChange = (routeId: string, comment: string) => {
    const updatedValues = {
      ...rateValues,
      [routeId]: {
        ...((rateValues[routeId] || {}) as RouteRateFormValue),
        comment: comment || undefined
      }
    };
    
    setRateValues(updatedValues);
    onChange(updatedValues);
  };

  if (routes.length === 0) {
    return <div className="text-center p-6 bg-gray-50 rounded-lg">No routes available for this bid.</div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Origin</TableHead>
            <TableHead className="w-[180px]">Destination</TableHead>
            <TableHead className="w-[120px]">Equipment</TableHead>
            <TableHead className="w-[100px]">Weekly Volume</TableHead>
            <TableHead className="w-[120px]">Commodity</TableHead>
            <TableHead className="w-[150px]">Rate ({currency})</TableHead>
            <TableHead>Comments (Optional)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map(route => (
            <TableRow key={route.id}>
              <TableCell>{route.origin_city}</TableCell>
              <TableCell>{route.destination_city}</TableCell>
              <TableCell>{route.equipment_type}</TableCell>
              <TableCell>{route.weekly_volume}</TableCell>
              <TableCell>{route.commodity}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="Enter rate"
                  min={0}
                  step="0.01"
                  value={
                    rateValues[route.id]?.value !== null && 
                    rateValues[route.id]?.value !== undefined ? 
                    rateValues[route.id].value : ""
                  }
                  onChange={(e) => handleRateChange(route.id, e.target.value)}
                  className="max-w-[120px]"
                />
              </TableCell>
              <TableCell>
                <Textarea
                  placeholder="Optional notes about this route"
                  value={rateValues[route.id]?.comment || ""}
                  onChange={(e) => handleCommentChange(route.id, e.target.value)}
                  className="min-h-[60px] text-sm"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default RouteRatesForm;
