
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, User, FileCheck, Truck, MapPin, CreditCard, Settings2, CheckCircle } from "lucide-react";

interface FormTabsProps {
  formState: {
    basic: boolean;
    contact: boolean;
    compliance: boolean;
    fleet: boolean;
    operations: boolean;
    billing: boolean;
    preferences: boolean;
  };
}

export function FormTabs({ formState }: FormTabsProps) {
  return (
    <TabsList className="grid grid-cols-3 sm:grid-cols-7 mb-8">
      <TabsTrigger value="basic" className="flex flex-col items-center gap-1 py-2">
        <Building className="h-4 w-4" />
        <span className="text-xs">Basic</span>
        {formState.basic && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
      </TabsTrigger>
      
      <TabsTrigger value="contact" className="flex flex-col items-center gap-1 py-2">
        <User className="h-4 w-4" />
        <span className="text-xs">Contact</span>
        {formState.contact && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
      </TabsTrigger>
      
      <TabsTrigger value="compliance" className="flex flex-col items-center gap-1 py-2">
        <FileCheck className="h-4 w-4" />
        <span className="text-xs">Compliance</span>
        {formState.compliance && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
      </TabsTrigger>
      
      <TabsTrigger value="fleet" className="flex flex-col items-center gap-1 py-2">
        <Truck className="h-4 w-4" />
        <span className="text-xs">Fleet</span>
        {formState.fleet && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
      </TabsTrigger>
      
      <TabsTrigger value="operations" className="flex flex-col items-center gap-1 py-2">
        <MapPin className="h-4 w-4" />
        <span className="text-xs">Operations</span>
        {formState.operations && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
      </TabsTrigger>
      
      <TabsTrigger value="billing" className="flex flex-col items-center gap-1 py-2">
        <CreditCard className="h-4 w-4" />
        <span className="text-xs">Billing</span>
        {formState.billing && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
      </TabsTrigger>
      
      <TabsTrigger value="preferences" className="flex flex-col items-center gap-1 py-2">
        <Settings2 className="h-4 w-4" />
        <span className="text-xs">Preferences</span>
        {formState.preferences && <CheckCircle className="h-3 w-3 text-green-500 absolute top-1 right-1" />}
      </TabsTrigger>
    </TabsList>
  );
}
