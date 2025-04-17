
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { CarrierFormValues } from "../CarrierDetailsForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ComplianceFormProps {
  form: UseFormReturn<CarrierFormValues>;
}

export function ComplianceForm({ form }: ComplianceFormProps) {
  const watchCrossBorder = form.watch('provides_cross_border_services');
  const watchCtpat = form.watch('is_ctpat_certified');
  const watchFmcsa = form.watch('fmcsa_authority_active');

  // Authority types options
  const authorityTypes = [
    { id: "broker", label: "Broker" },
    { id: "contract", label: "Contract" },
    { id: "common", label: "Common" },
  ];
  
  return (
    <div className="space-y-6">
      {watchCrossBorder && (
        <FormField
          control={form.control}
          name="scac"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SCAC Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <FormField
        control={form.control}
        name="registration_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Registration Type</FormLabel>
            <FormControl>
              <Select 
                value={field.value || ''} 
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select registration type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mc">MC</SelectItem>
                  <SelectItem value="dot">DOT</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {form.watch('registration_type') === 'mc' && (
        <FormField
          control={form.control}
          name="mc_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>MC Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {form.watch('registration_type') === 'dot' && (
        <FormField
          control={form.control}
          name="usdot_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>USDOT Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <FormField
        control={form.control}
        name="is_ctpat_certified"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Are you CTPAT Certified?</FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="ctpat-certified"
                />
                <label
                  htmlFor="ctpat-certified"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Yes
                </label>
              </div>
            </FormControl>
          </FormItem>
        )}
      />
      
      {watchCtpat && (
        <FormField
          control={form.control}
          name="ctpat_svi_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CTPAT SVI Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      <FormField
        control={form.control}
        name="fmcsa_authority_active"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>FMCSA Authority Active?</FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="fmcsa-active"
                />
                <label
                  htmlFor="fmcsa-active"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Yes
                </label>
              </div>
            </FormControl>
          </FormItem>
        )}
      />
      
      {watchFmcsa && (
        <div>
          <h3 className="text-sm font-medium mb-3">Authority Types</h3>
          <FormField
            control={form.control}
            name="authority_types"
            render={() => (
              <FormItem>
                <div className="space-y-2">
                  {authorityTypes.map((authority) => (
                    <FormField
                      key={authority.id}
                      control={form.control}
                      name="authority_types"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={authority.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(authority.id)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  return checked
                                    ? field.onChange([...currentValues, authority.id])
                                    : field.onChange(
                                        currentValues.filter((value) => value !== authority.id)
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {authority.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
      
      <FormField
        control={form.control}
        name="handles_inbond_ca_shipments"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you handle in-bond shipments to Canada?</FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="inbond-ca-shipments"
                />
                <label
                  htmlFor="inbond-ca-shipments"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Yes
                </label>
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
