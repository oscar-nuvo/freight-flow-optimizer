
import { Card, CardContent } from "@/components/ui/card";

interface BidResponsesHeaderProps {
  respondedCount: number;
  totalInvited: number;
}

export function BidResponsesHeader({ respondedCount, totalInvited }: BidResponsesHeaderProps) {
  const responseRate = totalInvited > 0 ? Math.round((respondedCount / totalInvited) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Carriers Responded</span>
            <span className="text-2xl font-bold">{respondedCount} carriers</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Response Rate</span>
            <span className="text-2xl font-bold">
              {respondedCount} of {totalInvited} invited carriers — {responseRate}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
