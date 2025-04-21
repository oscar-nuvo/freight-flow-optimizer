
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from 'date-fns';
import { ResponseDetailsDrawer } from './ResponseDetailsDrawer';
import { getBidResponseDetails } from "@/services/bidResponsesService";
import { Route } from "@/types/route";

interface ResponsesTableProps {
  responses: any[];
  totalInvited: number;
  routes: Route[];
  currency: string;
}

export function ResponsesTable({ responses, totalInvited, routes, currency }: ResponsesTableProps) {
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [responseDetails, setResponseDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleViewDetails = async (response: any) => {
    try {
      setIsLoading(true);
      setSelectedResponse(response);
      
      const details = await getBidResponseDetails(response.id);
      setResponseDetails(details);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error("Error fetching response details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setResponseDetails(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Carrier</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Routes With Rates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No responses received yet
                </TableCell>
              </TableRow>
            ) : (
              responses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell className="font-medium">{response.carriers?.name || 'Unknown'}</TableCell>
                  <TableCell>{response.responder_name}</TableCell>
                  <TableCell>{formatDate(response.submitted_at)}</TableCell>
                  <TableCell>{response.routes_submitted}/{routes.length}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleViewDetails(response)}
                      disabled={isLoading && selectedResponse?.id === response.id}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ResponseDetailsDrawer 
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        response={responseDetails}
        routes={routes}
        currency={currency}
      />
    </div>
  );
}
