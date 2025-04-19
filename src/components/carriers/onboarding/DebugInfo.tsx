
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DebugInfoProps {
  debugInfo: string;
  checkDocumentStatus: () => string;
}

export function DebugInfo({ debugInfo, checkDocumentStatus }: DebugInfoProps) {
  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <Alert className="mb-4">
      <AlertDescription>
        <p><strong>Debug Info:</strong> {debugInfo}</p>
        <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
          {checkDocumentStatus()}
        </pre>
      </AlertDescription>
    </Alert>
  );
}
