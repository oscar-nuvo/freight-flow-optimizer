
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBidDocuments } from "./useBidDocuments";

export const useBidForm = (orgId?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    uploadingField,
    uploadError,
    uploadProgress,
    handleFileUpload,
  } = useBidDocuments(undefined, orgId);

  const handleDocumentUpload = async (fieldName: string, file: File, tempBidId: string) => {
    if (!orgId) {
      toast({
        title: "Upload Error",
        description: "Organization not found. Please ensure you're logged in.",
        variant: "destructive",
      });
      return null;
    }

    return handleFileUpload(fieldName, file, {
      maxSizeBytes: 10 * 1024 * 1024,
      allowedTypes: ['.pdf', '.doc', '.docx'],
    });
  };

  const submitBid = async (values: any) => {
    if (!orgId) {
      toast({
        title: "Error",
        description: "You must be part of an organization to create a bid",
        variant: "destructive",
      });
      return null;
    }

    setIsSubmitting(true);
    try {
      // Prepare bid data
      const bidData = {
        name: values.name,
        org_id: orgId,
        status: "draft",
        submission_date: values.submission_date ? values.submission_date.toISOString() : null,
        start_date: values.start_date ? values.start_date.toISOString() : null,
        rate_duration: values.rate_duration,
        mode: values.mode,
        equipment_type: values.equipment_type,
        instructions: values.instructions,
        contract_file: values.contract_file,
      };

      // Insert bid into database
      const { data, error } = await supabase
        .from("bids")
        .insert(bidData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bid created successfully!",
      });

      navigate(`/bids/${data.id}`);
      return data.id;
    } catch (error: any) {
      console.error("Error creating bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create bid",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    uploadingField,
    uploadError,
    uploadProgress,
    handleDocumentUpload,
    submitBid
  };
};
