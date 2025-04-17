
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CarrierFormValues } from "../CarrierDetailsForm";
import { Button } from "@/components/ui/button";
import { Upload, File, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocumentsFormProps {
  form: UseFormReturn<CarrierFormValues>;
}

export function DocumentsForm({ form }: DocumentsFormProps) {
  const { toast } = useToast();
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const carrierId = form.getValues().id;

  const documentFields = [
    { name: "bank_statement_doc", label: "Bank Statement", accept: ".pdf,.doc,.docx" },
    { name: "cargo_insurance_doc", label: "Cargo Insurance", accept: ".pdf,.doc,.docx" },
    { name: "primary_liability_doc", label: "Primary Liability Insurance", accept: ".pdf,.doc,.docx" },
    { name: "w9_form_doc", label: "W9 Form", accept: ".pdf,.doc,.docx" },
  ];

  const handleFileUpload = async (fieldName: string, file: File) => {
    if (!carrierId) {
      toast({
        title: "Error",
        description: "Carrier ID is required for uploading documents",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingField(fieldName);

      // Define file path: carrier_id/document_type_timestamp.ext
      const fileExt = file.name.split(".").pop();
      const fileName = `${fieldName.replace(/_doc$/, "")}_${Date.now()}.${fileExt}`;
      const filePath = `${carrierId}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("carrier_documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the file
      const { data: urlData } = supabase.storage
        .from("carrier_documents")
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error("Could not get public URL for uploaded file");
      }

      // Update the form field with the file URL
      form.setValue(fieldName as keyof CarrierFormValues, urlData.publicUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });

      toast({
        title: "Document uploaded",
        description: `${documentFields.find(doc => doc.name === fieldName)?.label} has been uploaded successfully.`,
      });
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingField(null);
    }
  };

  // Helper function to render a file name from a URL
  const getFileNameFromUrl = (url: string | null | undefined): string => {
    if (!url) return "No file uploaded";
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      return pathParts[pathParts.length - 1];
    } catch (e) {
      return "File uploaded";
    }
  };

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
                    className="flex-1"
                    placeholder="No file uploaded" 
                    readOnly 
                    value={field.value ? getFileNameFromUrl(String(field.value)) : ""}
                  />
                </FormControl>
                <div className="relative">
                  <input
                    type="file"
                    id={`file-upload-${doc.name}`}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    accept={doc.accept}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(doc.name, file);
                      }
                    }}
                    disabled={uploadingField !== null}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    disabled={uploadingField !== null}
                  >
                    {uploadingField === doc.name ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : field.value ? (
                      <>
                        <File className="h-4 w-4 mr-2" />
                        Replace
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <FormMessage />
              {field.value && (
                <div className="text-xs text-blue-600 hover:underline">
                  <a href={String(field.value)} target="_blank" rel="noopener noreferrer">
                    View Document
                  </a>
                </div>
              )}
            </FormItem>
          )}
        />
      ))}

      <FormDescription className="text-sm text-muted-foreground italic">
        Note: All documents are securely stored and can only be accessed by authorized users.
      </FormDescription>
    </div>
  );
}
