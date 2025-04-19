
import { UseFormReturn } from "react-hook-form";
import { FormDescription } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import { DocumentUploadStatus } from "./DocumentUploadStatus";
import { DocumentsList } from "./DocumentsList";

interface DocumentsFormProps {
  form: UseFormReturn<any>;
}

const documentFields = [
  { name: "bank_statement_doc", label: "Bank Statement", accept: ".pdf,.doc,.docx" },
  { name: "cargo_insurance_doc", label: "Cargo Insurance", accept: ".pdf,.doc,.docx" },
  { name: "primary_liability_doc", label: "Primary Liability Insurance", accept: ".pdf,.doc,.docx" },
  { name: "w9_form_doc", label: "W9 Form", accept: ".pdf,.doc,.docx" },
];

export function DocumentsForm({ form }: DocumentsFormProps) {
  const carrierId = form?.getValues()?.id;
  const {
    uploadingField,
    uploadError,
    uploadStatus,
    handleFileUpload,
    handleRemoveDocument
  } = useDocumentUpload(form, carrierId);

  // Safety check if form isn't available
  if (!form) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Form not properly initialized. Please reload the page.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <FormDescription className="text-sm mb-4">
        Upload PDF documents only. Maximum file size: 5MB.
      </FormDescription>

      <DocumentUploadStatus 
        uploadStatus={uploadStatus} 
        carrierId={carrierId} 
      />

      {uploadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <DocumentsList
        form={form}
        documentFields={documentFields}
        uploadingField={uploadingField}
        uploadStatus={uploadStatus}
        onUpload={handleFileUpload}
        onRemove={handleRemoveDocument}
      />

      <FormDescription className="text-sm text-muted-foreground italic">
        Note: All documents are securely stored and can only be accessed by authorized users.
      </FormDescription>
    </div>
  );
}
