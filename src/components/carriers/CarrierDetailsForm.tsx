import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Carrier, updateCarrier } from "@/services/carriersService";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, User, MapPin, FileText, Building, ReceiptText, Landmark, Truck as TruckIcon, FileCheck } from "lucide-react";

// Import form components
import { BasicInfoForm } from "./forms/BasicInfoForm";
import { OperationalDetailsForm } from "./forms/OperationalDetailsForm";
import { FleetDetailsForm } from "./forms/FleetDetailsForm";
import { ComplianceForm } from "./forms/ComplianceForm";
import { DocumentsForm } from "./forms/DocumentsForm";
import { ContactInfoForm } from "./forms/ContactInfoForm";
import { BillingInfoForm } from "./forms/BillingInfoForm";
import { CommercialPreferencesForm } from "./forms/CommercialPreferencesForm";

const carrierFormSchema = z.object({
  // Basic Info
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  legal_business_name: z.string().optional(),
  mc_number: z.string().optional(),
  usdot_number: z.string().optional(),
  rfc_number: z.string().optional(),
  tax_id: z.string().optional(),
  scac: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "pending", "inactive"]),
  
  // Contact Info
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email("Invalid email address").optional().or(z.literal('')),
  additional_contacts: z.array(z.any()).optional(),
  
  // Address Info
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
  
  // Operational Details
  countries_of_operation: z.array(z.string()).optional(),
  service_types: z.array(z.string()).optional(),
  provides_cross_border_services: z.boolean().optional(),
  cross_border_routes: z.array(z.string()).optional(),
  engages_in_trailer_exchanges: z.boolean().optional(),
  trailer_exchange_partners: z.string().optional(),
  
  // Fleet Details
  cdl_drivers_count: z.number().optional(),
  b1_drivers_count: z.number().optional(),
  offers_team_driver_services: z.boolean().optional(),
  power_units_count: z.number().optional(),
  dry_van_trailers_count: z.number().optional(),
  reefer_trailers_count: z.number().optional(),
  flatbed_trailers_count: z.number().optional(),
  authorized_for_hazmat: z.boolean().optional(),
  
  // Compliance
  registration_type: z.string().optional(),
  is_ctpat_certified: z.boolean().optional(),
  ctpat_svi_number: z.string().optional(),
  fmcsa_authority_active: z.boolean().optional(),
  authority_types: z.array(z.string()).optional(),
  handles_inbond_ca_shipments: z.boolean().optional(),
  
  // Documents
  bank_statement_doc: z.string().optional(),
  cargo_insurance_doc: z.string().optional(),
  primary_liability_doc: z.string().optional(),
  w9_form_doc: z.string().optional(),
  
  // Insurance Details
  insurance_provider: z.string().optional(),
  insurance_policy_number: z.string().optional(),
  insurance_expiry: z.string().optional(),
  
  // Billing Info
  bank_name: z.string().optional(),
  account_name: z.string().optional(),
  account_number: z.string().optional(),
  routing_number: z.string().optional(),
  swift_code: z.string().optional(),
  payments_via_intermediary: z.boolean().optional(),
  billing_email: z.string().email("Invalid email address").optional().or(z.literal('')),
  currency: z.string().optional(),
  payout_method: z.string().optional(),
  
  // Commercial Preferences
  yard_locations: z.array(z.any()).optional(),
  primary_lanes: z.array(z.any()).optional(),
  tracking_method: z.string().optional(),
  telematics_provider: z.string().optional(),
});

export type CarrierFormValues = z.infer<typeof carrierFormSchema>;

interface CarrierDetailsFormProps {
  carrier: Carrier;
}

export function CarrierDetailsForm({ carrier }: CarrierDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CarrierFormValues>({
    resolver: zodResolver(carrierFormSchema),
    defaultValues: {
      id: carrier.id,
      name: carrier.name || "",
      legal_business_name: carrier.legal_business_name || "",
      mc_number: carrier.mc_number || "",
      usdot_number: carrier.usdot_number || "",
      rfc_number: carrier.rfc_number || "",
      tax_id: carrier.tax_id || "",
      scac: carrier.scac || "",
      website: carrier.website || "",
      description: carrier.description || "",
      status: carrier.status as "active" | "pending" | "inactive",
      
      contact_name: carrier.contact_name || "",
      contact_phone: carrier.contact_phone || "",
      contact_email: carrier.contact_email || "",
      additional_contacts: carrier.additional_contacts || [],
      
      address_line1: carrier.address_line1 || "",
      address_line2: carrier.address_line2 || "",
      city: carrier.city || "",
      state: carrier.state || "",
      zip_code: carrier.zip_code || "",
      country: carrier.country || "",
      
      countries_of_operation: carrier.countries_of_operation || [],
      service_types: carrier.service_types || [],
      provides_cross_border_services: carrier.provides_cross_border_services || false,
      cross_border_routes: carrier.cross_border_routes || [],
      engages_in_trailer_exchanges: carrier.engages_in_trailer_exchanges || false,
      trailer_exchange_partners: carrier.trailer_exchange_partners || "",
      
      cdl_drivers_count: carrier.cdl_drivers_count,
      b1_drivers_count: carrier.b1_drivers_count,
      offers_team_driver_services: carrier.offers_team_driver_services || false,
      power_units_count: carrier.power_units_count,
      dry_van_trailers_count: carrier.dry_van_trailers_count,
      reefer_trailers_count: carrier.reefer_trailers_count,
      flatbed_trailers_count: carrier.flatbed_trailers_count,
      authorized_for_hazmat: carrier.authorized_for_hazmat || false,
      
      registration_type: carrier.registration_type || "",
      is_ctpat_certified: carrier.is_ctpat_certified || false,
      ctpat_svi_number: carrier.ctpat_svi_number || "",
      fmcsa_authority_active: carrier.fmcsa_authority_active || false,
      authority_types: carrier.authority_types || [],
      handles_inbond_ca_shipments: carrier.handles_inbond_ca_shipments || false,
      
      bank_statement_doc: carrier.bank_statement_doc || "",
      cargo_insurance_doc: carrier.cargo_insurance_doc || "",
      primary_liability_doc: carrier.primary_liability_doc || "",
      w9_form_doc: carrier.w9_form_doc || "",
      
      insurance_provider: carrier.insurance_provider || "",
      insurance_policy_number: carrier.insurance_policy_number || "",
      insurance_expiry: carrier.insurance_expiry || "",
      
      bank_name: carrier.bank_name || "",
      account_name: carrier.account_name || "",
      account_number: carrier.account_number || "",
      routing_number: carrier.routing_number || "",
      swift_code: carrier.swift_code || "",
      payments_via_intermediary: carrier.payments_via_intermediary || false,
      billing_email: carrier.billing_email || "",
      currency: carrier.currency || "",
      payout_method: carrier.payout_method || "",
      
      yard_locations: carrier.yard_locations || [],
      primary_lanes: carrier.primary_lanes || [],
      tracking_method: carrier.tracking_method || "",
      telematics_provider: carrier.telematics_provider || "",
    },
  });

  const onSubmit = async (data: CarrierFormValues) => {
    setIsSubmitting(true);
    try {
      await updateCarrier(carrier.id, data);
      toast({
        title: "Carrier updated",
        description: "The carrier profile has been updated successfully.",
      });
      // Mark the profile as completed if it wasn't before
      if (!carrier.profile_completed_at) {
        await updateCarrier(carrier.id, { 
          ...data, 
          profile_completed_at: new Date().toISOString() 
        });
      }
    } catch (error: any) {
      console.error("Error updating carrier:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update carrier",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Carrier Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-8">
            <TabsTrigger value="basic">
              <Building className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="operational">
              <TruckIcon className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Operational</span>
            </TabsTrigger>
            <TabsTrigger value="fleet">
              <Truck className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Fleet</span>
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <FileCheck className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="contact">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="billing">
              <Landmark className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <ReceiptText className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="basic">
                <BasicInfoForm form={form} />
              </TabsContent>
              
              <TabsContent value="operational">
                <OperationalDetailsForm form={form} />
              </TabsContent>
              
              <TabsContent value="fleet">
                <FleetDetailsForm form={form} />
              </TabsContent>
              
              <TabsContent value="compliance">
                <ComplianceForm form={form} />
              </TabsContent>
              
              <TabsContent value="contact">
                <ContactInfoForm form={form} />
              </TabsContent>
              
              <TabsContent value="billing">
                <BillingInfoForm form={form} />
              </TabsContent>
              
              <TabsContent value="documents">
                <DocumentsForm form={form} />
              </TabsContent>
              
              <TabsContent value="preferences">
                <CommercialPreferencesForm form={form} />
              </TabsContent>
              
              <div className="p-4 bg-muted rounded-md mt-6">
                <h3 className="font-medium mb-2">Profile Completion Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created:</p>
                    <p>{formatDate(carrier.created_at)}</p>
                  </div>
                  {carrier.invite_sent_at && (
                    <div>
                      <p className="text-muted-foreground">Invite Sent:</p>
                      <p>{formatDate(carrier.invite_sent_at)}</p>
                    </div>
                  )}
                  {carrier.profile_completed_at && (
                    <div>
                      <p className="text-muted-foreground">Profile Completed:</p>
                      <p>{formatDate(carrier.profile_completed_at)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/carriers")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
