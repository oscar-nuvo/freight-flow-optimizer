
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Carrier } from "@/services/carriersService";
import { createBidInvitations } from "@/services/invitationsService";
import { Mail, MessageSquare, Bell } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CarrierSelectionList } from "./CarrierSelectionList";
import { DeliveryChannel } from "@/types/invitation";

interface BidInvitationModalProps {
  bidId: string;
  bidName: string;
  open: boolean;
  onClose: () => void;
  onInvitationsSent: () => void;
}

export function BidInvitationModal({ 
  bidId, 
  bidName, 
  open, 
  onClose, 
  onInvitationsSent 
}: BidInvitationModalProps) {
  const [selectedCarriers, setSelectedCarriers] = useState<Carrier[]>([]);
  const [customMessage, setCustomMessage] = useState("");
  const [deliveryChannels, setDeliveryChannels] = useState<DeliveryChannel[]>(["email"]);
  const [activeTab, setActiveTab] = useState("carriers");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSelectedCarriers([]);
      setCustomMessage("");
      setDeliveryChannels(["email"]);
      setActiveTab("carriers");
    }
  }, [open]);

  const toggleDeliveryChannel = (channel: DeliveryChannel) => {
    if (deliveryChannels.includes(channel)) {
      setDeliveryChannels(deliveryChannels.filter((c) => c !== channel));
    } else {
      setDeliveryChannels([...deliveryChannels, channel]);
    }
  };

  const handleNext = () => {
    if (selectedCarriers.length === 0) {
      toast({
        title: "No carriers selected",
        description: "Please select at least one carrier to invite.",
        variant: "destructive",
      });
      return;
    }
    setActiveTab("message");
  };

  const handlePrevious = () => {
    setActiveTab("carriers");
  };

  const handleSendInvitations = async () => {
    if (selectedCarriers.length === 0) {
      toast({
        title: "No carriers selected",
        description: "Please select at least one carrier to invite.",
        variant: "destructive",
      });
      return;
    }

    if (deliveryChannels.length === 0) {
      toast({
        title: "No delivery channels selected",
        description: "Please select at least one delivery channel.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createBidInvitations(bidId, {
        carrier_ids: selectedCarriers.map(carrier => carrier.id),
        custom_message: customMessage,
        delivery_channels: deliveryChannels
      });
      
      toast({
        title: "Invitations sent successfully",
        description: `${selectedCarriers.length} carriers have been invited to the bid.`,
      });
      
      onInvitationsSent();
      onClose();
    } catch (error: any) {
      console.error("Error sending invitations:", error);
      toast({
        title: "Error sending invitations",
        description: error.message || "Failed to send invitations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Invite Carriers to Bid</DialogTitle>
          <DialogDescription>
            Invite carriers to participate in "{bidName}". Only active carriers can be invited.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="carriers">Select Carriers</TabsTrigger>
            <TabsTrigger value="message" disabled={selectedCarriers.length === 0}>
              Message & Channels
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="carriers" className="mt-4">
            <CarrierSelectionList 
              selectedCarriers={selectedCarriers}
              onChange={setSelectedCarriers}
            />
            
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleNext} disabled={selectedCarriers.length === 0}>
                Next
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="message" className="mt-4 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Custom Message (Optional)</h3>
              <Textarea
                placeholder="Enter a custom message to include with the invitation..."
                className="min-h-[100px]"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Delivery Channels</h3>
              <p className="text-sm text-muted-foreground">
                Select one or more channels to deliver the invitation.
              </p>
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="channel-email" 
                    checked={deliveryChannels.includes("email")}
                    onCheckedChange={() => toggleDeliveryChannel("email")}
                  />
                  <Label htmlFor="channel-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="channel-sms" 
                    checked={deliveryChannels.includes("sms")}
                    onCheckedChange={() => toggleDeliveryChannel("sms")}
                  />
                  <Label htmlFor="channel-sms" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="channel-whatsapp" 
                    checked={deliveryChannels.includes("whatsapp")}
                    onCheckedChange={() => toggleDeliveryChannel("whatsapp")}
                  />
                  <Label htmlFor="channel-whatsapp" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    WhatsApp
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-md bg-muted/50">
              <h4 className="text-sm font-medium mb-2">Invitation Summary</h4>
              <p className="text-sm">
                You are about to invite <strong>{selectedCarriers.length}</strong> carriers to participate in this bid.
              </p>
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={handlePrevious}>
                Back
              </Button>
              <Button 
                onClick={handleSendInvitations} 
                disabled={isSubmitting || deliveryChannels.length === 0}
              >
                {isSubmitting ? "Sending..." : "Send Invitations"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
