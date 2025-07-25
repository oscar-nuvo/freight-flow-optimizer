import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuickTasks } from "@/hooks/useQuickTasks";
import { getTaskPriorityColor } from "@/services/quickTasksService";
import { Link } from "react-router-dom";
import { 
  FileSpreadsheet, 
  Truck, 
  Map, 
  Shield, 
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'FileSpreadsheet': return FileSpreadsheet;
    case 'Truck': return Truck;
    case 'Map': return Map;
    case 'Shield': return Shield;
    default: return AlertCircle;
  }
};

const getPriorityBg = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 border-red-200';
    case 'high': return 'bg-yellow-100 border-yellow-200';
    case 'medium': return 'bg-blue-100 border-blue-200';
    case 'low': return 'bg-green-100 border-green-200';
    default: return 'bg-gray-100 border-gray-200';
  }
};

const getPriorityIconBg = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-100';
    case 'high': return 'bg-yellow-100';
    case 'medium': return 'bg-blue-100';
    case 'low': return 'bg-green-100';
    default: return 'bg-gray-100';
  }
};

const getPriorityIconColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'text-red-600';
    case 'high': return 'text-yellow-600';
    case 'medium': return 'text-blue-600';
    case 'low': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

export const QuickTasksCard = () => {
  const { data: tasks, isLoading, error } = useQuickTasks();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Tasks</CardTitle>
          <CardDescription>
            Actions that need attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 border rounded-md">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Tasks</CardTitle>
          <CardDescription>
            Actions that need attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Unable to load tasks</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayTasks = tasks?.slice(0, 4) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Quick Tasks
          {tasks && tasks.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Actions that need attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!tasks || tasks.length === 0 ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <Shield className="h-5 w-5 text-green-500" />
            <span className="text-sm">All caught up! No pending tasks.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {displayTasks.map((task) => {
              const IconComponent = getIcon(task.icon);
              const TaskContent = (
                <div className={`p-4 border rounded-md transition-all hover:shadow-sm ${getPriorityBg(task.priority)}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-md ${getPriorityIconBg(task.priority)}`}>
                      <IconComponent className={`h-5 w-5 ${getPriorityIconColor(task.priority)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm leading-tight">{task.title}</p>
                        {task.actionPath && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      
                      {task.progress !== undefined && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                task.priority === 'critical' ? 'bg-red-500' :
                                task.priority === 'high' ? 'bg-yellow-500' :
                                task.priority === 'medium' ? 'bg-blue-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground text-right mt-1">
                            {Math.round(task.progress)}% complete
                          </p>
                        </div>
                      )}
                      
                      {task.dueDate && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );

              return task.actionPath ? (
                <Link 
                  key={task.id} 
                  to={task.actionPath}
                  className="block hover:no-underline"
                >
                  {TaskContent}
                </Link>
              ) : (
                <div key={task.id}>
                  {TaskContent}
                </div>
              );
            })}
            
            {tasks.length > 4 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-center text-muted-foreground">
                  +{tasks.length - 4} more task{tasks.length - 4 !== 1 ? 's' : ''} available
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};