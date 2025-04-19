
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FormTabs } from "./FormTabs";
import { UseFormReturn } from "react-hook-form";
import { CarrierFormValues } from "@/schemas/carrierFormSchema";

interface FormContainerProps {
  form: UseFormReturn<CarrierFormValues>;
  activeTab: string;
  formState: {
    basic: boolean;
    contact: boolean;
    compliance: boolean;
    fleet: boolean;
    operations: boolean;
    billing: boolean;
    preferences: boolean;
  };
  onTabChange: (value: string) => void;
  onSectionComplete: (section: string) => void;
  isSubmitting: boolean;
  children: React.ReactNode;
}

export function FormContainer({
  form,
  activeTab,
  formState,
  onTabChange,
  onSectionComplete,
  isSubmitting,
  children
}: FormContainerProps) {
  // We don't need to wrap this in another Form component since it should be
  // inside a Form context from the parent component
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <FormTabs formState={formState} />
      {children}
    </Tabs>
  );
}
