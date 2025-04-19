
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CarrierFormValues } from "@/schemas/carrierFormSchema";

interface PreferencesFormProps {
  form: UseFormReturn<CarrierFormValues>;
}

export function PreferencesForm({ form }: PreferencesFormProps) {
  // Make sure the form is properly initialized
  if (!form || !form.control) {
    console.error("Form not properly initialized in PreferencesForm");
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded text-red-800">
        Error: Form not properly initialized. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="tracking_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tracking Method</FormLabel>
              <FormControl>
                <Select 
                  value={field.value || ''} 
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tracking method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gps">GPS</SelectItem>
                    <SelectItem value="eld">ELD</SelectItem>
                    <SelectItem value="mobile">Mobile App</SelectItem>
                    <SelectItem value="manual">Manual Updates</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telematics_provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telematics Provider</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Geotab, Samsara" value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
