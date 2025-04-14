
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createCarrier, CarrierFormData } from "@/services/carriersService";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters"),
  mc_number: z.string().optional(),
  usdot_number: z.string().optional(),
  rfc_number: z.string().optional(),
}).refine(data => {
  // At least one of these must be provided
  return data.mc_number || data.usdot_number || data.rfc_number;
}, {
  message: "At least one identifier (MC Number, USDOT Number, or RFC Number) is required",
  path: ["mc_number"], // Display error on the first field
});

type CarrierFormProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function CarrierForm({ open, onClose, onSuccess }: CarrierFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      mc_number: "",
      usdot_number: "",
      rfc_number: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Clean up the form data to remove empty strings
      const formData: CarrierFormData = {
        name: values.name,
      };

      if (values.mc_number) formData.mc_number = values.mc_number;
      if (values.usdot_number) formData.usdot_number = values.usdot_number;
      if (values.rfc_number) formData.rfc_number = values.rfc_number;

      await createCarrier(formData);
      toast({
        title: "Carrier created",
        description: "The carrier was created successfully.",
      });
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Failed to create carrier",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Carrier</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrier Name*</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mc_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MC Number</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="usdot_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>USDOT Number</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rfc_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RFC Number</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Carrier"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
