
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CarrierFormValues } from "../CarrierDetailsForm";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface DocumentsFormProps {
  form: UseFormReturn<CarrierFormValues>;
}

export function DocumentsForm({ form }: DocumentsFormProps) {
  // This is a placeholder for file uploads. In a real implementation, 
  // you would integrate with Supabase Storage or another file upload solution
  const handleFileUpload = (fieldName: string) => {
    alert(`File upload for ${fieldName} would be implemented here with Supabase Storage`);
  };

  const documentFields = [
    { name: "bank_statement_doc", label: "Bank Statement" },
    { name: "cargo_insurance_doc", label: "Cargo Insurance" },
    { name: "primary_liability_doc", label: "Primary Liability Insurance" },
    { name: "w9_form_doc", label: "W9 Form" },
  ];

  return (
    <div className="space-y-6">
      <FormDescription className="text-sm mb-4">
        Upload PDF documents only. Maximum file size: 5MB.
      </FormDescription>

      {documentFields.map((doc) => (
        <FormField
          key={doc.name}
          control={form.control}
          name={doc.name as keyof CarrierFormValues}
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-2">
              <FormLabel>{doc.label}</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input 
                    type="text" 
                    {...field} 
                    className="flex-1"
                    placeholder="No file uploaded" 
                    readOnly 
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => handleFileUpload(doc.name)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      <FormDescription className="text-sm text-muted-foreground italic">
        Note: Document upload functionality would need to be implemented with Supabase Storage or another file storage solution.
      </FormDescription>
    </div>
  );
}
