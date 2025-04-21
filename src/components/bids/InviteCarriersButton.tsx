import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BidInvitationModal } from "./invitations/BidInvitationModal";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InviteCarriersButtonProps {
  bidId: string;
  bidName: string;
  status: string;
  hasRoutes?: boolean;
  invitationsCount?: number;
  onInvitationsSent?: () => void;
}

export function InviteCarriersButton({
  bidId,
  bidName,
  status,
  hasRoutes = false,
  invitationsCount = 0,
  onInvitationsSent
}: InviteCarriersButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Enable for published or active bids with at least one route
  const canInvite = (status === "published" || status === "active") && hasRoutes;

  return (
    <>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                disabled={!canInvite}
                className="flex items-center gap-2"
              >
                Invite Carriers
                {invitationsCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {invitationsCount}
                  </Badge>
                )}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {!canInvite && (
              <>
                {(status !== "published" && status !== "active") && "Bid must be published or active. "}
                {!hasRoutes && "Bid must have at least one route. "}
              </>
            )}
            {canInvite && "Invite carriers to participate in this bid"}
          </TooltipContent>
        </Tooltip>
      </div>

      <BidInvitationModal
        bidId={bidId}
        bidName={bidName}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInvitationsSent={() => {
          if (onInvitationsSent) onInvitationsSent();
        }}
      />
    </>
  );
}
