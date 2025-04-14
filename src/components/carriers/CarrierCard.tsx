
import { useState } from "react";
import { Carrier, sendCarrierInvite } from "@/services/carriersService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, ExternalLink, Clock } from "lucide-react";

const inviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

interface CarrierCardProps {
  carrier: Carrier;
}

export function CarrierCard({ carrier }: CarrierCardProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleInvite = async (values: z.infer<typeof inviteFormSchema>) => {
    setIsSubmitting(true);
    try {
      await sendCarrierInvite(carrier.id, values.email);
      toast({
        title: "Invite sent",
        description: `An invite has been sent to ${values.email}.`,
      });
      form.reset();
      setInviteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to send invite",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const renderIdentifier = () => {
    if (carrier.mc_number) return `MC: ${carrier.mc_number}`;
    if (carrier.usdot_number) return `USDOT: ${carrier.usdot_number}`;
    if (carrier.rfc_number) return `RFC: ${carrier.rfc_number}`;
    return "No identifier";
  };

  const getStatusBadge = () => {
    switch (carrier.status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{carrier.status}</Badge>;
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardContent className="flex-grow pt-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium text-lg">{carrier.name}</h3>
              <p className="text-sm text-muted-foreground">{renderIdentifier()}</p>
            </div>
            <div>{getStatusBadge()}</div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Created: {formatDate(carrier.created_at)}</span>
            </div>
            
            {carrier.invite_sent_at && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>Invited: {formatDate(carrier.invite_sent_at)}</span>
              </div>
            )}
            
            {carrier.profile_completed_at && (
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span>Profile Completed: {formatDate(carrier.profile_completed_at)}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="border-t bg-muted/50 pt-4 pb-4">
          {!carrier.invite_sent_at ? (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setInviteDialogOpen(true)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          ) : !carrier.profile_completed_at ? (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setInviteDialogOpen(true)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Resend Invite
            </Button>
          ) : (
            <Button variant="outline" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Invite to {carrier.name}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleInvite)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="carrier@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button variant="outline" type="button" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Invite"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
