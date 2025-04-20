
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getInvitationByToken, 
  updateInvitationStatus 
} from "@/services/invitationsService";
import { getRoutesByBid } from "@/services/routesService";
import { 
  submitBidResponse, 
  getExistingResponse 
} from "@/services/bidResponsesService";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import RouteRatesForm from "@/components/bids/responses/RouteRatesForm";
import ResponderInfoForm from "@/components/bids/responses/ResponderInfoForm";
import { CarrierInvitation } from "@/types/invitation";
import { Route } from "@/types/route";
import { BidResponseFormValues } from "@/types/bidResponse";
import { useToast } from "@/hooks/use-toast";

export function CarrierBidResponsePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [invitation, setInvitation] = useState<CarrierInvitation | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [existingResponse, setExistingResponse] = useState<any | null>(null);
  
  // Form state
  const [formValues, setFormValues] = useState<BidResponseFormValues>({
    responderName: "",
    responderEmail: "",
    routeRates: {}
  });

  useEffect(() => {
    const loadInvitationData = async () => {
      if (!token) {
        setError("Invalid invitation link");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch invitation details
        const invitationData = await getInvitationByToken(token);
        
        if (!invitationData) {
          setError("Invalid or expired invitation token");
          setIsLoading(false);
          return;
        }

        // Mark invitation as opened if it's in pending or delivered state
        if (invitationData.status === 'pending' || invitationData.status === 'delivered') {
          await updateInvitationStatus(invitationData.id, 'opened');
          invitationData.status = 'opened';
        }

        setInvitation(invitationData);
        
        // Check if invitation has already been responded to
        const bidId = invitationData.bid_id;
        const carrierId = invitationData.carrier_id;
        
        // Load routes for this bid
        const routesData = await getRoutesByBid(bidId);
        setRoutes(routesData);
        
        // Check for existing response
        try {
          const existingResponseData = await getExistingResponse(bidId, carrierId);
          if (existingResponseData) {
            setExistingResponse(existingResponseData);
            
            // Pre-fill form with existing data
            setFormValues({
              responderName: existingResponseData.responder_name,
              responderEmail: existingResponseData.responder_email,
              routeRates: existingResponseData.rates || {}
            });
          }
        } catch (err) {
          console.log("No existing response found, starting fresh");
        }
      } catch (err: any) {
        console.error("Error loading invitation data:", err);
        setError(err.message || "Failed to load invitation details");
      } finally {
        setIsLoading(false);
      }
    };

    loadInvitationData();
  }, [token]);

  const handleResponderInfoChange = (info: { name: string, email: string }) => {
    setFormValues(prev => ({
      ...prev,
      responderName: info.name,
      responderEmail: info.email
    }));
  };

  const handleRouteRatesChange = (routeRates: Record<string, { value: number | null, comment?: string }>) => {
    setFormValues(prev => ({
      ...prev,
      routeRates
    }));
  };

  const handleSaveDraft = async () => {
    if (!invitation) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const result = await submitBidResponse(
        invitation.bid_id,
        invitation.carrier_id,
        invitation.id,
        formValues,
        true // isDraft
      );
      
      toast({
        title: "Draft saved",
        description: "Your response has been saved as a draft"
      });
      
      setExistingResponse(result);
    } catch (err: any) {
      setError(err.message || "Failed to save draft");
      toast({
        title: "Failed to save draft",
        description: err.message || "An error occurred while saving your draft",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!invitation) return;
    
    // Validate form
    if (!formValues.responderName || !formValues.responderEmail) {
      setError("Please provide your name and email");
      toast({
        title: "Missing information",
        description: "Please provide your name and email",
        variant: "destructive"
      });
      return;
    }
    
    // Check if at least one route has a rate
    const hasRouteRates = Object.values(formValues.routeRates).some(
      rate => rate.value !== null && rate.value !== undefined
    );
    
    if (!hasRouteRates) {
      setError("Please provide at least one route rate");
      toast({
        title: "No rates provided",
        description: "Please provide a rate for at least one route",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await submitBidResponse(
        invitation.bid_id,
        invitation.carrier_id,
        invitation.id,
        formValues,
        false // not a draft
      );
      
      // Update invitation status to responded
      await updateInvitationStatus(invitation.id, 'responded');
      
      setSuccessMessage("Your bid response has been submitted successfully!");
      toast({
        title: "Success!",
        description: "Your bid response has been submitted successfully"
      });
    } catch (err: any) {
      setError(err.message || "Failed to submit response");
      toast({
        title: "Failed to submit response",
        description: err.message || "An error occurred while submitting your response",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-5xl p-6">
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading bid information...</span>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-5xl">
          <CardHeader>
            <CardTitle className="text-xl text-red-600 flex items-center">
              <AlertCircle className="mr-2 h-6 w-6" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button onClick={() => navigate("/")}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state after submission
  if (successMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-5xl">
          <CardHeader>
            <CardTitle className="text-xl text-green-600 flex items-center">
              <CheckCircle className="mr-2 h-6 w-6" />
              Bid Response Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6">{successMessage}</p>
            <p className="mb-6">Thank you for participating in this bid request. A confirmation has been sent to your email.</p>
            <Button onClick={() => navigate("/")}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render form if invitation exists
  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Carrier Bid Response Portal</CardTitle>
            {invitation?.status === 'responded' && (
              <CardDescription className="text-green-600 font-medium">
                You have already submitted a response. You can review or update your submission below.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-2">Bid Information</h3>
              <p className="text-gray-600 mb-4">
                Please review the routes below and provide your rates.
              </p>
              {invitation?.custom_message && (
                <Alert className="mb-4">
                  <AlertTitle>Message from Bid Manager</AlertTitle>
                  <AlertDescription>{invitation.custom_message}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="mb-8">
              <ResponderInfoForm 
                initialValues={{ 
                  name: formValues.responderName, 
                  email: formValues.responderEmail 
                }}
                onChange={handleResponderInfoChange}
              />
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Route Rates</h3>
              <RouteRatesForm
                routes={routes}
                initialValues={formValues.routeRates}
                onChange={handleRouteRatesChange}
                currency="USD" // Default to USD, should come from bid details
              />
            </div>
            
            <div className="flex justify-end gap-4 mt-6">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={isSaving || isSubmitting}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Draft
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSaving || isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Response
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CarrierBidResponsePage;
