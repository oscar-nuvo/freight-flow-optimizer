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
import { CheckCircle, Building, User, FileCheck, Truck, MapPin, CreditCard, Settings2 } from "lucide-react";
import { type Carrier } from "@/services/carriersService";
import { ComplianceForm } from "./forms/ComplianceForm";
import { FleetDetailsForm } from "./forms/FleetDetailsForm";
import { OperationalDetailsForm } from "./forms/OperationalDetailsForm";
import { BillingInfoForm } from "./forms/BillingInfoForm";
import { PreferencesForm } from "./forms/PreferencesForm";
import { ContactInfoFormExternal } from "./forms/ContactInfoFormExternal";

const carrierFormSchema = z.object({
  name: z.string().min(1, "Carrier name is required"),
  legal_business_name: z.string().optional(),
  status: z.enum(["pending", "active", "inactive"]),
  tax_id: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  country: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email("Invalid email address").optional(),
  contact_phone: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  additional_contacts: z.array(z.any()).optional(),
  registration_type: z.string().optional(),
  mc_number: z.string().optional(),
  usdot_number: z.string().optional(),
  scac: z.string().optional(),
  is_ctpat_certified: z.boolean().optional(),
  ctpat_svi_number: z.string().optional(),
  fmcsa_authority_active: z.boolean().optional(),
  authority_types: z.array(z.string()).optional(),
  handles_inbond_ca_shipments: z.boolean().optional(),
  rfc_number: z.string().optional(),
  cdl_drivers_count: z.number().optional(),
  b1_drivers_count: z.number().optional(),
  offers_team_driver_services: z.boolean().optional(),
  power_units_count: z.number().optional(),
  dry_van_trailers_count: z.number().optional(),
  reefer_trailers_count: z.number().optional(),
  flatbed_trailers_count: z.number().optional(),
  authorized_for_hazmat: z.boolean().optional(),
  countries_of_operation: z.array(z.string()).optional(),
  service_types: z.array(z.string()).optional(),
  provides_cross_border_services: z.boolean().optional(),
  cross_border_routes: z.array(z.string()).optional(),
  engages_in_trailer_exchanges: z.boolean().optional(),
  trailer_exchange_partners: z.string().optional(),
  bank_name: z.string().optional(),
  account_name: z.string().optional(),
  account_number: z.string().optional(),
  routing_number: z.string().optional(),
  swift_code: z.string().optional(),
  payments_via_intermediary: z.boolean().optional(),
  billing_email: z.string().email("Invalid email address").optional().or(z.literal('')),
  currency: z.string().optional(),
  payout_method: z.string().optional(),
  tracking_method: z.string().optional(),
  telematics_provider: z.string().optional(),
  yard_locations: z.array(z.any()).optional(),
  primary_lanes: z.array(z.any()).optional(),
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
    preferences: boolean;
  }>({
    basic: false,
    contact: false,
    compliance: false,
    fleet: false,
    operations: false,
    billing: false,
    preferences: false,
  });

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
    additional_contacts: carrier?.additional_contacts || [],
    
    registration_type: carrier?.registration_type || "",
    mc_number: carrier?.mc_number || "",
    usdot_number: carrier?.usdot_number || "",
    scac: carrier?.scac || "",
    is_ctpat_certified: carrier?.is_ctpat_certified || false,
    ctpat_svi_number: carrier?.ctpat_svi_number || "",
    fmcsa_authority_active: carrier?.fmcsa_authority_active || false,
    authority_types: carrier?.authority_types || [],
    handles_inbond_ca_shipments: carrier?.handles_inbond_ca_shipments || false,
    rfc_number: carrier?.rfc_number || "",
    
    cdl_drivers_count: carrier?.cdl_drivers_count || undefined,
    b1_drivers_count: carrier?.b1_drivers_count || undefined,
    offers_team_driver_services: carrier?.offers_team_driver_services || false,
    power_units_count: carrier?.power_units_count || undefined,
    dry_van_trailers_count: carrier?.dry_van_trailers_count || undefined,
    reefer_trailers_count: carrier?.reefer_trailers_count || undefined,
    flatbed_trailers_count: carrier?.flatbed_trailers_count || undefined,
    authorized_for_hazmat: carrier?.authorized_for_hazmat || false,
    
    countries_of_operation: carrier?.countries_of_operation || [],
    service_types: carrier?.service_types || [],
    provides_cross_border_services: carrier?.provides_cross_border_services || false,
    cross_border_routes: carrier?.cross_border_routes || [],
    engages_in_trailer_exchanges: carrier?.engages_in_trailer_exchanges || false,
    trailer_exchange_partners: carrier?.trailer_exchange_partners || "",
    
    bank_name: carrier?.bank_name || "",
    account_name: carrier?.account_name || "",
    account_number: carrier?.account_number || "",
    routing_number: carrier?.routing_number || "",
    swift_code: carrier?.swift_code || "",
    payments_via_intermediary: carrier?.payments_via_intermediary || false,
    billing_email: carrier?.billing_email || "",
    currency: carrier?.currency || "",
    payout_method: carrier?.payout_method || "",
    
    tracking_method: carrier?.tracking_method || "",
    telematics_provider: carrier?.telematics_provider || "",
    
    yard_locations: carrier?.yard_locations || [],
    primary_lanes: carrier?.primary_lanes || [],
  };

  const form = useForm<CarrierFormValues>({
    resolver: zodResolver(carrierFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const markSectionCompleted = (section: string) => {
    setFormState(prev => ({
      ...prev,
      [section]: true
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Fill out the information below to complete your carrier profile setup.
          Required fields are marked with an asterisk (*).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-3 sm:grid-cols-7 mb-8">
                <TabsTrigger value="basic" className="flex flex-col items-center gap-1 py-2">
                  <Building className="h-4 w-4" />
                  <span className="text-xs">Basic</span>
                  {formState.basic && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex flex-col items-center gap-1 py-2">
                  <User className="h-4 w-4" />
                  <span className="text-xs">Contact</span>
                  {formState.contact && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex flex-col items-center gap-1 py-2">
                  <FileCheck className="h-4 w-4" />
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
                <TabsTrigger value="preferences" className="flex flex-col items-center gap-1 py-2">
                  <Settings2 className="h-4 w-4" />
                  <span className="text-xs">Preferences</span>
                  {formState.preferences && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
                </TabsTrigger>
              </TabsList>

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
                <ContactInfoFormExternal form={form} />
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
                        Completing Profile...
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
