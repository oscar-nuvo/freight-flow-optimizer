
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCarrierByToken, updateCarrier } from "@/services/carriersService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CarrierOnboardingForm } from "@/components/carriers/CarrierOnboardingForm";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Truck, AlertCircle, Check, Loader2 } from "lucide-react";
import { type Carrier } from "@/services/carriersService";

const CarrierOnboarding = () => {
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const loadCarrier = async () => {
      if (!token) {
        setError("Invalid invitation link");
        setIsLoading(false);
        return;
      }
      
      try {
        const carrierData = await getCarrierByToken(token);
        
        if (!carrierData) {
          setError("Invalid or expired invitation link");
        } else if (carrierData.profile_completed_at) {
          setError("This profile has already been completed");
        } else {
          setCarrier(carrierData);
        }
      } catch (err) {
        console.error("Error loading carrier:", err);
        setError("Failed to load carrier profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadCarrier();
  }, [token]);

  const handleSubmitProfile = async (formData: Partial<Carrier>) => {
    if (!carrier?.id) return;
    
    try {
      setIsSubmitting(true);
      setSubmitStatus({ type: null, message: "" });
      
      await updateCarrier(carrier.id, {
        ...formData,
        profile_completed_at: new Date().toISOString()
      });
      
      setSubmitStatus({
        type: "success",
        message: "Your carrier profile has been successfully completed!"
      });

      // Delay navigation to show success message
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSubmitStatus({
        type: "error",
        message: "Failed to update your profile. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-5xl">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-5xl">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Error</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate("/")}>Return to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Truck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Carrier Profile Setup</h1>
          <p className="text-muted-foreground mt-2">
            Complete your profile information to join our carrier network
          </p>
        </div>

        {/* Status Alert */}
        {submitStatus.type && (
          <Alert variant={submitStatus.type === "success" ? "success" : "destructive"}>
            {submitStatus.type === "success" ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {submitStatus.type === "success" ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription>{submitStatus.message}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <CarrierOnboardingForm 
          carrier={carrier}
          onSubmit={handleSubmitProfile}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default CarrierOnboarding;
