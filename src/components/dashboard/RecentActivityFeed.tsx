import React from "react";
import { useRecentActivities } from "@/hooks/useRecentActivities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileSpreadsheet, Truck, Map, Mail, MessageSquare, Activity } from "lucide-react";
import { formatRelativeTime } from "@/services/activityFeedService";

// Icon mapping for dynamic icon rendering
const iconMap = {
  FileSpreadsheet,
  Truck,
  Map,
  Mail,
  MessageSquare,
  Activity,
};

export const RecentActivityFeed: React.FC = () => {
  const { data: activities, isLoading, isError, error } = useRecentActivities(8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest updates and changes in your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="w-2 h-2 rounded-full mt-2" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex items-center text-destructive gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Error loading recent activities: {error?.message}</span>
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity found.</p>
            <p className="text-xs">Activities will appear here as you use the system.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || Activity;
              
              return (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`w-2 h-2 rounded-full mt-2 ${activity.colorClass}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <IconComponent className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-5">{activity.title}</p>
                        <p className="text-sm text-muted-foreground leading-5 break-words">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};