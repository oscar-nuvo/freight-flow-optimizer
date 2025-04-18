import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCarrierByToken, updateCarrier } from "@/services/carriersService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Truck, AlertCircle, Check, Upload, FileText } from "lucide-react";
import { CarrierOnboardingForm } from "@/components/carriers/CarrierOnboardingForm";
import { DocumentsForm } from "@/components/carriers/forms/DocumentsForm";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Progress } from "@/components/ui/progress";

const documentFormSchema = z.object({
  bank_statement_doc: z.string().optional(),
  cargo_insurance_doc: z.string().optional(),
  primary_liability_doc: z.string().optional(),
  w9_form_doc: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

const CarrierOnboarding = () => {
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [carrier, setCarrier] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState<'profile' | 'documents'>('profile');
  const navigate = useNavigate();
  const { toast } = useToast();

  const documentForm = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      bank_statement_doc: "",
      cargo_insurance_doc: "",
      primary_liability_doc: "",
      w9_form_doc: "",
    }
  });

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

  const handleSubmitProfile = async (formData) => {
    if (!carrier || !carrier.id) return;
    
    try {
      setIsSubmitting(true);
      
      await updateCarrier(carrier.id, formData);
      
      setCarrier(prev => ({
        ...prev,
        ...formData
      }));
      
      setCurrentStep('documents');
      
      toast({
        title: "Profile Information Saved",
        description: "Please proceed to upload required documents.",
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

  const handleCompleteDocuments = async () => {
    if (!carrier || !carrier.id) return;
    
    try {
      setIsSubmitting(true);
      
      await updateCarrier(carrier.id, {
        profile_completed_at: new Date().toISOString()
      });
      
      setIsCompleted(true);
      toast({
        title: "Profile Completed",
        description: "Your carrier profile and documents have been successfully uploaded.",
      });
    } catch (error) {
      console.error("Error completing profile:", error);
      toast({
        title: "Error",
        description: "Failed to complete your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgress = () => {
    if (isCompleted) return 100;
    return currentStep === 'profile' ? 50 : 75;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Truck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Carrier Profile Setup</h1>
          <p className="text-muted-foreground mt-2">
            {currentStep === 'profile' 
              ? "Complete your profile information to join our carrier network"
              : "Upload required documents to complete your profile"
            }
          </p>
        </div>

        {!error && !isCompleted && (
          <div className="mb-8">
            <Progress value={getProgress()} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Profile Information</span>
              <span>Document Upload</span>
              <span>Complete</span>
            </div>
          </div>
        )}

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
        ) : currentStep === 'documents' ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <DocumentsForm form={documentForm} />
                
                <div className="flex justify-between mt-8 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setCurrentStep('profile')}
                  >
                    Back to Profile Form
                  </Button>
                  <Button 
                    onClick={handleCompleteDocuments}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span> 
                        Completing...
                      </>
                    ) : (
                      "Complete Profile"
                    )}
                  </Button>
                </div>
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
