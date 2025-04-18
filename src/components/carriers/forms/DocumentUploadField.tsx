
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, File, Loader2, Trash2 } from "lucide-react";
import { getFileNameFromUrl } from "@/utils/fileUpload";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface DocumentUploadFieldProps {
  fieldName: string;
  label: string;
  accept: string;
  isUploading: boolean;
  value: string | null;
  onUpload: (fieldName: string, file: File) => void;
  onRemove: (fieldName: string) => void;
  uploadProgress?: number;
}

export function DocumentUploadField({
  fieldName,
  label,
  accept,
  isUploading,
  value,
  onUpload,
  onRemove,
  uploadProgress = 0
}: DocumentUploadFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <Input 
            type="text"
            className="flex-1 pr-24"
            placeholder="No file uploaded" 
            readOnly 
            value={value ? getFileNameFromUrl(value) : ""}
          />
          {isUploading && (
            <div className="absolute top-full left-0 right-0 mt-1">
              <Progress value={uploadProgress} className="h-1" />
            </div>
          )}
        </div>
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
                    ) : value ? (
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

          {value && (
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
      {value && (
        <div className="text-xs text-blue-600 hover:underline">
          <a href={value} target="_blank" rel="noopener noreferrer">
            View Document
          </a>
        </div>
      )}
    </div>
  );
}
