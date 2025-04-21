
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download } from "lucide-react";
import { BidResponsesHeader } from './BidResponsesHeader';
import { ResponsesTable } from './ResponsesTable';
import { getBidResponses, exportBidResponses } from '@/services/bidResponsesService';
import { Route } from "@/types/route";
import { useToast } from "@/hooks/use-toast";

interface BidResponsesSectionProps {
  bidId: string;
  routes: Route[];
  invitationsCount: number;
  currency?: string;
}

export function BidResponsesSection({ 
  bidId, 
  routes, 
  invitationsCount,
  currency = "USD"
}: BidResponsesSectionProps) {
  const [responses, setResponses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setIsLoading(true);
        const data = await getBidResponses(bidId);
        setResponses(data);
      } catch (error) {
        console.error("Error fetching responses:", error);
        toast({
          title: "Error",
          description: "Failed to load responses. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (bidId) {
      fetchResponses();
    }
  }, [bidId, toast]);

  const handleExportResponses = async () => {
    try {
      setIsExporting(true);
      const exportData = await exportBidResponses(bidId, routes);
      
      if (!exportData || exportData.length === 0) {
        toast({
          title: "No data",
          description: "There are no responses to export",
          variant: "destructive",
        });
        return;
      }
      
      // Convert data to CSV
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle values that might contain commas or quotes
            const cellValue = (value === null || value === undefined) ? '' : String(value);
            return `"${cellValue.replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');
      
      // Create a Blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bid-responses-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: "Responses have been exported to CSV",
      });
    } catch (error) {
      console.error("Error exporting responses:", error);
      toast({
        title: "Export failed",
        description: "Could not export responses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Responses</h2>
        <Button 
          variant="outline" 
          onClick={handleExportResponses}
          disabled={isExporting || responses.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export All Responses
        </Button>
      </div>
      
      <BidResponsesHeader 
        respondedCount={responses.length} 
        totalInvited={invitationsCount} 
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Carrier Responses</CardTitle>
          <CardDescription>
            All carriers who have submitted responses to this bid
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsesTable 
              responses={responses} 
              totalInvited={invitationsCount}
              routes={routes}
              currency={currency}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

