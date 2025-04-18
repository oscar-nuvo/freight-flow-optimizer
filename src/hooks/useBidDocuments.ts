
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { supabase } from "@/integrations/supabase/client";

interface DocumentUploadOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

export const useBidDocuments = (bidId?: string, orgId?: string) => {
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { toast } = useToast();
  const { uploadFile, loading: uploading } = useFileUpload("bid_documents");

  const handleFileUpload = async (fieldName: string, file: File, options: DocumentUploadOptions = {}) => {
    if (!bidId) {
      setUploadError("Unable to upload: Bid ID is missing.");
      toast({
        title: "Upload Error",
        description: "Bid ID is required for uploading documents.",
        variant: "destructive",
      });
      return null;
    }

    if (!orgId) {
      setUploadError("Unable to upload: Organization ID is missing.");
      toast({
        title: "Upload Error",
        description: "Organization ID is required for uploading documents.",
        variant: "destructive",
      });
      return null;
    }

    setUploadError(null);
    setUploadingField(fieldName);
    setUploadProgress(0);
    
    try {
      console.log(`Uploading ${fieldName} for bid: ${bidId}`);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      const result = await uploadFile(
        file,
        `${orgId}/bids/${bidId}/${fieldName}`,
        {
          maxSizeBytes: options.maxSizeBytes || 10 * 1024 * 1024,
          allowedTypes: options.allowedTypes || ['.pdf', '.doc', '.docx'],
        }
      );

      clearInterval(progressInterval);

      if (!result?.url) {
        setUploadProgress(0);
        throw new Error("Failed to get URL after upload");
      }

      setUploadProgress(100);
      console.log(`Upload successful, URL: ${result.url}`);
      
      toast({
        title: "Document uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });

      // Reset progress after a brief delay to show completion
      setTimeout(() => {
        setUploadProgress(0);
        setUploadingField(null);
      }, 1000);

      return result.url;
    } catch (error: any) {
      console.error("Error in document upload handler:", error);
      setUploadError(error.message || "Failed to upload document");
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingField(null);
    }
  };

  const updateBidDocument = async (bidId: string, updates: Record<string, any>) => {
    try {
      console.log(`Updating bid ${bidId} with document data:`, updates);
      
      const { error } = await supabase
        .from("bids")
        .update(updates)
        .eq("id", bidId);

      if (error) {
        console.error("Error updating bid document in database:", error);
        throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error("Error in updateBidDocument:", error);
      toast({
        title: "Error",
        description: `Failed to update bid document: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const removeDocument = async (bidId: string, fieldName: string) => {
    try {
      const updates = { [fieldName]: null };
      
      const { error } = await supabase
        .from("bids")
        .update(updates)
        .eq("id", bidId);

      if (error) {
        throw error;
      }

      toast({
        title: "Document removed",
        description: "Document has been removed successfully.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error removing document:", error);
      toast({
        title: "Error",
        description: "Failed to remove document. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadingField,
    uploadError,
    uploading,
    uploadProgress,
    handleFileUpload,
    updateBidDocument,
    removeDocument
  };
};
