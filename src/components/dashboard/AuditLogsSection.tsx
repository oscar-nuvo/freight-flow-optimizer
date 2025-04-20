
import React from "react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const AuditLogsSection: React.FC = () => {
  const { data, isLoading, isError, error } = useAuditLogs();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>
          Review changes to routes, bids, and carriers in your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>
            <Skeleton className="h-10 w-full my-2" />
            <Skeleton className="h-10 w-full my-2" />
            <Skeleton className="h-10 w-full my-2" />
          </div>
        ) : isError ? (
          <div className="flex items-center text-destructive gap-2">
            <AlertCircle className="h-4 w-4" />
            Error loading audit logs: {error?.message}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">No audit logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                    <TableCell>{log.entity_type} ({log.entity_id.slice(0, 6)}...)</TableCell>
                    <TableCell className="capitalize">{log.action}</TableCell>
                    <TableCell>
                      {log.user_id ? (
                        <code className="text-xs bg-muted p-1 rounded">
                          {log.user_id.slice(0, 8)}...
                        </code>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      <details>
                        <summary className="cursor-pointer">View</summary>
                        <pre className="text-xs whitespace-pre-line bg-muted p-2 rounded">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </details>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
