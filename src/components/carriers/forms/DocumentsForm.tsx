
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormDescription } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { DocumentConfirmDialog } from "./DocumentConfirmDialog";
import { DocumentUploadField } from "./DocumentUploadField";
import { CarrierFormValues } from "@/types/carrier";
import { AlertTriangle } from "lucide-react";
import { updateCarrier } from "@/services/carriersService";

interface DocumentsFormProps {
  form: UseFormReturn<CarrierFormValues>;
}

export function DocumentsForm({ form }: DocumentsFormProps) {
  const { toast } = useToast();
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{ field: string; file: File } | null>(null);
  const { uploadFile, loading: uploading } = useFileUpload("carrier_documents");
  const carrierId = form.getValues().id;

  const documentFields = [
    { name: "bank_statement_doc", label: "Bank Statement", accept: ".pdf,.doc,.docx" },
    { name: "cargo_insurance_doc", label: "Cargo Insurance", accept: ".pdf,.doc,.docx" },
    { name: "primary_liability_doc", label: "Primary Liability Insurance", accept: ".pdf,.doc,.docx" },
    { name: "w9_form_doc", label: "W9 Form", accept: ".pdf,.doc,.docx" },
  ];

  const handleFileUpload = async (fieldName: string, file: File) => {
    const existingFile = form.getValues()[fieldName as keyof CarrierFormValues];
    if (existingFile) {
      setPendingUpload({ field: fieldName, file });
      setShowReplaceDialog(true);
      return;
    }

    await uploadDocument(fieldName, file);
  };

  const uploadDocument = async (fieldName: string, file: File) => {
    if (!carrierId) {
      setUploadError("Unable to upload: Carrier ID is missing. Please save the carrier first.");
      toast({
        title: "Upload Error",
        description: "Carrier ID is required for uploading documents. Please save the carrier first.",
        variant: "destructive",
      });
      return;
    }

    setUploadError(null);
    setUploadingField(fieldName);
    
    try {
      const result = await uploadFile(
        file,
        `${carrierId}/${fieldName.replace(/_doc$/, "")}`,
        {
          maxSizeBytes: 5 * 1024 * 1024,
          allowedTypes: ['.pdf', '.doc', '.docx'],
        }
      );

      if (result?.url) {
        // Update the form field
        form.setValue(fieldName as keyof CarrierFormValues, result.url, {
          shouldDirty: true,
          shouldValidate: true,
        });

        // Update the carrier record in the database
        const updates = { [fieldName]: result.url };
        await updateCarrier(carrierId, updates);

        toast({
          title: "Document uploaded",
          description: `${documentFields.find(doc => doc.name === fieldName)?.label} has been uploaded successfully.`,
        });
      }
    } catch (error: any) {
      console.error("Error in document upload handler:", error);
      setUploadError(error.message || "Failed to upload document");
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setUploadingField(null);
    }
  };

  const handleConfirmReplace = async () => {
    if (pendingUpload) {
      await uploadDocument(pendingUpload.field, pendingUpload.file);
    }
    setShowReplaceDialog(false);
    setPendingUpload(null);
  };

  const handleRemoveDocument = async (fieldName: string) => {
    try {
      // Update the form field
      form.setValue(fieldName as keyof CarrierFormValues, "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      // Update the carrier record in the database
      const updates = { [fieldName]: null };
      await updateCarrier(carrierId, updates);

      toast({
        title: "Document removed",
        description: `${documentFields.find(doc => doc.name === fieldName)?.label} has been removed.`,
      });
    } catch (error: any) {
      console.error("Error removing document:", error);
      toast({
        title: "Error",
        description: "Failed to remove document. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <FormDescription className="text-sm mb-4">
        Upload PDF documents only. Maximum file size: 5MB.
      </FormDescription>

      {uploadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {documentFields.map((doc) => (
          <DocumentUploadField
            key={doc.name}
            form={form}
            fieldName={doc.name}
            label={doc.label}
            accept={doc.accept}
            isUploading={uploadingField === doc.name}
            onUpload={handleFileUpload}
            onRemove={handleRemoveDocument}
          />
        ))}
      </div>

      <DocumentConfirmDialog
        isOpen={showReplaceDialog}
        onClose={() => {
          setShowReplaceDialog(false);
          setPendingUpload(null);
        }}
        onConfirm={handleConfirmReplace}
        title="Replace Document"
        description="Are you sure you want to replace the existing document? This action cannot be undone."
        actionLabel="Replace"
      />

      <FormDescription className="text-sm text-muted-foreground italic">
        Note: All documents are securely stored and can only be accessed by authorized users.
      </FormDescription>
    </div>
  );
}
