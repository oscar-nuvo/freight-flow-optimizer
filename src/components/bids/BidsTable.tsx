
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Bid } from "@/types/bid";

interface BidsTableProps {
  bids: Bid[];
  loading?: boolean;
}

export function BidsTable({ bids, loading }: BidsTableProps) {
  const navigate = useNavigate();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
      case "published":
        return "default";
      case "completed":
      case "closed":
        return "secondary";
      case "draft":
        return "outline";
      case "paused":
        return "destructive";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No bids found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Carriers</TableHead>
            <TableHead>Lanes</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Equipment</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((bid) => (
            <TableRow key={bid.id}>
              <TableCell>
                <div className="font-medium">{bid.name}</div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(bid.status)}>
                  {bid.status === "published" ? "Active" : bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{bid.carriers || 0}</TableCell>
              <TableCell>{bid.lanes || 0}</TableCell>
              <TableCell>{bid.submission_date ? new Date(bid.submission_date).toLocaleDateString() : "Not set"}</TableCell>
              <TableCell>{bid.start_date ? new Date(bid.start_date).toLocaleDateString() : "Not set"}</TableCell>
              <TableCell>
                {bid.equipment_type ? (
                  bid.equipment_type === "dry_van" ? "53' Dry Van" :
                  bid.equipment_type === "reefer" ? "Reefer" :
                  bid.equipment_type === "flatbed" ? "Flatbed" : ""
                ) : "Not set"}
              </TableCell>
              <TableCell>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-forest h-2.5 rounded-full" 
                    style={{ width: `${bid.progress || 0}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-1">{bid.progress || 0}%</span>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/bids/${bid.id}`)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
