
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormDescription } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { DocumentConfirmDialog } from "./DocumentConfirmDialog";
import { DocumentUploadField } from "./DocumentUploadField";
import { AlertTriangle, Info } from "lucide-react";
import { updateCarrier } from "@/services/carriersService";

// Using the correct type from CarrierOnboardingForm
interface DocumentsFormProps {
  form: UseFormReturn<any>;
}

export function DocumentsForm({ form }: DocumentsFormProps) {
  const { toast } = useToast();
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{ field: string; file: File } | null>(null);
  const { uploadFile, loading: uploading } = useFileUpload("carrier_documents");
  const carrierId = form.getValues().id;

  const documentFields = [
    { name: "bank_statement_doc", label: "Bank Statement", accept: ".pdf,.doc,.docx" },
    { name: "cargo_insurance_doc", label: "Cargo Insurance", accept: ".pdf,.doc,.docx" },
    { name: "primary_liability_doc", label: "Primary Liability Insurance", accept: ".pdf,.doc,.docx" },
    { name: "w9_form_doc", label: "W9 Form", accept: ".pdf,.doc,.docx" },
  ];
  
  // Check initial document status
  useEffect(() => {
    const values = form.getValues();
    console.log("Initial document values:", values);
    
    // Check which documents already exist
    documentFields.forEach(doc => {
      const docValue = values[doc.name];
      if (docValue) {
        setUploadStatus(prev => ({
          ...prev,
          [doc.name]: "Existing document found"
        }));
        console.log(`${doc.label} already exists:`, docValue);
      }
    });
  }, []);

  const handleFileUpload = async (fieldName: string, file: File) => {
    const existingFile = form.getValues()[fieldName];
    if (existingFile) {
      setPendingUpload({ field: fieldName, file });
      setShowReplaceDialog(true);
      return;
    }

    await uploadDocument(fieldName, file);
  };

  const uploadDocument = async (fieldName: string, file: File) => {
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
      console.log(`Uploading ${fieldName}:`, file.name);
      
      const result = await uploadFile(
        file,
        `${carrierId}/${fieldName.replace(/_doc$/, "")}`,
        {
          maxSizeBytes: 5 * 1024 * 1024,
          allowedTypes: ['.pdf', '.doc', '.docx'],
        }
      );

      if (result?.url) {
        console.log(`${fieldName} uploaded successfully:`, result.url);
        
        // Update the form field
        form.setValue(fieldName, result.url, {
          shouldDirty: true,
          shouldValidate: true,
        });

        setUploadStatus(prev => ({
          ...prev,
          [fieldName]: "Upload successful"
        }));

        // Update the carrier record in the database
        const updates = { [fieldName]: result.url };
        await updateCarrier(carrierId, updates);

        toast({
          title: "Document uploaded",
          description: `${documentFields.find(doc => doc.name === fieldName)?.label} has been uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error("Error in document upload handler:", error);
      const errorMsg = error.message || "Failed to upload document";
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

  const handleConfirmReplace = async () => {
    if (pendingUpload) {
      await uploadDocument(pendingUpload.field, pendingUpload.file);
    }
    setShowReplaceDialog(false);
    setPendingUpload(null);
  };

  const handleRemoveDocument = async (fieldName: string) => {
    try {
      console.log(`Removing ${fieldName}`);
      
      // Update the form field
      form.setValue(fieldName, "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      setUploadStatus(prev => ({
        ...prev,
        [fieldName]: "Document removed"
      }));

      // Update the carrier record in the database
      const updates = { [fieldName]: null };
      await updateCarrier(carrierId, updates);

      toast({
        title: "Document removed",
        description: `${documentFields.find(doc => doc.name === fieldName)?.label} has been removed.`,
      });
    } catch (error) {
      console.error("Error removing document:", error);
      toast({
        title: "Error",
        description: `Failed to remove document: ${error.message || "Please try again"}`,
        variant: "destructive",
      });
    }
  };

  // Debug function to show document status
  const getDocumentStatusSummary = () => {
    const values = form.getValues();
    return documentFields.map(doc => 
      `${doc.label}: ${values[doc.name] ? "✅" : "❌"}`
    ).join(", ");
  };

  return (
    <div className="space-y-6">
      <FormDescription className="text-sm mb-4">
        Upload PDF documents only. Maximum file size: 5MB.
      </FormDescription>

      {process.env.NODE_ENV === 'development' && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <p>Document Status: {getDocumentStatusSummary()}</p>
            <p>Carrier ID: {carrierId || "Not available"}</p>
          </AlertDescription>
        </Alert>
      )}

      {uploadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {documentFields.map((doc) => (
          <DocumentUploadField
            key={doc.name}
            form={form}
            fieldName={doc.name}
            label={doc.label}
            accept={doc.accept}
            isUploading={uploadingField === doc.name}
            onUpload={handleFileUpload}
            onRemove={handleRemoveDocument}
            status={uploadStatus[doc.name]}
          />
        ))}
      </div>

      <DocumentConfirmDialog
        isOpen={showReplaceDialog}
        onClose={() => {
          setShowReplaceDialog(false);
          setPendingUpload(null);
        }}
        onConfirm={handleConfirmReplace}
        title="Replace Document"
        description="Are you sure you want to replace the existing document? This action cannot be undone."
        actionLabel="Replace"
      />

      <FormDescription className="text-sm text-muted-foreground italic">
        Note: All documents are securely stored and can only be accessed by authorized users.
      </FormDescription>
    </div>
  );
}
