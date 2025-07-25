import { supabase } from "@/integrations/supabase/client";
import { AuditLogEntry } from "./auditLogsService";

export interface ActivityItem {
  id: string;
  type: 'bid' | 'carrier' | 'route' | 'invitation' | 'response';
  action: 'create' | 'update' | 'delete' | 'invite' | 'respond' | 'complete';
  title: string;
  description: string;
  timestamp: string;
  entityId: string;
  entityName?: string;
  changes?: any;
  metadata?: any;
  colorClass: string;
  icon: string;
}

// Map entity types and actions to user-friendly descriptions
const getActivityDescription = (log: AuditLogEntry): { title: string; description: string; type: ActivityItem['type']; action: ActivityItem['action'] } => {
  const entityType = log.entity_type.toLowerCase();
  const action = log.action.toLowerCase();
  
  // Extract entity name from changes if available
  const entityName = log.changes?.new?.name || log.changes?.bid?.name || log.changes?.carrier?.name || log.changes?.route?.origin_city;
  const shortId = log.entity_id.slice(0, 8);

  switch (entityType) {
    case 'bid':
      switch (action) {
        case 'create':
          return {
            title: 'New bid created',
            description: entityName ? `${entityName} was created` : `Bid ${shortId} was created`,
            type: 'bid',
            action: 'create'
          };
        case 'update':
          return {
            title: 'Bid updated',
            description: entityName ? `${entityName} was updated` : `Bid ${shortId} was updated`,
            type: 'bid',
            action: 'update'
          };
        case 'delete':
          return {
            title: 'Bid deleted',
            description: entityName ? `${entityName} was deleted` : `Bid ${shortId} was deleted`,
            type: 'bid',
            action: 'delete'
          };
        default:
          return {
            title: 'Bid activity',
            description: `Bid ${shortId} ${action}`,
            type: 'bid',
            action: action as ActivityItem['action']
          };
      }
      
    case 'carrier':
      switch (action) {
        case 'create':
          return {
            title: 'Carrier added',
            description: entityName ? `${entityName} was added to the system` : `New carrier ${shortId} was added`,
            type: 'carrier',
            action: 'create'
          };
        case 'update':
          return {
            title: 'Carrier updated',
            description: entityName ? `${entityName} information was updated` : `Carrier ${shortId} was updated`,
            type: 'carrier',
            action: 'update'
          };
        default:
          return {
            title: 'Carrier activity',
            description: `Carrier ${shortId} ${action}`,
            type: 'carrier',
            action: action as ActivityItem['action']
          };
      }
      
    case 'route':
      const routeDesc = log.changes?.new?.origin_city && log.changes?.new?.destination_city 
        ? `${log.changes.new.origin_city} to ${log.changes.new.destination_city}`
        : `Route ${shortId}`;
        
      switch (action) {
        case 'create':
          return {
            title: 'Route created',
            description: `${routeDesc} was created`,
            type: 'route',
            action: 'create'
          };
        case 'update':
          return {
            title: 'Route updated',
            description: `${routeDesc} was updated`,
            type: 'route',
            action: 'update'
          };
        default:
          return {
            title: 'Route activity',
            description: `${routeDesc} ${action}`,
            type: 'route',
            action: action as ActivityItem['action']
          };
      }
      
    default:
      return {
        title: 'System activity',
        description: `${entityType} ${shortId} was ${action}`,
        type: 'route', // fallback
        action: action as ActivityItem['action']
      };
  }
};

// Get color class based on activity type and action
const getActivityColor = (type: ActivityItem['type'], action: ActivityItem['action']): string => {
  switch (action) {
    case 'create':
      return 'bg-green-500';
    case 'update':
      return 'bg-blue-500';
    case 'delete':
      return 'bg-red-500';
    case 'invite':
      return 'bg-purple-500';
    case 'respond':
      return 'bg-yellow-500';
    case 'complete':
      return 'bg-emerald-500';
    default:
      return 'bg-gray-500';
  }
};

// Get icon name based on activity type
const getActivityIcon = (type: ActivityItem['type']): string => {
  switch (type) {
    case 'bid':
      return 'FileSpreadsheet';
    case 'carrier':
      return 'Truck';
    case 'route':
      return 'Map';
    case 'invitation':
      return 'Mail';
    case 'response':
      return 'MessageSquare';
    default:
      return 'Activity';
  }
};

// Transform audit logs into activity items
const transformAuditLogToActivity = (log: AuditLogEntry): ActivityItem => {
  const { title, description, type, action } = getActivityDescription(log);
  
  return {
    id: log.id,
    type,
    action,
    title,
    description,
    timestamp: log.created_at,
    entityId: log.entity_id,
    changes: log.changes,
    metadata: log.metadata,
    colorClass: getActivityColor(type, action),
    icon: getActivityIcon(type)
  };
};

// Fetch recent activities for the organization
export const getRecentActivities = async (limit = 10): Promise<ActivityItem[]> => {
  try {
    // Get current user's profile to find their organization
    const { data: profile, error: profileError } = await supabase.auth.getUser();
    
    if (profileError || !profile?.user?.id) {
      throw new Error("Unable to determine current user");
    }
    
    // Get the user's organization from their profile
    const { data: userProfile, error: userProfileError } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", profile.user.id)
      .single();
    
    if (userProfileError || !userProfile?.org_id) {
      throw new Error("Unable to determine your organization");
    }
    
    // Fetch recent audit logs for the organization
    const { data: auditLogs, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("organization_id", userProfile.org_id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent activities:", error);
      throw error;
    }

    // Transform audit logs into activity items
    return (auditLogs || []).map(transformAuditLogToActivity);
  } catch (error) {
    console.error("Error in getRecentActivities:", error);
    return [];
  }
};

// Format relative time (e.g., "2 hours ago", "1 day ago")
export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMs = now.getTime() - time.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else {
    return time.toLocaleDateString();
  }
};