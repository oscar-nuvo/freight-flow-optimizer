
import { useState, useEffect } from "react";
import { getCarrierByToken, updateCarrier } from "@/services/carriersService";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const documentFormSchema = z.object({
  bank_statement_doc: z.string().optional(),
  cargo_insurance_doc: z.string().optional(),
  primary_liability_doc: z.string().optional(),
  w9_form_doc: z.string().optional(),
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;

export function useCarrierOnboarding(token: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [carrier, setCarrier] = useState(null);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState<'profile' | 'documents'>('profile');
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

  // Function to check if carrier has documents
  const hasRequiredDocuments = (carrierData: any) => {
    console.log("Checking documents for carrier:", carrierData?.id);
    
    if (!carrierData) {
      console.log("No carrier data available");
      return false;
    }
    
    const documents = {
      bank_statement: carrierData.bank_statement_doc,
      cargo_insurance: carrierData.cargo_insurance_doc,
      primary_liability: carrierData.primary_liability_doc,
      w9_form: carrierData.w9_form_doc
    };
    
    console.log("Current document status:", documents);
    
    // Return true if ANY document is uploaded
    const hasDocuments = !!(
      documents.bank_statement || 
      documents.cargo_insurance || 
      documents.primary_liability || 
      documents.w9_form
    );
    
    console.log("Has required documents:", hasDocuments);
    return hasDocuments;
  };

  // Debug function to check document status
  const checkDocumentStatus = () => {
    if (!carrier) return "No carrier data available";
    
    return `
      Bank Statement: ${carrier.bank_statement_doc ? "✅" : "❌"}
      Cargo Insurance: ${carrier.cargo_insurance_doc ? "✅" : "❌"}
      Primary Liability: ${carrier.primary_liability_doc ? "✅" : "❌"}
      W9 Form: ${carrier.w9_form_doc ? "✅" : "❌"}
    `;
  };

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
        console.log("Carrier data loaded:", carrierData);
        
        if (!carrierData) {
          setError("Invalid or expired invitation link");
        } else if (carrierData.profile_completed_at) {
          console.log("Profile already completed at:", carrierData.profile_completed_at);
          setError("This profile has already been completed");
          setIsCompleted(true);
        } else {
          setCarrier(carrierData);
          
          // Update document form with existing values if available
          if (carrierData) {
            documentForm.reset({
              bank_statement_doc: carrierData.bank_statement_doc || "",
              cargo_insurance_doc: carrierData.cargo_insurance_doc || "",
              primary_liability_doc: carrierData.primary_liability_doc || "",
              w9_form_doc: carrierData.w9_form_doc || "",
            });
          }

          // Check if documents exist and update UI accordingly
          if (hasRequiredDocuments(carrierData)) {
            console.log("Documents found, moving to success screen");
            setDebugInfo("Documents found in database, moving to success screen");
            handleCompleteDocuments();
          } else if (carrierData.name) {
            // If basic info exists but no documents, move to documents step
            console.log("Basic info exists, moving to documents step");
            setCurrentStep('documents');
          }
        }
      } catch (err: any) {
        console.error("Error loading carrier:", err);
        setError(`Failed to load carrier profile: ${err.message || "Unknown error"}`);
        setDebugInfo(`Error details: ${JSON.stringify(err)}`);
        toast({
          title: "Error",
          description: `Failed to load carrier profile: ${err.message || "Please try again"}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCarrier();
  }, [token]);

  const handleSubmitProfile = async (formData: any) => {
    if (!carrier || !carrier.id) {
      setError("Cannot update: Carrier information is missing");
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Updating carrier profile:", formData);
      
      await updateCarrier(carrier.id, formData);
      
      // Update local carrier state with new data
      setCarrier((prev: any) => ({
        ...prev,
        ...formData
      }));
      
      // Check if documents exist
      if (hasRequiredDocuments(carrier)) {
        console.log("Documents exist, completing profile");
        setDebugInfo("Documents exist, completing profile");
        await handleCompleteDocuments();
      } else {
        // Move to documents step if no documents
        console.log("No documents found, moving to documents step");
        setDebugInfo("No documents found, moving to documents step");
        setCurrentStep('documents');
        
        toast({
          title: "Profile Information Saved",
          description: "Please proceed to upload required documents.",
        });
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setDebugInfo(`Update error: ${JSON.stringify(error)}`);
      toast({
        title: "Error",
        description: `Failed to update your profile: ${error.message || "Please try again"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteDocuments = async () => {
    if (!carrier || !carrier.id) {
      setError("Cannot complete: Carrier information is missing");
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Completing carrier profile");
      
      await updateCarrier(carrier.id, {
        profile_completed_at: new Date().toISOString()
      });
      
      setIsCompleted(true);
      toast({
        title: "Profile Completed",
        description: "Your carrier profile and documents have been successfully uploaded.",
      });
    } catch (error: any) {
      console.error("Error completing profile:", error);
      setDebugInfo(`Completion error: ${JSON.stringify(error)}`);
      toast({
        title: "Error",
        description: `Failed to complete your profile: ${error.message || "Please try again"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isLoading,
    carrier,
    error,
    debugInfo,
    isSubmitting,
    isCompleted,
    currentStep,
    documentForm,
    setCurrentStep,
    handleSubmitProfile,
    handleCompleteDocuments,
    checkDocumentStatus
  };
}
