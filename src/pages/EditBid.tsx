
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EditBidForm } from "@/components/bids/EditBidForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const EditBid = () => {
  const { id } = useParams<{ id: string }>();
  const [bid, setBid] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { organization } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id && organization) {
      fetchBid();
    }
  }, [id, organization]);

  const fetchBid = async () => {
    try {
      console.log("Fetching bid with id:", id, "for org:", organization?.id);
      
      if (!organization?.id) {
        throw new Error("Organization not found");
      }

      // Direct approach using match for simple equality conditions
      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .match({ id, org_id: organization.id })
        .maybeSingle();

      if (error) {
        console.error("Fetch error details:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Bid not found");
      }

      console.log("Bid data fetched:", data);
      setBid(data);
    } catch (error: any) {
      console.error("Error fetching bid:", error);
      toast({
        title: "Error",
        description: "Failed to load bid details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!bid) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Bid Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The bid you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate("/bids")}>Back to Bids</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Bid</h1>
        </div>
        <EditBidForm 
          bid={bid} 
          onSuccess={() => {
            toast({
              title: "Success",
              description: "Bid updated successfully"
            });
            navigate(`/bids/${id}`);
          }} 
        />
      </div>
    </DashboardLayout>
  );
};

export default EditBid;
