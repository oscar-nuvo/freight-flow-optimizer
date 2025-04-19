
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Truck } from "lucide-react";
import { CarrierOnboardingForm } from "@/components/carriers/CarrierOnboardingForm";
import { useCarrierOnboarding } from "@/hooks/useCarrierOnboarding";
import { LoadingState } from "@/components/carriers/onboarding/LoadingState";
import { ErrorState } from "@/components/carriers/onboarding/ErrorState";
import { CompletedState } from "@/components/carriers/onboarding/CompletedState";
import { OnboardingProgress } from "@/components/carriers/onboarding/OnboardingProgress";
import { DebugInfo } from "@/components/carriers/onboarding/DebugInfo";
import { DocumentsStep } from "@/components/carriers/onboarding/DocumentsStep";

const CarrierOnboarding = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  // Add validation for token parameter
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <ErrorState error="Invalid invitation link. No token provided." isCompleted={false} />
      </div>
    );
  }
  
  const {
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
  } = useCarrierOnboarding(token);

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
          <OnboardingProgress 
            currentStep={currentStep} 
            isCompleted={isCompleted} 
          />
        )}

        {/* Debug information for development environment */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <DebugInfo 
            debugInfo={debugInfo}
            checkDocumentStatus={checkDocumentStatus}
          />
        )}

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} isCompleted={isCompleted} />
        ) : isCompleted ? (
          <CompletedState />
        ) : currentStep === 'documents' ? (
          <DocumentsStep 
            form={documentForm}
            onComplete={handleCompleteDocuments}
            onBack={() => setCurrentStep('profile')}
            isSubmitting={isSubmitting}
          />
        ) : (
          carrier && (
            <CarrierOnboardingForm 
              carrier={carrier} 
              onSubmit={handleSubmitProfile}
              isSubmitting={isSubmitting}
            />
          )
        )}
      </div>
    </div>
  );
};

export default CarrierOnboarding;
