import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { BidDocumentUploadField } from "@/components/bids/forms/BidDocumentUploadField";
import { useBidDocuments } from "@/hooks/useBidDocuments";

const formSchema = z.object({
  name: z.string().min(2, "Bid name must have at least 2 characters"),
  submission_date: z.date().optional(),
  start_date: z.date().optional(),
  rate_duration: z.enum(["1", "3", "6", "12"]).default("3"),
  mode: z.enum(["over_the_road"]).default("over_the_road"),
  equipment_type: z.enum(["dry_van", "reefer", "flatbed"]).default("dry_van"),
  instructions: z.string().optional(),
  contract_file: z.string().optional(),
});

const NewBid = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { organization } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      rate_duration: "3",
      mode: "over_the_road",
      equipment_type: "dry_van",
      instructions: "",
    },
  });

  const tempBidId = 'new';
  const {
    uploadingField,
    uploadError,
    uploadProgress,
    handleFileUpload,
    removeDocument
  } = useBidDocuments(tempBidId, organization?.id);

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
      form.setValue(fieldName as any, fileUrl);
    }
  };

  const handleRemoveDocument = async (fieldName: string) => {
    form.setValue(fieldName as any, "");
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!organization?.id) {
      toast({
        title: "Error",
        description: "You must be part of an organization to create a bid",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const bidData = {
        name: values.name,
        org_id: organization.id,
        status: "draft",
        submission_date: values.submission_date ? values.submission_date.toISOString() : null,
        start_date: values.start_date ? values.start_date.toISOString() : null,
        rate_duration: values.rate_duration,
        mode: values.mode,
        equipment_type: values.equipment_type,
        instructions: values.instructions,
        contract_file: values.contract_file,
      };

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
    } catch (error: any) {
      console.error("Error creating bid:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create bid",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const rateDurationOptions = [
    { value: "1", label: "1 Month" },
    { value: "3", label: "3 Months" },
    { value: "6", label: "6 Months" },
    { value: "12", label: "12 Months" },
  ];

  const equipmentTypeOptions = [
    { value: "dry_van", label: "53' Dry Van" },
    { value: "reefer", label: "Reefer" },
    { value: "flatbed", label: "Flatbed" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => navigate("/bids")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Create New Bid</h1>
        </div>

        {organization?.subscription_status === "free" && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertDescription className="text-amber-800">
              Upgrade to Premium and unlock unlimited bid creation with advanced features!
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bid Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bid Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Q2 NA Truckload RFP" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="submission_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Last Date to Submit Bids</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Select date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Target Start of Operations</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Select date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="rate_duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate Duration</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rate duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {rateDurationOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mode</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={true} // Only one option for now
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="over_the_road">Over the Road</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          More options coming soon
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="equipment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipment Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select equipment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {equipmentTypeOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions for the RFP</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Include any specific instructions for carriers participating in this RFP..."
                          className="min-h-[150px]"
                        />
                      </FormControl>
                      <FormMessage />
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

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/bids")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Bid"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default NewBid;
