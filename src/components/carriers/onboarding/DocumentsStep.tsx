
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { DocumentsForm } from "@/components/carriers/forms/DocumentsForm";
import { UseFormReturn } from "react-hook-form";

interface DocumentsStepProps {
  form: UseFormReturn<any>;
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function DocumentsStep({ form, onComplete, onBack, isSubmitting }: DocumentsStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <DocumentsForm form={form} />
          
          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline"
              onClick={onBack}
            >
              Back to Profile Form
            </Button>
            <Button 
              onClick={onComplete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span> 
                  Completing...
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
