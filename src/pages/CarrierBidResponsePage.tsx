
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle, Calendar, Truck, FileText, Info } from "lucide-react";
import RouteRatesForm from "@/components/bids/responses/RouteRatesForm";
import ResponderInfoForm from "@/components/bids/responses/ResponderInfoForm";
import { CarrierInvitation } from "@/types/invitation";
import { Route } from "@/types/route";
import { BidResponseFormValues } from "@/types/bidResponse";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export default function CarrierBidResponsePage() {
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
  const [bidDetails, setBidDetails] = useState<any | null>(null);
  
  const [formValues, setFormValues] = useState<BidResponseFormValues>({
    responderName: "",
    responderEmail: "",
    routeRates: {}
  });

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        if (!token) {
          setError("Invalid invitation link");
          setIsLoading(false);
          return;
        }

        // Step 1: Get invitation details
        const invitationData = await getInvitationByToken(token);

        if (!invitationData) {
          setError("Invalid or expired invitation token");
          setIsLoading(false);
          return;
        }

        console.log("Loaded invitation:", invitationData);
        setInvitation(invitationData);

        const bidId = invitationData.bid_id;
        const carrierId = invitationData.carrier_id;

        // Step 2: Get bid details
        try {
          const { data: bidData, error: bidError } = await supabase
            .from("bids")
            .select("*")
            .eq("id", bidId)
            .maybeSingle();

          if (bidError) {
            console.error("Error fetching bid details:", bidError);
            setError(`Failed to retrieve bid information: ${bidError.message}`);
            setIsLoading(false);
            return;
          }
          
          if (!bidData) {
            setError("Bid not found");
            setIsLoading(false);
            return;
          }

          // Step 3: Update invitation status if needed
          if (invitationData.status === 'pending' || invitationData.status === 'delivered') {
            try {
              await updateInvitationStatus(invitationData.id, 'opened');
              setInvitation(prev => prev ? { ...prev, status: 'opened' } : prev);
            } catch (statusError) {
              console.error("Error updating invitation status:", statusError);
              // Don't fail the whole flow if this step fails
            }
          }

          setBidDetails(bidData);

          // Step 4: Get routes for this bid
          try {
            const routesData = await getRoutesByBid(bidId);
            
            if (!routesData) {
              setError("Failed to load routes for this bid.");
              setRoutes([]);
              setIsLoading(false);
              return;
            }

            if (!Array.isArray(routesData) || routesData.length === 0) {
              setRoutes([]);
              // Show warning but don't set error, as this is handled in the UI
            } else {
              setRoutes(routesData);
            }

            // Step 5: Get existing response if any
            try {
              const existingResponseData = await getExistingResponse(bidId, carrierId, invitationData.id);
              if (existingResponseData) {
                setExistingResponse(existingResponseData);
                setFormValues({
                  responderName: existingResponseData.responder_name,
                  responderEmail: existingResponseData.responder_email,
                  routeRates: existingResponseData.rates || {}
                });
              }
            } catch (responseError) {
              console.log("No existing response found, starting fresh");
              // This is not an error condition, just means no previous response
            }

          } catch (routesError: any) {
            console.error("Error fetching routes:", routesError);
            setError(`Failed to load routes: ${routesError.message}`);
            setRoutes([]);
          }

        } catch (error: any) {
          console.error("Error in bid details fetch:", error);
          setError(`Failed to load bid details: ${error.message}`);
        }

      } catch (error: any) {
        console.error("Error in invitation fetch:", error);
        setError(`Failed to load invitation: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchInvitationDetails();
    }
  }, [token, navigate]);

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
        true
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
    
    if (!formValues.responderName || !formValues.responderEmail) {
      setError("Please provide your name and email");
      toast({
        title: "Missing information",
        description: "Please provide your name and email",
        variant: "destructive"
      });
      return;
    }
    
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
      const response = await submitBidResponse(
        invitation.bid_id,
        invitation.carrier_id,
        invitation.id,
        formValues,
        false
      );
      
      try {
        await updateInvitationStatus(invitation.id, 'responded');
        setInvitation(prev => prev ? { ...prev, status: 'responded' } : null);
      } catch (statusError: any) {
        console.warn("Could not update invitation status, but the response was saved:", statusError.message);
      }
      
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-5xl p-6">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-gray-600">Loading bid information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  if (!isLoading && routes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-5xl">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-600 flex items-center">
              <AlertCircle className="mr-2 h-6 w-6" />
              No Routes Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6">There are currently no routes available for this bid.</p>
            <Button onClick={() => navigate("/")}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <h3 className="text-lg font-medium mb-4">Bid Information</h3>
              
              {bidDetails && (
                <Card className="border-2 mb-6">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start space-x-2">
                        <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Bid Name</p>
                          <p>{bidDetails.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Info className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <p className="capitalize">{bidDetails.status}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Start Date</p>
                          <p>{formatDate(bidDetails.start_date)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">End Date</p>
                          <p>{formatDate(bidDetails.end_date)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Truck className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Mode</p>
                          <p className="capitalize">{bidDetails.mode?.replace(/_/g, ' ') || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Rate Duration</p>
                          <p className="capitalize">{bidDetails.rate_duration || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {bidDetails.instructions && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">Instructions</p>
                        <p className="text-sm whitespace-pre-line border p-3 rounded-md bg-gray-50">{bidDetails.instructions}</p>
                      </div>
                    )}
                    
                    {bidDetails.contract_file && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">Contract</p>
                        <a 
                          href={bidDetails.contract_file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          View Contract
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
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
                currency={bidDetails?.currency || "USD"}
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
