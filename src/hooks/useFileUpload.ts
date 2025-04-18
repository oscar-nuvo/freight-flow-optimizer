
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FileUploadOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

export const useFileUpload = (bucketName: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadFile = async (
    file: File,
    path: string,
    options: FileUploadOptions = {}
  ) => {
    const {
      maxSizeBytes = 10 * 1024 * 1024, // 10MB default
      allowedTypes = [".pdf", ".doc", ".docx"],
    } = options;

    setLoading(true);
    setError(null);

    try {
      console.log(`Starting upload to ${bucketName}/${path} for file:`, file.name);
      
      // Validate file size
      if (file.size > maxSizeBytes) {
        throw new Error(
          `File size exceeds ${(maxSizeBytes / 1024 / 1024).toFixed(1)}MB limit`
        );
      }

      // Validate file type
      const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;
      if (!allowedTypes.includes(fileExt)) {
        throw new Error(
          `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
        );
      }

      // Upload file
      const fileName = `${path}_${Date.now()}${fileExt}`;
      console.log(`Uploading to path: ${fileName}`);
      
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Supabase storage upload error:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful, data:", data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      console.log("Generated public URL:", urlData?.publicUrl);

      return {
        path: data?.path,
        url: urlData?.publicUrl,
      };
    } catch (err: any) {
      console.error("Error in uploadFile:", err);
      const errorMessage = err.message || "Error uploading file";
      setError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadFile,
    loading,
    error,
  };
};
