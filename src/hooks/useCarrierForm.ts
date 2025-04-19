import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { carrierFormSchema, CarrierFormValues } from "@/schemas/carrierFormSchema";
import { Carrier } from "@/services/carriersService";

export function useCarrierForm(carrier: Carrier | null, onSubmit: (data: CarrierFormValues) => void) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formState, setFormState] = useState({
    basic: false,
    contact: false,
    compliance: false,
    fleet: false,
    operations: false,
    billing: false,
    preferences: false,
  });

  const form = useForm<CarrierFormValues>({
    resolver: zodResolver(carrierFormSchema),
    defaultValues: {
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
      
      // Compliance fields
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
      
      // Fleet fields
      cdl_drivers_count: carrier?.cdl_drivers_count || undefined,
      b1_drivers_count: carrier?.b1_drivers_count || undefined,
      offers_team_driver_services: carrier?.offers_team_driver_services || false,
      power_units_count: carrier?.power_units_count || undefined,
      dry_van_trailers_count: carrier?.dry_van_trailers_count || undefined,
      reefer_trailers_count: carrier?.reefer_trailers_count || undefined,
      flatbed_trailers_count: carrier?.flatbed_trailers_count || undefined,
      authorized_for_hazmat: carrier?.authorized_for_hazmat || false,
      
      // Operational fields
      countries_of_operation: carrier?.countries_of_operation || [],
      service_types: carrier?.service_types || [],
      provides_cross_border_services: carrier?.provides_cross_border_services || false,
      cross_border_routes: carrier?.cross_border_routes || [],
      engages_in_trailer_exchanges: carrier?.engages_in_trailer_exchanges || false,
      trailer_exchange_partners: carrier?.trailer_exchange_partners || "",
      
      // Billing fields
      bank_name: carrier?.bank_name || "",
      account_name: carrier?.account_name || "",
      account_number: carrier?.account_number || "",
      routing_number: carrier?.routing_number || "",
      swift_code: carrier?.swift_code || "",
      payments_via_intermediary: carrier?.payments_via_intermediary || false,
      billing_email: carrier?.billing_email || "",
      currency: carrier?.currency || "",
      payout_method: carrier?.payout_method || "",
      
      // Preference fields
      tracking_method: carrier?.tracking_method || "",
      telematics_provider: carrier?.telematics_provider || "",
      
      // Commercial preference fields
      yard_locations: carrier?.yard_locations || [],
      primary_lanes: carrier?.primary_lanes || [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (carrier) {
      form.reset({
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
        
        // Compliance fields
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
        
        // Fleet fields
        cdl_drivers_count: carrier?.cdl_drivers_count || undefined,
        b1_drivers_count: carrier?.b1_drivers_count || undefined,
        offers_team_driver_services: carrier?.offers_team_driver_services || false,
        power_units_count: carrier?.power_units_count || undefined,
        dry_van_trailers_count: carrier?.dry_van_trailers_count || undefined,
        reefer_trailers_count: carrier?.reefer_trailers_count || undefined,
        flatbed_trailers_count: carrier?.flatbed_trailers_count || undefined,
        authorized_for_hazmat: carrier?.authorized_for_hazmat || false,
        
        // Operational fields
        countries_of_operation: carrier?.countries_of_operation || [],
        service_types: carrier?.service_types || [],
        provides_cross_border_services: carrier?.provides_cross_border_services || false,
        cross_border_routes: carrier?.cross_border_routes || [],
        engages_in_trailer_exchanges: carrier?.engages_in_trailer_exchanges || false,
        trailer_exchange_partners: carrier?.trailer_exchange_partners || "",
        
        // Billing fields
        bank_name: carrier?.bank_name || "",
        account_name: carrier?.account_name || "",
        account_number: carrier?.account_number || "",
        routing_number: carrier?.routing_number || "",
        swift_code: carrier?.swift_code || "",
        payments_via_intermediary: carrier?.payments_via_intermediary || false,
        billing_email: carrier?.billing_email || "",
        currency: carrier?.currency || "",
        payout_method: carrier?.payout_method || "",
        
        // Preference fields
        tracking_method: carrier?.tracking_method || "",
        telematics_provider: carrier?.telematics_provider || "",
        
        // Commercial preference fields
        yard_locations: carrier?.yard_locations || [],
        primary_lanes: carrier?.primary_lanes || [],
      });
      
      const updatedFormState = { ...formState };
      if (carrier.name) updatedFormState.basic = true;
      if (carrier.contact_name) updatedFormState.contact = true;
      if (carrier.mc_number) updatedFormState.compliance = true;
      if (carrier.power_units_count) updatedFormState.fleet = true;
      if (carrier.countries_of_operation?.length) updatedFormState.operations = true;
      if (carrier.bank_name) updatedFormState.billing = true;
      if (carrier.tracking_method) updatedFormState.preferences = true;
      
      setFormState(updatedFormState);
    }
  }, [carrier]);

  const markSectionCompleted = (section: keyof typeof formState) => {
    setFormState(prev => ({
      ...prev,
      [section]: true
    }));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return {
    form,
    activeTab,
    formState,
    handleTabChange,
    markSectionCompleted,
  };
}
