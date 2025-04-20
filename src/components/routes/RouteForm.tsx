
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RouteFormValues, EquipmentType } from "@/types/route";

const formSchema = z.object({
  origin_city: z.string().min(1, "Origin city is required"),
  destination_city: z.string().min(1, "Destination city is required"),
  equipment_type: z.enum(["Dry Van", "Reefer", "Flatbed"] as const),
  commodity: z.string().min(1, "Commodity is required"),
  weekly_volume: z.number().min(0, "Volume must be 0 or greater"),
  distance: z.number().optional(),
});

interface RouteFormProps {
  defaultValues?: Partial<RouteFormValues>;
  onSubmit: (values: RouteFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export const RouteForm = ({
  defaultValues,
  onSubmit,
  isSubmitting,
}: RouteFormProps) => {
  const form = useForm<RouteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin_city: "",
      destination_city: "",
      equipment_type: "Dry Van",
      commodity: "",
      weekly_volume: 0,
      distance: undefined,
      ...defaultValues,
    },
  });

  const equipmentTypes: EquipmentType[] = ["Dry Van", "Reefer", "Flatbed"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="origin_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origin City</FormLabel>
              <FormControl>
                <Input placeholder="Enter origin city" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destination_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination City</FormLabel>
              <FormControl>
                <Input placeholder="Enter destination city" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="equipment_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {equipmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="commodity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Commodity</FormLabel>
              <FormControl>
                <Input placeholder="Enter commodity" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weekly_volume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weekly Volume</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="Enter weekly volume"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="distance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distance (miles)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="Enter distance"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => 
                    field.onChange(e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Route"}
        </Button>
      </form>
    </Form>
  );
};
