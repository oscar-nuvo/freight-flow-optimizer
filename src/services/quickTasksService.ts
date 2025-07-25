import { supabase } from "@/integrations/supabase/client";

const getUserOrgId = async (): Promise<string | null> => {
  try {
    const { data: profile, error: profileError } = await supabase.auth.getUser();
    
    if (profileError || !profile?.user?.id) {
      throw new Error("Unable to determine current user");
    }
    
    const { data: userProfile, error: userProfileError } = await supabase
      .from("profiles")
      .select("org_id")
      .eq("id", profile.user.id)
      .single();
    
    if (userProfileError || !userProfile?.org_id) {
      throw new Error("Unable to determine your organization");
    }
    
    return userProfile.org_id;
  } catch (error) {
    console.error("Error getting user org ID:", error);
    return null;
  }
};

export interface QuickTask {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'bid' | 'carrier' | 'route' | 'compliance';
  icon: string;
  actionPath?: string;
  progress?: number;
  dueDate?: string;
  entityId?: string;
  entityName?: string;
  count?: number;
}

const getTaskPriorityColor = (priority: QuickTask['priority']) => {
  switch (priority) {
    case 'critical': return 'red';
    case 'high': return 'yellow';
    case 'medium': return 'blue';
    case 'low': return 'green';
    default: return 'gray';
  }
};

const getTaskIcon = (category: QuickTask['category']) => {
  switch (category) {
    case 'bid': return 'FileSpreadsheet';
    case 'carrier': return 'Truck';
    case 'route': return 'Map';
    case 'compliance': return 'Shield';
    default: return 'AlertCircle';
  }
};

export const generateBidTasks = async (orgId: string): Promise<QuickTask[]> => {
  const tasks: QuickTask[] = [];

  try {
    // Get incomplete bids (draft status)
    const { data: draftBids } = await supabase
      .from('bids')
      .select('id, name, status, submission_date')
      .eq('org_id', orgId)
      .eq('status', 'draft');

    if (draftBids && draftBids.length > 0) {
      for (const bid of draftBids) {
        tasks.push({
          id: `bid-draft-${bid.id}`,
          title: `Complete "${bid.name}" bid`,
          description: 'This bid is still in draft status and needs to be published',
          priority: 'medium',
          category: 'bid',
          icon: getTaskIcon('bid'),
          actionPath: `/bids/${bid.id}/edit`,
          entityId: bid.id,
          entityName: bid.name
        });
      }
    }

    // Get bids with low response rates
    const { data: activeBids } = await supabase
      .from('bids')
      .select(`
        id, 
        name, 
        status,
        submission_date,
        bid_carrier_invitations(count),
        carrier_bid_responses(count)
      `)
      .eq('org_id', orgId)
      .eq('status', 'active');

    if (activeBids) {
      for (const bid of activeBids) {
        const invitations = bid.bid_carrier_invitations?.length || 0;
        const responses = bid.carrier_bid_responses?.length || 0;
        const responseRate = invitations > 0 ? (responses / invitations) * 100 : 0;

        if (invitations > 0 && responseRate < 50) {
          const missingResponses = invitations - responses;
          tasks.push({
            id: `bid-low-response-${bid.id}`,
            title: `Follow up on "${bid.name}" responses`,
            description: `${missingResponses} of ${invitations} invited carriers haven't responded yet`,
            priority: responseRate < 25 ? 'high' : 'medium',
            category: 'bid',
            icon: getTaskIcon('bid'),
            actionPath: `/bids/${bid.id}`,
            progress: responseRate,
            entityId: bid.id,
            entityName: bid.name
          });
        }
      }
    }

    // Check for approaching deadlines
    const { data: deadlineBids } = await supabase
      .from('bids')
      .select('id, name, submission_date')
      .eq('org_id', orgId)
      .in('status', ['active', 'published'])
      .not('submission_date', 'is', null);

    if (deadlineBids) {
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      for (const bid of deadlineBids) {
        const submissionDate = new Date(bid.submission_date);
        if (submissionDate <= threeDaysFromNow && submissionDate > now) {
          const daysLeft = Math.ceil((submissionDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
          tasks.push({
            id: `bid-deadline-${bid.id}`,
            title: `"${bid.name}" deadline approaching`,
            description: `Submission deadline is in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
            priority: daysLeft <= 1 ? 'critical' : 'high',
            category: 'bid',
            icon: getTaskIcon('bid'),
            actionPath: `/bids/${bid.id}`,
            dueDate: bid.submission_date,
            entityId: bid.id,
            entityName: bid.name
          });
        }
      }
    }

  } catch (error) {
    console.error('Error generating bid tasks:', error);
  }

  return tasks;
};

export const generateCarrierTasks = async (orgId: string): Promise<QuickTask[]> => {
  const tasks: QuickTask[] = [];

  try {
    // Check for pending invitations
    const { data: pendingInvitations } = await supabase
      .from('bid_carrier_invitations')
      .select(`
        id,
        bid_id,
        status,
        invited_at,
        bids!bid_carrier_invitations_bid_id_fkey(id, name),
        carriers!bid_carrier_invitations_carrier_id_fkey(name)
      `)
      .eq('organization_id', orgId)
      .eq('status', 'pending');

    if (pendingInvitations && pendingInvitations.length > 0) {
      // Group by bid
      const bidGroups = pendingInvitations.reduce((acc, inv) => {
        const bidName = inv.bids?.name || 'Unknown Bid';
        if (!acc[bidName]) acc[bidName] = [];
        acc[bidName].push(inv);
        return acc;
      }, {} as Record<string, any[]>);

      for (const [bidName, invitations] of Object.entries(bidGroups)) {
        const bidId = invitations[0]?.bid_id;
        tasks.push({
          id: `invitations-pending-${bidName}`,
          title: `Follow up on "${bidName}" invitations`,
          description: `${invitations.length} invited carrier${invitations.length !== 1 ? 's' : ''} haven't opened their invitation${invitations.length !== 1 ? 's' : ''} yet`,
          priority: 'medium',
          category: 'carrier',
          icon: getTaskIcon('carrier'),
          actionPath: `/bids/${bidId}`,
          count: invitations.length
        });
      }
    }

    // Check for incomplete carrier profiles
    const { data: incompleteCarriers } = await supabase
      .from('carriers')
      .select('id, name, contact_email, contact_phone, mc_number, usdot_number')
      .eq('org_id', orgId)
      .eq('status', 'pending');

    if (incompleteCarriers) {
      const reallyIncomplete = incompleteCarriers.filter(carrier => 
        !carrier.contact_email || !carrier.contact_phone || !carrier.mc_number
      );

      if (reallyIncomplete.length > 0) {
        tasks.push({
          id: 'carriers-incomplete-profiles',
          title: 'Complete carrier profiles',
          description: `${reallyIncomplete.length} carrier${reallyIncomplete.length !== 1 ? 's' : ''} need${reallyIncomplete.length === 1 ? 's' : ''} contact information or MC number`,
          priority: 'medium',
          category: 'carrier',
          icon: getTaskIcon('carrier'),
          actionPath: '/carriers',
          count: reallyIncomplete.length
        });
      }
    }

    // Check for carriers with missing documentation
    const { data: carriersWithMissingDocs } = await supabase
      .from('carriers')
      .select('id, name, cargo_insurance_doc, primary_liability_doc, w9_form_doc')
      .eq('org_id', orgId)
      .eq('status', 'active');

    if (carriersWithMissingDocs) {
      const missingDocs = carriersWithMissingDocs.filter(carrier =>
        !carrier.cargo_insurance_doc || !carrier.primary_liability_doc || !carrier.w9_form_doc
      );

      if (missingDocs.length > 0) {
        tasks.push({
          id: 'carriers-missing-docs',
          title: 'Verify carrier documentation',
          description: `${missingDocs.length} active carrier${missingDocs.length !== 1 ? 's' : ''} ${missingDocs.length === 1 ? 'is' : 'are'} missing required documents`,
          priority: 'high',
          category: 'compliance',
          icon: getTaskIcon('compliance'),
          actionPath: '/carriers',
          count: missingDocs.length
        });
      }
    }

  } catch (error) {
    console.error('Error generating carrier tasks:', error);
  }

  return tasks;
};

export const generateRouteTasks = async (orgId: string): Promise<QuickTask[]> => {
  const tasks: QuickTask[] = [];

  try {
    // Check for recent routes without bids
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentRoutes } = await supabase
      .from('routes')
      .select(`
        id,
        origin_city,
        destination_city,
        created_at,
        route_bids(count)
      `)
      .eq('organization_id', orgId)
      .eq('is_deleted', false)
      .gte('created_at', oneWeekAgo);

    if (recentRoutes) {
      const routesWithoutBids = recentRoutes.filter(route => 
        !route.route_bids || route.route_bids.length === 0
      );

      if (routesWithoutBids.length > 0) {
        tasks.push({
          id: 'routes-without-bids',
          title: 'Review new routes',
          description: `${routesWithoutBids.length} route${routesWithoutBids.length !== 1 ? 's' : ''} added this week ${routesWithoutBids.length === 1 ? 'isn\'t' : 'aren\'t'} included in any bids yet`,
          priority: 'low',
          category: 'route',
          icon: getTaskIcon('route'),
          actionPath: '/routes',
          count: routesWithoutBids.length
        });
      }
    }

  } catch (error) {
    console.error('Error generating route tasks:', error);
  }

  return tasks;
};

export const getQuickTasks = async (): Promise<QuickTask[]> => {
  try {
    const orgId = await getUserOrgId();
    if (!orgId) {
      throw new Error('User not associated with an organization');
    }

    const [bidTasks, carrierTasks, routeTasks] = await Promise.all([
      generateBidTasks(orgId),
      generateCarrierTasks(orgId),
      generateRouteTasks(orgId)
    ]);

    const allTasks = [...bidTasks, ...carrierTasks, ...routeTasks];

    // Sort by priority (critical first, then high, medium, low)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return allTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  } catch (error) {
    console.error('Error fetching quick tasks:', error);
    return [];
  }
};

export { getTaskPriorityColor };