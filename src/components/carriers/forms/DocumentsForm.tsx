
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { DocumentUploadField } from "./DocumentUploadField";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Carrier, updateCarrier } from "@/services/carriersService";

interface DocumentsFormProps {
  carrier: Carrier;
}

// Simple schema for document validation
const documentsSchema = z.object({
  w9_form_doc: z.string().optional(),
  cargo_insurance_doc: z.string().optional(),
  primary_liability_doc: z.string().optional(),
  bank_statement_doc: z.string().optional(),
});

export function DocumentsForm({ carrier }: DocumentsFormProps) {
  const { toast } = useToast();
  const [activeField, setActiveField] = useState<string | null>(null);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{ field: string; file: File } | null>(null);
  const { uploadFile, loading: uploading } = useFileUpload("carrier_documents");
  
  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof documentsSchema>>({
    resolver: zodResolver(documentsSchema),
    defaultValues: {
      w9_form_doc: carrier.w9_form_doc || "",
      cargo_insurance_doc: carrier.cargo_insurance_doc || "",
      primary_liability_doc: carrier.primary_liability_doc || "",
      bank_statement_doc: carrier.bank_statement_doc || "",
    },
  });

  const documentFields = [
    {
      name: "w9_form_doc",
      label: "W9 Form",
      accept: ".pdf,.doc,.docx",
    },
    {
      name: "cargo_insurance_doc",
      label: "Cargo Insurance",
      accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    },
    {
      name: "primary_liability_doc",
      label: "Primary Liability Insurance",
      accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    },
    {
      name: "bank_statement_doc",
      label: "Bank Statement",
      accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    },
  ];

  const handleUpload = (fieldName: string, file: File) => {
    setActiveField(fieldName);
    
    // If there's already a document for this field, show confirmation
    if (form.getValues()[fieldName as keyof z.infer<typeof documentsSchema>]) {
      setPendingUpload({ field: fieldName, file });
      setShowReplaceDialog(true);
    } else {
      // Otherwise, upload directly
      processUpload(fieldName, file);
    }
  };

  const confirmReplace = () => {
    if (pendingUpload) {
      processUpload(pendingUpload.field, pendingUpload.file);
      setShowReplaceDialog(false);
      setPendingUpload(null);
    }
  };

  const cancelReplace = () => {
    setShowReplaceDialog(false);
    setPendingUpload(null);
    setActiveField(null);
  };

  const processUpload = async (fieldName: string, file: File) => {
    try {
      const uploadPath = `carriers/${carrier.id}/${fieldName}/${file.name}`;
      const fileUrl = await uploadFile({
        maxSizeBytes: 10 * 1024 * 1024,
        allowedTypes: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
      }, file, uploadPath);
      
      if (fileUrl) {
        // Update form value
        form.setValue(fieldName as any, fileUrl.url);
        
        // Save to database
        const update = { [fieldName]: fileUrl.url };
        await updateCarrier(carrier.id, update);
        
        toast({
          title: "Document uploaded",
          description: "Your document has been successfully uploaded.",
        });
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActiveField(null);
    }
  };

  const handleRemove = async (fieldName: string) => {
    try {
      // Clear form value
      form.setValue(fieldName as any, "");
      
      // Update database
      const update = { [fieldName]: null };
      await updateCarrier(carrier.id, update);
      
      toast({
        title: "Document removed",
        description: "Your document has been successfully removed.",
      });
    } catch (error) {
      console.error("Error removing document:", error);
      toast({
        title: "Remove failed",
        description: "There was an error removing your document. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {documentFields.map((field) => (
            <DocumentUploadField
              key={field.name}
              form={form}
              fieldName={field.name}
              label={field.label}
              accept={field.accept}
              isUploading={uploading && activeField === field.name}
              onUpload={handleUpload}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </div>
      
      {showReplaceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Replace Document?</h3>
            <p className="mb-6">
              A document is already uploaded. Do you want to replace it with the new one?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelReplace}>
                Cancel
              </Button>
              <Button onClick={confirmReplace}>
                Replace
              </Button>
            </div>
          </div>
        </div>
      )}
    </Form>
  );
}
