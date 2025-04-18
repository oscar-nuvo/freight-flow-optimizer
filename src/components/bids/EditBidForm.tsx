
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBidDocuments } from "@/hooks/useBidDocuments";
import { BidDocumentUploadField } from "./forms/BidDocumentUploadField";
import { useForm } from "react-hook-form";
import { BidFormValues } from "./forms/BidDocumentUploadField";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";

interface EditBidFormProps {
  bid: {
    id: string;
    name: string;
    submission_date?: string;
    start_date?: string;
    rate_duration?: string;
    mode?: string;
    equipment_type?: string;
    instructions?: string;
    contract_file?: string;
  };
  onSuccess?: () => void;
}

export const EditBidForm = ({ bid, onSuccess }: EditBidFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { organization } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    uploadingField,
    uploadError,
    uploadProgress,
    handleFileUpload,
    updateBidDocument,
    removeDocument
  } = useBidDocuments(bid.id, organization?.id);

  const form = useForm<BidFormValues>({
    defaultValues: {
      name: bid.name || "",
      submission_date: bid.submission_date ? new Date(bid.submission_date) : undefined,
      start_date: bid.start_date ? new Date(bid.start_date) : undefined,
      rate_duration: bid.rate_duration || "none",
      mode: bid.mode || "over_the_road",
      equipment_type: bid.equipment_type || "none",
      instructions: bid.instructions || "",
      contract_file: bid.contract_file || "",
    }
  });

  const handleDocumentUpload = async (fieldName: string, file: File) => {
    if (!organization?.id) {
      toast({
        title: "Upload Error",
        description: "Organization not found. Please ensure you're logged in.",
        variant: "destructive",
      });
      return;
    }

    const fileUrl = await handleFileUpload(fieldName, file, {
      maxSizeBytes: 10 * 1024 * 1024,
      allowedTypes: ['.pdf', '.doc', '.docx'],
    });

    if (fileUrl) {
      // Update form state
      form.setValue(fieldName as any, fileUrl);
      
      // Update the database
      await updateBidDocument(bid.id, { [fieldName]: fileUrl });
    }
  };

  const handleRemoveDocument = async (fieldName: string) => {
    const success = await removeDocument(bid.id, fieldName);
    
    if (success) {
      form.setValue(fieldName as any, "");
    }
  };

  const onSubmit = async (values: BidFormValues) => {
    setLoading(true);
    setError(null);

    try {
      if (!organization?.id) {
        throw new Error("Organization not found");
      }

      console.log("Updating bid with data:", {
        id: bid.id,
        org_id: organization.id,
        values
      });

      const updates = {
        name: values.name,
        submission_date: values.submission_date ? new Date(values.submission_date).toISOString() : null,
        start_date: values.start_date ? new Date(values.start_date).toISOString() : null,
        rate_duration: values.rate_duration === "none" ? null : values.rate_duration,
        mode: values.mode,
        equipment_type: values.equipment_type === "none" ? null : values.equipment_type,
        instructions: values.instructions || null,
        contract_file: values.contract_file || null,
        updated_at: new Date().toISOString()
      };

      console.log("Sending updates to Supabase:", updates);

      const { error: updateError } = await supabase
        .from("bids")
        .update(updates)
        .match({ id: bid.id, org_id: organization.id });

      if (updateError) {
        console.error("Update error details:", updateError);
        throw updateError;
      }

      console.log("Bid updated successfully");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error updating bid:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: `Failed to update bid: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Bid Name</FormLabel>
                  <Input {...field} required />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="submission_date"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Last Date to Submit Bids</FormLabel>
                  <Input 
                    type="date" 
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Target Start of Operations</FormLabel>
                  <Input 
                    type="date" 
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rate_duration"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Rate Duration</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select duration</SelectItem>
                      <SelectItem value="1">1 Month</SelectItem>
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Mode</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="over_the_road">Over the Road</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipment_type"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Equipment Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select equipment type</SelectItem>
                      <SelectItem value="dry_van">53' Dry Van</SelectItem>
                      <SelectItem value="reefer">Reefer</SelectItem>
                      <SelectItem value="flatbed">Flatbed</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Instructions for the RFP</FormLabel>
                  <Textarea {...field} rows={4} />
                </FormItem>
              )}
            />

            <BidDocumentUploadField
              form={form}
              fieldName="contract_file"
              label="RFP Contract"
              accept=".pdf,.doc,.docx"
              isUploading={uploadingField === "contract_file"}
              uploadProgress={uploadProgress}
              uploadError={uploadError}
              onUpload={handleDocumentUpload}
              onRemove={handleRemoveDocument}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/bids/${bid.id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
