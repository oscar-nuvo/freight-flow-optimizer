
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { updateCarrier } from "@/services/carriersService";

export const useCarrierSectionForm = (
  schema: z.ZodObject<any>,
  carrier: any,
  sectionName: string,
  onSuccess?: () => void
) => {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: carrier,
  });

  const onSubmit = async (data: any) => {
    try {
      await updateCarrier(carrier.id, data);
      toast({
        title: "Success",
        description: `${sectionName} section has been updated.`,
      });
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to update ${sectionName} section`,
        variant: "destructive",
      });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
