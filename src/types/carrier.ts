
import { z } from "zod";
import { 
  basicInfoSchema,
  operationalSchema,
  fleetSchema,
  complianceSchema,
  contactSchema,
  billingSchema,
  preferencesSchema
} from "@/components/carriers/schemas/carrierSectionSchemas";

// Type for carrier form values derived from the schemas
export type CarrierFormValues = z.infer<typeof basicInfoSchema> &
  z.infer<typeof operationalSchema> &
  z.infer<typeof fleetSchema> &
  z.infer<typeof complianceSchema> &
  z.infer<typeof contactSchema> &
  z.infer<typeof billingSchema> &
  z.infer<typeof preferencesSchema>;
