
import { supabase } from "@/integrations/supabase/client";

export interface AuditLogEntry {
  id: string;
  created_at: string;
  organization_id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  changes: any;
  metadata: any;
  ip_address: string | null;
}

export const fetchAuditLogs = async (limit = 50, offset = 0): Promise<AuditLogEntry[]> => {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }

  return data as AuditLogEntry[];
};
