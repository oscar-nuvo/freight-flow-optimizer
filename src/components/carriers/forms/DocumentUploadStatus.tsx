
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface DocumentUploadStatusProps {
  uploadStatus: Record<string, string>;
  carrierId?: string;
}

export function DocumentUploadStatus({ uploadStatus, carrierId }: DocumentUploadStatusProps) {
  // Safety check for production/dev environment
  if (process.env.NODE_ENV !== 'development') return null;
  
  // Ensure uploadStatus exists and is not empty before rendering
  const hasStatus = uploadStatus && Object.keys(uploadStatus).length > 0;

  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertDescription>
        {hasStatus ? (
          <p>Document Status: {Object.entries(uploadStatus).map(([field, status]) => 
            `${field}: ${status}`).join(", ")}</p>
        ) : (
          <p>No document status available</p>
        )}
        <p>Carrier ID: {carrierId || "Not available"}</p>
      </AlertDescription>
    </Alert>
  );
}
