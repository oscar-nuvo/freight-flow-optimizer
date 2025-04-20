
import { Badge } from "@/components/ui/badge";
import { InvitationStatus } from "@/types/invitation";

interface InvitationStatusBadgeProps {
  status: InvitationStatus;
  className?: string;
}

export function InvitationStatusBadge({ status, className }: InvitationStatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case "pending":
        return "outline";
      case "delivered":
        return "secondary";
      case "opened":
        return "default";
      case "responded":
        return "default";
      case "revoked":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getLabel = (): string => {
    switch (status) {
      case "pending":
        return "Pending";
      case "delivered":
        return "Delivered";
      case "opened":
        return "Opened";
      case "responded":
        return "Responded";
      case "revoked":
        return "Revoked";
      default:
        // TypeScript should never reach here since status is an InvitationStatus,
        // but provide a defensive fallback for unexpected input.
        const fallback = String(status);
        return fallback ? fallback.charAt(0).toUpperCase() + fallback.slice(1) : "Unknown Status";
    }
  };

  return (
    <Badge variant={getVariant()} className={className}>
      {getLabel()}
    </Badge>
  );
}
