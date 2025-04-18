
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, File, Loader2, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { getFileNameFromUrl } from "@/utils/fileUpload";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

export interface BidFormValues {
  id?: string;
  name: string;
  submission_date?: string | Date;
  start_date?: string | Date;
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
  onUpload: (fieldName: string, file: File) => void;
  onRemove: (fieldName: string) => void;
}

export function BidDocumentUploadField({
  form,
  fieldName,
  label,
  accept,
  isUploading,
  onUpload,
  onRemove
}: BidDocumentUploadFieldProps) {
  const uploadProgress = 66; // This will be dynamic in Phase 2

  return (
    <FormField
      control={form.control}
      name={fieldName as keyof BidFormValues}
      render={({ field }) => (
        <FormItem className="flex flex-col space-y-2">
          <FormLabel>{label}</FormLabel>
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
                {isUploading && (
                  <div className="absolute top-full left-0 right-0 mt-1">
                    <Progress value={uploadProgress} className="h-1" />
                  </div>
                )}
              </div>
            </FormControl>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <input
                        type="file"
                        id={`file-upload-${fieldName}`}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        accept={accept}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onUpload(fieldName, file);
                          }
                        }}
                        disabled={isUploading}
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        disabled={isUploading}
                      >
                        {isUploading ? (
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
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload {label.toLowerCase()}</p>
                    <p className="text-xs text-muted-foreground">Accepted formats: {accept}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {field.value && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onRemove(fieldName)}
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
  );
}
