
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Bid name must have at least 2 characters"),
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
    },
  });

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
      // Use type assertion to tell TypeScript that 'bids' is a valid table
      const { data, error } = await supabase
        .from("bids")
        .insert({
          name: values.name,
          org_id: organization.id,
          status: "draft",
        })
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

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Bid Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewBid;
