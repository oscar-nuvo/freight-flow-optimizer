
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { updateCarrier } from "@/services/carriersService";

export function useDocumentUpload(form: UseFormReturn<any>, carrierId?: string) {
  const { toast } = useToast();
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
  const { uploadFile } = useFileUpload("carrier_documents");

  const handleFileUpload = async (fieldName: string, file: File) => {
    if (!carrierId) {
      const errorMsg = "Unable to upload: Carrier ID is missing. Please save the carrier first.";
      setUploadError(errorMsg);
      setUploadStatus(prev => ({
        ...prev,
        [fieldName]: "Error: Carrier ID missing"
      }));
      
      toast({
        title: "Upload Error",
        description: "Carrier ID is required for uploading documents. Please save the carrier first.",
        variant: "destructive",
      });
      return;
    }

    setUploadError(null);
    setUploadingField(fieldName);
    setUploadStatus(prev => ({
      ...prev,
      [fieldName]: "Uploading..."
    }));
    
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
        form.setValue(fieldName, result.url, {
          shouldDirty: true,
          shouldValidate: true,
        });

        setUploadStatus(prev => ({
          ...prev,
          [fieldName]: "Upload successful"
        }));

        await updateCarrier(carrierId, { [fieldName]: result.url });
        
        toast({
          title: "Document uploaded",
          description: `Document has been uploaded successfully.`,
        });
      }
    } catch (err: any) {
      console.error("Error in document upload handler:", err);
      const errorMsg = err.message || "Failed to upload document";
      setUploadError(errorMsg);
      setUploadStatus(prev => ({
        ...prev,
        [fieldName]: `Error: ${errorMsg}`
      }));
      
      toast({
        title: "Upload failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setUploadingField(null);
    }
  };

  const handleRemoveDocument = async (fieldName: string) => {
    if (!carrierId) {
      toast({
        title: "Error",
        description: "Unable to remove document. Form not properly initialized.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      form.setValue(fieldName, "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      setUploadStatus(prev => ({
        ...prev,
        [fieldName]: "Document removed"
      }));

      const updates = { [fieldName]: null };
      await updateCarrier(carrierId, updates);

      toast({
        title: "Document removed",
        description: "Document has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to remove document: ${error.message || "Please try again"}`,
        variant: "destructive",
      });
    }
  };

  return {
    uploadingField,
    uploadError,
    uploadStatus,
    handleFileUpload,
    handleRemoveDocument,
  };
}
