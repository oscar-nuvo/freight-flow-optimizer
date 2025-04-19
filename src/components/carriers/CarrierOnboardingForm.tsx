
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FormContainer } from "./onboarding/FormContainer";
import { useCarrierForm } from "@/hooks/useCarrierForm";
import { Carrier } from "@/services/carriersService";
import { CarrierFormValues } from "@/schemas/carrierFormSchema";
import { BasicInfoForm } from "./forms/BasicInfoForm";
import { ContactInfoForm } from "./forms/ContactInfoForm";
import { ComplianceForm } from "./forms/ComplianceForm";
import { FleetDetailsForm } from "./forms/FleetDetailsForm";
import { OperationalDetailsForm } from "./forms/OperationalDetailsForm";
import { BillingInfoForm } from "./forms/BillingInfoForm";
import { PreferencesForm } from "./forms/PreferencesForm";

interface CarrierOnboardingFormProps {
  carrier: Carrier | null;
  onSubmit: (data: CarrierFormValues) => void;
  isSubmitting: boolean;
}

export function CarrierOnboardingForm({ carrier, onSubmit, isSubmitting }: CarrierOnboardingFormProps) {
  const {
    form,
    activeTab,
    formState,
    handleTabChange,
    markSectionCompleted,
  } = useCarrierForm(carrier, onSubmit);

  // Make sure we have a valid form instance before rendering anything
  if (!form) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Carrier Profile Setup</CardTitle>
        <CardDescription>
          Complete the information below to set up your carrier profile.
          Required fields are marked with an asterisk (*).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Ensure that the Form component is properly set up */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormContainer
              form={form}
              activeTab={activeTab}
              formState={formState}
              onTabChange={handleTabChange}
              onSectionComplete={markSectionCompleted}
              isSubmitting={isSubmitting}
            >
              <TabsContent value="basic" className="space-y-4">
                <BasicInfoForm form={form} />
                <div className="flex justify-between mt-6">
                  <div></div>
                  <Button 
                    type="button" 
                    onClick={() => {
                      markSectionCompleted("basic");
                      handleTabChange("contact");
                    }}
                  >
                    Next: Contact Info
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <ContactInfoForm form={form} />
                <div className="flex justify-between mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleTabChange("basic")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      markSectionCompleted("contact");
                      handleTabChange("compliance");
                    }}
                  >
                    Next: Compliance
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4">
                <ComplianceForm form={form} />
                <div className="flex justify-between mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleTabChange("contact")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      markSectionCompleted("compliance");
                      handleTabChange("fleet");
                    }}
                  >
                    Next: Fleet Details
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="fleet" className="space-y-4">
                <FleetDetailsForm form={form} />
                <div className="flex justify-between mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleTabChange("compliance")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      markSectionCompleted("fleet");
                      handleTabChange("operations");
                    }}
                  >
                    Next: Operations
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="operations" className="space-y-4">
                <OperationalDetailsForm form={form} />
                <div className="flex justify-between mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleTabChange("fleet")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      markSectionCompleted("operations");
                      handleTabChange("billing");
                    }}
                  >
                    Next: Billing
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="space-y-4">
                <BillingInfoForm form={form} />
                <div className="flex justify-between mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleTabChange("operations")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      markSectionCompleted("billing");
                      handleTabChange("preferences");
                    }}
                  >
                    Next: Preferences
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4">
                <PreferencesForm form={form} />
                <div className="flex justify-between mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleTabChange("billing")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => markSectionCompleted("preferences")}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span> 
                        Submitting...
                      </>
                    ) : (
                      "Complete Profile"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </FormContainer>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
