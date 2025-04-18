
import * as z from "zod";

export const basicInfoSchema = z.object({
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
});

export const operationalSchema = z.object({
  countries_of_operation: z.array(z.string()).optional(),
  service_types: z.array(z.string()).optional(),
  provides_cross_border_services: z.boolean().optional(),
  cross_border_routes: z.array(z.string()).optional(),
  engages_in_trailer_exchanges: z.boolean().optional(),
  trailer_exchange_partners: z.string().optional(),
});

export const fleetSchema = z.object({
  cdl_drivers_count: z.number().optional(),
  b1_drivers_count: z.number().optional(),
  offers_team_driver_services: z.boolean().optional(),
  power_units_count: z.number().optional(),
  dry_van_trailers_count: z.number().optional(),
  reefer_trailers_count: z.number().optional(),
  flatbed_trailers_count: z.number().optional(),
  authorized_for_hazmat: z.boolean().optional(),
});

export const complianceSchema = z.object({
  registration_type: z.string().optional(),
  is_ctpat_certified: z.boolean().optional(),
  ctpat_svi_number: z.string().optional(),
  fmcsa_authority_active: z.boolean().optional(),
  authority_types: z.array(z.string()).optional(),
  handles_inbond_ca_shipments: z.boolean().optional(),
});

export const contactSchema = z.object({
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email("Invalid email address").optional().or(z.literal('')),
  additional_contacts: z.array(z.any()).optional(),
});

export const billingSchema = z.object({
  bank_name: z.string().optional(),
  account_name: z.string().optional(),
  account_number: z.string().optional(),
  routing_number: z.string().optional(),
  swift_code: z.string().optional(),
  payments_via_intermediary: z.boolean().optional(),
  billing_email: z.string().email("Invalid email address").optional().or(z.literal('')),
  currency: z.string().optional(),
  payout_method: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
});

export const preferencesSchema = z.object({
  yard_locations: z.array(z.any()).optional(),
  primary_lanes: z.array(z.any()).optional(),
  tracking_method: z.string().optional(),
  telematics_provider: z.string().optional(),
});
