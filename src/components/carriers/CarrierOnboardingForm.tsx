
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BasicInfoForm } from "./forms/BasicInfoForm";
import { ContactInfoForm } from "./forms/ContactInfoForm";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, CircleAlert, Truck, User, MapPin, Building, CreditCard } from "lucide-react";
import { Carrier } from "@/services/carriersService";
import { ComplianceForm } from "./forms/ComplianceForm";
import { FleetDetailsForm } from "./forms/FleetDetailsForm";
import { OperationalDetailsForm } from "./forms/OperationalDetailsForm";
import { BillingInfoForm } from "./forms/BillingInfoForm";

// Define validation schema for carrier form with proper type for status
const carrierFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, "Carrier name is required"),
  legal_business_name: z.string().optional(),
  status: z.enum(["pending", "active", "inactive"]),
  tax_id: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  country: z.string().optional(),

  // Contact Info
  contact_name: z.string().optional(),
  contact_email: z.string().email("Invalid email address").optional(),
  contact_phone: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),

  // All other fields from other forms made optional
  mc_number: z.string().optional(),
  usdot_number: z.string().optional(),
  scac: z.string().optional(),
  cdl_drivers_count: z.number().optional(),
  power_units_count: z.number().optional(),
  rfc_number: z.string().optional(),
});

export type CarrierFormValues = z.infer<typeof carrierFormSchema>;

interface CarrierOnboardingFormProps {
  carrier: Carrier | null;
  onSubmit: (data: CarrierFormValues) => void;
  isSubmitting: boolean;
}

export function CarrierOnboardingForm({ carrier, onSubmit, isSubmitting }: CarrierOnboardingFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formState, setFormState] = useState<{
    basic: boolean;
    contact: boolean;
    compliance: boolean;
    fleet: boolean;
    operations: boolean;
    billing: boolean;
  }>({
    basic: false,
    contact: false,
    compliance: false,
    fleet: false,
    operations: false,
    billing: false,
  });

  // Default values from carrier data
  const defaultValues: Partial<CarrierFormValues> = {
    name: carrier?.name || "",
    legal_business_name: carrier?.legal_business_name || "",
    status: (carrier?.status as "pending" | "active" | "inactive") || "pending",
    tax_id: carrier?.tax_id || "",
    website: carrier?.website || "",
    description: carrier?.description || "",
    country: carrier?.country || "",
    contact_name: carrier?.contact_name || "",
    contact_email: carrier?.contact_email || "",
    contact_phone: carrier?.contact_phone || "",
    address_line1: carrier?.address_line1 || "",
    address_line2: carrier?.address_line2 || "",
    city: carrier?.city || "",
    state: carrier?.state || "",
    zip_code: carrier?.zip_code || "",
    mc_number: carrier?.mc_number || "",
    usdot_number: carrier?.usdot_number || "",
    scac: carrier?.scac || "",
    rfc_number: carrier?.rfc_number || "",
    cdl_drivers_count: carrier?.cdl_drivers_count || undefined,
    power_units_count: carrier?.power_units_count || undefined,
  };

  // Initialize form with react-hook-form
  const form = useForm<CarrierFormValues>({
    resolver: zodResolver(carrierFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Mark section as completed
  const markSectionCompleted = (section: string) => {
    setFormState(prev => ({
      ...prev,
      [section]: true
    }));
  };

  // Handle form submission
  const handleSubmit = (values: CarrierFormValues) => {
    onSubmit(values);
  };

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-3 sm:grid-cols-6 mb-8">
                <TabsTrigger value="basic" className="flex flex-col items-center gap-1 py-2">
                  <Truck className="h-4 w-4" />
                  <span className="text-xs">Basic</span>
                  {formState.basic && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex flex-col items-center gap-1 py-2">
                  <User className="h-4 w-4" />
                  <span className="text-xs">Contact</span>
                  {formState.contact && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex flex-col items-center gap-1 py-2">
                  <CircleAlert className="h-4 w-4" />
                  <span className="text-xs">Compliance</span>
                  {formState.compliance && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
                </TabsTrigger>
                <TabsTrigger value="fleet" className="flex flex-col items-center gap-1 py-2">
                  <Truck className="h-4 w-4" />
                  <span className="text-xs">Fleet</span>
                  {formState.fleet && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
                </TabsTrigger>
                <TabsTrigger value="operations" className="flex flex-col items-center gap-1 py-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs">Operations</span>
                  {formState.operations && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex flex-col items-center gap-1 py-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs">Billing</span>
                  {formState.billing && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <BasicInfoForm form={form} />
                <div className="flex justify-between mt-6">
                  <div></div>
                  <div className="flex gap-2">
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
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => markSectionCompleted("billing")}
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
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
