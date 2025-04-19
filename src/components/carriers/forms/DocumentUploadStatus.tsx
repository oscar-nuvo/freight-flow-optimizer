
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface DocumentUploadStatusProps {
  uploadStatus: Record<string, string>;
  carrierId?: string;
}

export function DocumentUploadStatus({ uploadStatus, carrierId }: DocumentUploadStatusProps) {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <p>Document Status: {Object.entries(uploadStatus).map(([field, status]) => 
          `${field}: ${status}`).join(", ")}</p>
        <p>Carrier ID: {carrierId || "Not available"}</p>
      </AlertDescription>
    </Alert>
  );
}
