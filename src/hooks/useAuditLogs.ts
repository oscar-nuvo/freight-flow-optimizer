
import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs, AuditLogEntry } from "@/services/auditLogsService";

export function useAuditLogs(limit = 50, offset = 0) {
  const query = useQuery<AuditLogEntry[], Error>({
    queryKey: ["auditLogs", { limit, offset }],
    queryFn: () => fetchAuditLogs(limit, offset),
  });

  return query;
}
