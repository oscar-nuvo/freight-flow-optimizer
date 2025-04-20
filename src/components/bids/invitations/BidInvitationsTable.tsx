
import { useEffect, useState } from "react";
import { getBidCarriers } from "@/services/bidCarriersService";
import { Carrier } from "@/services/carriersService";
import { CarrierInvitation } from "@/types/invitation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { InvitationStatusBadge } from "./InvitationStatusBadge";
import { Mail, MessageSquare, Bell } from "lucide-react";

interface BidInvitationsTableProps {
  bidId: string;
}

interface CarrierInvitationWithCarrier {
  carrier: Carrier;
  invitation: CarrierInvitation;
}

export function BidInvitationsTable({ bidId }: BidInvitationsTableProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [invitations, setInvitations] = useState<CarrierInvitationWithCarrier[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!bidId) return;
      
      try {
        setIsLoading(true);
        const data = await getBidCarriers(bidId);
        setInvitations(data);
      } catch (error) {
        console.error("Error fetching bid invitations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvitations();
  }, [bidId]);

  const getFilteredInvitations = (status?: string) => {
    if (!status || status === "all") return invitations;
    return invitations.filter(item => item.invitation.status === status);
  };

  const renderChannelIcons = (channels: string[]) => {
    return (
      <div className="flex space-x-1">
        {channels.includes("email") && <Mail className="h-4 w-4" />}
        {channels.includes("sms") && <MessageSquare className="h-4 w-4" />}
        {channels.includes("whatsapp") && <Bell className="h-4 w-4" />}
      </div>
    );
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Calculate counts for tabs
  const pendingCount = invitations.filter(item => item.invitation.status === "pending").length;
  const deliveredCount = invitations.filter(item => item.invitation.status === "delivered").length;
  const respondedCount = invitations.filter(item => item.invitation.status === "responded").length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carrier Invitations</CardTitle>
          <CardDescription>Loading invitations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carrier Invitations</CardTitle>
          <CardDescription>No carriers have been invited to this bid yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 border rounded-md">
            <p className="text-muted-foreground">
              Invite carriers to participate in this bid by clicking the "Invite Carriers" button above.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carrier Invitations</CardTitle>
        <CardDescription>{invitations.length} carriers have been invited to this bid</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              All ({invitations.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Delivered ({deliveredCount})
            </TabsTrigger>
            <TabsTrigger value="responded">
              Responded ({respondedCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Channels</TableHead>
                    <TableHead>Invited</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredInvitations(activeTab).map(({ carrier, invitation }) => (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <div className="font-medium">{carrier.name}</div>
                        {carrier.contact_name && (
                          <div className="text-xs text-muted-foreground">
                            Contact: {carrier.contact_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <InvitationStatusBadge status={invitation.status} />
                      </TableCell>
                      <TableCell>
                        {renderChannelIcons(invitation.delivery_channels)}
                      </TableCell>
                      <TableCell>
                        {getTimeAgo(invitation.invited_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Remind
                          </Button>
                          <Button variant="outline" size="sm">
                            Copy Link
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
