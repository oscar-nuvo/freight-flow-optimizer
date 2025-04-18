
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { updateCarrier } from "@/services/carriersService";
import { DocumentUploadField } from "./DocumentUploadField";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useToast } from "@/hooks/use-toast";
import type { Carrier } from "@/services/carriersService";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

interface DocumentsFormProps {
  carrier: Carrier;
}

export function DocumentsForm({ carrier }: DocumentsFormProps) {
  const { toast } = useToast();
  const [activeField, setActiveField] = useState<string | null>(null);
  const [documents, setDocuments] = useState({
    w9_form_doc: carrier.w9_form_doc || null,
    cargo_insurance_doc: carrier.cargo_insurance_doc || null,
    primary_liability_doc: carrier.primary_liability_doc || null,
    bank_statement_doc: carrier.bank_statement_doc || null,
  });
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{ field: string; file: File } | null>(null);
  const { uploadFile, loading: isUploading, error: uploadError } = useFileUpload("carrier_documents");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Simulate upload progress
  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);
    
    return () => clearInterval(interval);
  };

  const documentFields = [
    {
      name: "w9_form_doc",
      label: "W9 Form",
      accept: ".pdf,.doc,.docx",
    },
    {
      name: "cargo_insurance_doc",
      label: "Cargo Insurance",
      accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    },
    {
      name: "primary_liability_doc",
      label: "Primary Liability Insurance",
      accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    },
    {
      name: "bank_statement_doc",
      label: "Bank Statement",
      accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    },
  ];

  const handleUpload = async (fieldName: string, file: File) => {
    // If there's already a document, show confirmation dialog
    if (documents[fieldName as keyof typeof documents]) {
      setPendingUpload({ field: fieldName, file });
      setShowReplaceDialog(true);
      return;
    }
    
    await processUpload(fieldName, file);
  };

  const processUpload = async (fieldName: string, file: File) => {
    setActiveField(fieldName);
    // Start progress simulation
    const stopProgress = simulateProgress();
    
    try {
      const uploadPath = `carriers/${carrier.id}/${fieldName}/${file.name}`;
      const fileUrl = await uploadFile(file, uploadPath);
      
      if (fileUrl) {
        // Complete progress
        setUploadProgress(100);
        
        // Update local state
        setDocuments(prev => ({
          ...prev,
          [fieldName]: fileUrl.url
        }));
        
        // Update database
        await updateCarrier(carrier.id, {
          [fieldName]: fileUrl.url
        });
        
        toast({
          title: "Success",
          description: "Document uploaded successfully",
        });
      }
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      // Stop progress simulation
      stopProgress();
      // Reset after a short delay to show 100% completion
      setTimeout(() => {
        setActiveField(null);
        setPendingUpload(null);
        setShowReplaceDialog(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleRemove = async (fieldName: string) => {
    try {
      // Update local state
      setDocuments(prev => ({
        ...prev,
        [fieldName]: null
      }));
      
      // Update database
      await updateCarrier(carrier.id, {
        [fieldName]: null
      });
      
      toast({
        title: "Success",
        description: "Document removed successfully",
      });
    } catch (error: any) {
      console.error("Error removing document:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove document",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4">
          {documentFields.map((field) => (
            <DocumentUploadField
              key={field.name}
              fieldName={field.name}
              label={field.label}
              accept={field.accept}
              value={documents[field.name as keyof typeof documents]}
              isUploading={isUploading && activeField === field.name}
              onUpload={handleUpload}
              onRemove={handleRemove}
              uploadProgress={uploadProgress}
            />
          ))}
        </div>
      </CardContent>

      <AlertDialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace Document?</AlertDialogTitle>
            <AlertDialogDescription>
              A document is already uploaded. Do you want to replace it with the new one?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setPendingUpload(null);
              setShowReplaceDialog(false);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (pendingUpload) {
                processUpload(pendingUpload.field, pendingUpload.file);
              }
            }}>
              Replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
