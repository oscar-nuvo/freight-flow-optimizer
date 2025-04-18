
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
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      return {
        path: data?.path,
        url: urlData?.publicUrl,
      };
    } catch (err: any) {
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
