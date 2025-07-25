/**
 * Enhanced logging utility for route services debugging
 */

export interface RouteAccessLog {
  timestamp: string;
  bidId: string;
  invitationToken?: string;
  userId?: string;
  action: string;
  result: 'success' | 'error' | 'unauthorized';
  routesCount?: number;
  errorMessage?: string;
  debugInfo?: any;
}

class RouteLogger {
  private logs: RouteAccessLog[] = [];

  log(entry: Omit<RouteAccessLog, 'timestamp'>) {
    const logEntry: RouteAccessLog = {
      ...entry,
      timestamp: new Date().toISOString()
    };
    
    this.logs.push(logEntry);
    console.log(`[RouteAccess] ${entry.action}:`, logEntry);
    
    // Keep only last 50 logs to prevent memory leaks
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(-50);
    }
  }

  getRecentLogs(count: number = 10): RouteAccessLog[] {
    return this.logs.slice(-count);
  }

  logCarrierAccess(bidId: string, invitationToken: string, success: boolean, routesCount?: number, error?: string) {
    this.log({
      bidId,
      invitationToken,
      action: 'carrier_route_access',
      result: success ? 'success' : 'error',
      routesCount,
      errorMessage: error,
      debugInfo: {
        hasToken: !!invitationToken,
        tokenLength: invitationToken?.length
      }
    });
  }

  logTokenValidation(bidId: string, invitationToken: string, isValid: boolean) {
    this.log({
      bidId,
      invitationToken,
      action: 'token_validation',
      result: isValid ? 'success' : 'unauthorized',
      debugInfo: {
        tokenFormat: invitationToken?.substring(0, 8) + '...'
      }
    });
  }
}

export const routeLogger = new RouteLogger();
