
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { CarrierFormValues } from "../CarrierDetailsForm";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface OperationalDetailsFormProps {
  form: UseFormReturn<CarrierFormValues>;
}

export function OperationalDetailsForm({ form }: OperationalDetailsFormProps) {
  const watchCrossBorder = form.watch('provides_cross_border_services');
  const watchTrailerExchange = form.watch('engages_in_trailer_exchanges');
  
  // Countries of operation options
  const countriesOfOperation = [
    { id: "US", label: "United States" },
    { id: "MX", label: "Mexico" },
    { id: "CA", label: "Canada" },
  ];
  
  // Service types options
  const serviceTypes = [
    { id: "LTL", label: "LTL (Less-than-truckload)" },
    { id: "FTL", label: "FTL (Full-truckload)" },
  ];
  
  // Cross-border routes options
  const crossBorderRoutes = [
    { id: "US_MX", label: "US<>MX" },
    { id: "US_CA", label: "US<>CA" },
    { id: "CA_MX", label: "CA<>MX" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Countries of Operation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="countries_of_operation"
            render={() => (
              <FormItem>
                <div className="space-y-3">
                  {countriesOfOperation.map((country) => (
                    <FormField
                      key={country.id}
                      control={form.control}
                      name="countries_of_operation"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={country.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(country.id)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  return checked
                                    ? field.onChange([...currentValues, country.id])
                                    : field.onChange(
                                        currentValues.filter((value) => value !== country.id)
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {country.label}
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
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Service Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="service_types"
            render={() => (
              <FormItem>
                <div className="space-y-3">
                  {serviceTypes.map((serviceType) => (
                    <FormField
                      key={serviceType.id}
                      control={form.control}
                      name="service_types"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={serviceType.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(serviceType.id)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  return checked
                                    ? field.onChange([...currentValues, serviceType.id])
                                    : field.onChange(
                                        currentValues.filter((value) => value !== serviceType.id)
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {serviceType.label}
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
      </div>

      <div>
        <FormField
          control={form.control}
          name="provides_cross_border_services"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Do you provide cross-border services?</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="cross-border-services"
                  />
                  <label
                    htmlFor="cross-border-services"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Yes
                  </label>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        {watchCrossBorder && (
          <div className="mt-4 ml-6">
            <h4 className="text-sm font-medium mb-2">Cross-border routes:</h4>
            <FormField
              control={form.control}
              name="cross_border_routes"
              render={() => (
                <FormItem>
                  <div className="space-y-2">
                    {crossBorderRoutes.map((route) => (
                      <FormField
                        key={route.id}
                        control={form.control}
                        name="cross_border_routes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={route.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(route.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = field.value || [];
                                    return checked
                                      ? field.onChange([...currentValues, route.id])
                                      : field.onChange(
                                          currentValues.filter((value) => value !== route.id)
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {route.label}
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
      </div>

      <div>
        <FormField
          control={form.control}
          name="engages_in_trailer_exchanges"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Do you engage in trailer exchanges?</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="trailer-exchanges"
                  />
                  <label
                    htmlFor="trailer-exchanges"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Yes
                  </label>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        {watchTrailerExchange && (
          <div className="mt-4 ml-6">
            <FormField
              control={form.control}
              name="trailer_exchange_partners"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trailer Exchange Partners</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="List your trailer exchange partners"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Please list the companies you exchange trailers with
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
