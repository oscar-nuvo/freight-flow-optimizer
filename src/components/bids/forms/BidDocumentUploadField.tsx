
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, File, Loader2, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { getFileNameFromUrl } from "@/utils/fileUpload";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useRef } from "react";

export interface BidFormValues {
  id?: string;
  name: string;
  submission_date?: Date | string;
  start_date?: Date | string;
  rate_duration?: string;
  mode?: string;
  equipment_type?: string;
  instructions?: string;
  contract_file?: string;
}

interface BidDocumentUploadFieldProps {
  form: UseFormReturn<BidFormValues>;
  fieldName: string;
  label: string;
  accept: string;
  isUploading: boolean;
  uploadProgress?: number;
  uploadError?: string | null;
  onUpload: (fieldName: string, file: File) => void;
  onRemove: (fieldName: string) => void;
}

export function BidDocumentUploadField({
  form,
  fieldName,
  label,
  accept,
  isUploading,
  uploadProgress = 0,
  uploadError,
  onUpload,
  onRemove
}: BidDocumentUploadFieldProps) {
  const value = form.watch(fieldName as keyof BidFormValues);
  const hasFile = Boolean(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    // Programmatically click the hidden file input
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(fieldName, file);
      // Clear the input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  return (
    <FormField
      control={form.control}
      name={fieldName as keyof BidFormValues}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-2">
          <FormLabel>{label}</FormLabel>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FormControl>
                <div className="relative w-full">
                  <Input 
                    type="text"
                    className="flex-1 pr-24"
                    placeholder="No file uploaded" 
                    readOnly 
                    value={field.value ? getFileNameFromUrl(String(field.value)) : ""}
                  />
                </div>
              </FormControl>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline"
                        disabled={isUploading}
                        onClick={handleButtonClick}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : hasFile ? (
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload {label.toLowerCase()}</p>
                      <p className="text-xs text-muted-foreground">Accepted formats: {accept}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Hidden file input, controlled by button click */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept={accept}
                  onChange={handleFileChange}
                  disabled={isUploading}
                />

                {hasFile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onRemove(fieldName)}
                        disabled={isUploading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove document</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-1" />
                <p className="text-xs text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {uploadError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {hasFile && !isUploading && !uploadError && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Document uploaded successfully</span>
              </div>
            )}

            {field.value && (
              <div className="text-xs text-blue-600 hover:underline">
                <a href={String(field.value)} target="_blank" rel="noopener noreferrer">
                  View Document
                </a>
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
