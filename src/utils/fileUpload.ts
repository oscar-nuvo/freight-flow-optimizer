
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles file upload to Supabase storage
 * @param file The file to upload
 * @param bucketName Storage bucket name ('bid_documents' or 'carrier_documents')
 * @param path Directory path within the bucket
 * @param options Additional options (maxSize in bytes, allowedTypes as array of extensions)
 * @returns Object containing success status, error message, and file URL if successful
 */
export const uploadFile = async (
  file: File,
  bucketName: string,
  path: string,
  options: {
    maxSizeBytes?: number;
    allowedTypes?: string[];
    onError?: (message: string) => void;
  } = {}
) => {
  try {
    const {
      maxSizeBytes = 10 * 1024 * 1024, // Default 10MB
      allowedTypes = ['.pdf', '.doc', '.docx'],
      onError
    } = options;

    // Check if file exists
    if (!file) {
      const errorMsg = "No file selected";
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      const errorMsg = `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the ${(maxSizeBytes / 1024 / 1024).toFixed(0)}MB limit`;
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Validate file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!allowedTypes.includes(fileExtension)) {
      const errorMsg = `Invalid file type. Please upload a ${allowedTypes.join(', ')} file`;
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Define file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${path}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log(`Uploading to ${bucketName}: ${filePath}`);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true
      });

    if (uploadError) {
      console.error("Upload error details:", uploadError);
      if (onError) onError(uploadError.message || "Upload failed");
      return { success: false, error: uploadError.message || "Upload failed" };
    }

    console.log("File uploaded successfully:", uploadData);

    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      const errorMsg = "Could not generate public URL for uploaded file";
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    }

    console.log("Public URL generated:", urlData.publicUrl);
    return { success: true, url: urlData.publicUrl };
  } catch (error: any) {
    console.error("Error in file upload:", error);
    const errorMessage = error.message || "An unexpected error occurred during upload";
    if (options.onError) options.onError(errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Extracts a filename from a URL
 * @param url The file URL
 * @returns Extracted filename or fallback text
 */
export const getFileNameFromUrl = (url: string | null | undefined): string => {
  if (!url) return "No file uploaded";
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    let fileName = pathParts[pathParts.length - 1];
    
    // Remove timestamp if present
    fileName = fileName.replace(/^.*_\d+\./, '');
    
    // Add file extension back if removed
    if (!fileName.includes('.')) {
      const extension = pathParts[pathParts.length - 1].split('.').pop();
      if (extension) {
        fileName = `${fileName}.${extension}`;
      }
    }
    
    return fileName || "File uploaded";
  } catch (e) {
    return "File uploaded";
  }
};
