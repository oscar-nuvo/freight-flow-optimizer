
import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ResponseDetailsDrawer } from "./ResponseDetailsDrawer";
import { getBidResponseDetails } from "@/services/bidResponsesService";
import { Route } from "@/types/route";

interface ResponsesTableProps {
  responses: any[];
  routes: Route[];
  currency: string;
}

export function ResponsesTable({
  responses,
  routes,
  currency,
}: ResponsesTableProps) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleViewDetails = async (response: any) => {
    setSelectedResponse(response);
    setOpenDrawer(true);
    setLoading(true);
    try {
      const detail = await getBidResponseDetails(response.id);
      setDetails(detail);
    } catch (e) {
      setDetails(null);
    }
    setLoading(false);
  };

  if (!responses || responses.length === 0) {
    return (
      <div className="w-full">
        <div className="text-center py-12 text-muted-foreground">
          <div className="mb-4 text-lg font-medium">No responses have been submitted yet.</div>
          <div className="mb-2">
            {routes.length === 0
              ? "There are currently no routes available for this bid."
              : "This page will show responses as they are submitted by carriers."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Carrier Name</TableHead>
            <TableHead>Submitted By</TableHead>
            <TableHead>Submitted At</TableHead>
            <TableHead>Routes With Rates</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {responses.map((resp) => (
            <TableRow key={resp.id}>
              <TableCell>{resp.carriers?.name ?? "Unknown Carrier"}</TableCell>
              <TableCell>
                <div>
                  <div>{resp.responder_name}</div>
                  <div className="text-xs text-muted-foreground">{resp.responder_email}</div>
                </div>
              </TableCell>
              <TableCell>
                {resp.submitted_at
                  ? new Date(resp.submitted_at).toLocaleString()
                  : ""}
              </TableCell>
              <TableCell>
                {resp.routes_submitted} / {routes.length}
                {resp.routes_submitted < routes.length && (
                  <span className="ml-2 text-xs text-yellow-600 font-medium">(Partial)</span>
                )}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(resp)}>
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ResponseDetailsDrawer
        open={openDrawer}
        onClose={() => {
          setOpenDrawer(false);
          setTimeout(() => {
            setSelectedResponse(null);
            setDetails(null);
          }, 200);
        }}
        response={details}
        routes={routes}
        currency={currency}
        loading={loading}
      />
    </div>
  );
}
