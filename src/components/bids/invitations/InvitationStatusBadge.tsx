
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
        // Explicitly treat the status as string in the default case
        // This helps TypeScript understand we're dealing with a string
        return typeof status === 'string' 
          ? (status.length > 0 
              ? status.charAt(0).toUpperCase() + status.slice(1)
              : "Unknown Status")
          : "Unknown Status";
    }
  };

  return (
    <Badge variant={getVariant()} className={className}>
      {getLabel()}
    </Badge>
  );
}
