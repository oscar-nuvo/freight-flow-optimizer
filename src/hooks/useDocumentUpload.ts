
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { updateCarrier } from "@/services/carriersService";

export function useDocumentUpload(form: UseFormReturn<any> | undefined, carrierId?: string) {
  const { toast } = useToast();
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
  const { uploadFile } = useFileUpload("carrier_documents");

  // Function to safely access form values
  const safeGetFormValue = (fieldName: string): string => {
    if (!form || typeof form.watch !== 'function') {
      console.error("Cannot get form value - form not properly initialized");
      return "";
    }
    
    try {
      return form.watch(fieldName) || "";
    } catch (err) {
      console.error(`Error getting form value for ${fieldName}:`, err);
      return "";
    }
  };

  // Function to safely set form values
  const safeSetFormValue = (fieldName: string, value: string): boolean => {
    if (!form || typeof form.setValue !== 'function') {
      console.error("Cannot set form value - form not properly initialized");
      return false;
    }
    
    try {
      form.setValue(fieldName, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return true;
    } catch (err) {
      console.error(`Error setting form value for ${fieldName}:`, err);
      return false;
    }
  };

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
        const valueSet = safeSetFormValue(fieldName, result.url);
        
        if (valueSet) {
          setUploadStatus(prev => ({
            ...prev,
            [fieldName]: "Upload successful"
          }));

          try {
            await updateCarrier(carrierId, { [fieldName]: result.url });
            
            toast({
              title: "Document uploaded",
              description: `Document has been uploaded successfully.`,
            });
          } catch (updateErr: any) {
            console.error("Error updating carrier after upload:", updateErr);
            setUploadStatus(prev => ({
              ...prev,
              [fieldName]: `Warning: Document uploaded but not saved to profile: ${updateErr.message || "Unknown error"}`
            }));
            
            toast({
              title: "Partial success",
              description: "Document uploaded but failed to update carrier profile.",
              variant: "destructive",
            });
          }
        } else {
          throw new Error("Failed to update form with uploaded document URL");
        }
      } else {
        throw new Error("Upload failed - no URL returned");
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
      const valueSet = safeSetFormValue(fieldName, "");
      
      if (valueSet) {
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
      } else {
        throw new Error("Failed to update form after removing document");
      }
    } catch (error: any) {
      console.error("Error removing document:", error);
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
