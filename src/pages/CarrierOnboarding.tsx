
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCarrierByToken, updateCarrier } from "@/services/carriersService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Truck, AlertCircle, Check } from "lucide-react";
import { CarrierOnboardingForm } from "@/components/carriers/CarrierOnboardingForm";

const CarrierOnboarding = () => {
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [carrier, setCarrier] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch carrier data based on token
  useEffect(() => {
    const loadCarrier = async () => {
      if (!token) {
        setError("Invalid invitation link");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const carrierData = await getCarrierByToken(token);
        
        if (!carrierData) {
          setError("Invalid or expired invitation link");
        } else if (carrierData.profile_completed_at) {
          setError("This profile has already been completed");
          setIsCompleted(true);
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

  // Handle form submission
  const handleSubmitProfile = async (formData) => {
    if (!carrier || !carrier.id) return;
    
    try {
      setIsSubmitting(true);
      
      // Update carrier with form data and mark profile as completed
      const updatedData = {
        ...formData,
        profile_completed_at: new Date().toISOString(),
      };
      
      await updateCarrier(carrier.id, updatedData);
      
      setIsCompleted(true);
      toast({
        title: "Profile Completed",
        description: "Your carrier profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
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

        {/* Content */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {isCompleted ? "Profile Already Completed" : "Error"}
                </h3>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={() => navigate("/")}>Return to Home</Button>
              </div>
            </CardContent>
          </Card>
        ) : isCompleted ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Profile Completed</h3>
                <p className="text-muted-foreground mb-6">
                  Thank you for completing your carrier profile. You can now close this page.
                </p>
                <Button onClick={() => navigate("/")}>Return to Home</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <CarrierOnboardingForm 
            carrier={carrier} 
            onSubmit={handleSubmitProfile}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default CarrierOnboarding;
