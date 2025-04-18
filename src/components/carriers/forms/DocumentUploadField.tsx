
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Paperclip, X, Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DocumentUploadFieldProps {
  form: UseFormReturn<any>;
  fieldName: string;
  label: string;
  accept: string;
  isUploading: boolean;
  onUpload: (fieldName: string, file: File) => void;
  onRemove: (fieldName: string) => void;
  status?: string; // Added status prop as optional
}

export function DocumentUploadField({
  form,
  fieldName,
  label,
  accept,
  isUploading,
  onUpload,
  onRemove,
  status
}: DocumentUploadFieldProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileUrl = form.watch(fieldName);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = (file: File) => {
    onUpload(fieldName, file);
  };
  
  const handleRemoveFile = () => {
    onRemove(fieldName);
  };
  
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      
      {fileUrl ? (
        <Card className="border border-green-200 bg-green-50">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium">Document uploaded</p>
                <p className="text-xs text-muted-foreground truncate max-w-xs">
                  {fileUrl.split('/').pop()}
                </p>
                {status && (
                  <p className="text-xs text-green-600">{status}</p>
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/20"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Uploading document...</p>
            </div>
          ) : (
            <>
              <Paperclip className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm mb-2">
                Drag & drop your document here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supported formats: {accept.replace(/\./g, "").toUpperCase()}
              </p>
              {status && (
                <p className="text-xs text-muted-foreground mb-2">{status}</p>
              )}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = accept;
                    input.onchange = (e: any) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    };
                    input.click();
                  }}
                >
                  Browse files
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </FormItem>
  );
}
