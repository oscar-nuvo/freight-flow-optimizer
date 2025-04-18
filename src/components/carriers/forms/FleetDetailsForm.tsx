
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { CarrierFormValues } from "@/types/carrier";
import { Button } from "@/components/ui/button";

interface FleetDetailsFormProps {
  form: UseFormReturn<any>;
  onSubmit: (e: React.FormEvent) => void;
}

export function FleetDetailsForm({ form, onSubmit }: FleetDetailsFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="cdl_drivers_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of CDL Drivers</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  value={field.value || ""}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  min={0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="b1_drivers_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of B1 Drivers</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  value={field.value || ""}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  min={0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="offers_team_driver_services"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you offer team driver services?</FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="team-driver-services"
                />
                <label
                  htmlFor="team-driver-services"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Yes
                </label>
              </div>
            </FormControl>
          </FormItem>
        )}
      />

      <h3 className="text-lg font-medium pb-2">Vehicles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="power_units_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Power Units</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  value={field.value || ""}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  min={0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dry_van_trailers_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Dry Van Trailers</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  value={field.value || ""}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  min={0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="reefer_trailers_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Reefer Trailers</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  value={field.value || ""}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  min={0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="flatbed_trailers_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Flatbed Trailers</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  value={field.value || ""}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  min={0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="authorized_for_hazmat"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-4">
            <FormLabel>Are you authorized to transport Hazmat?</FormLabel>
            <FormControl>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="hazmat-auth"
                />
                <label
                  htmlFor="hazmat-auth"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Yes
                </label>
              </div>
            </FormControl>
          </FormItem>
        )}
      />
      
      <div className="flex justify-end mt-6">
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
