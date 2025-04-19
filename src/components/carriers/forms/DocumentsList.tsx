
import { UseFormReturn } from "react-hook-form";
import { DocumentUploadField } from "./DocumentUploadField";

interface DocumentsListProps {
  form: UseFormReturn<any>;
  documentFields: Array<{
    name: string;
    label: string;
    accept: string;
  }>;
  uploadingField: string | null;
  uploadStatus: Record<string, string>;
  onUpload: (fieldName: string, file: File) => void;
  onRemove: (fieldName: string) => void;
}

export function DocumentsList({
  form,
  documentFields,
  uploadingField,
  uploadStatus,
  onUpload,
  onRemove
}: DocumentsListProps) {
  // Safety check to ensure form is properly initialized
  if (!form || typeof form.watch !== 'function') {
    console.error("Form not properly initialized in DocumentsList");
    return (
      <div className="p-4 text-center text-red-500">
        Form not properly initialized. Please reload the page.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {documentFields.map((doc) => (
        <DocumentUploadField
          key={doc.name}
          form={form}
          fieldName={doc.name}
          label={doc.label}
          accept={doc.accept}
          isUploading={uploadingField === doc.name}
          onUpload={onUpload}
          onRemove={onRemove}
          status={uploadStatus[doc.name] || ""}
        />
      ))}
    </div>
  );
}
