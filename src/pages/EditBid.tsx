
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EditBidForm } from "@/components/bids/EditBidForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("id", id)
        .eq("org_id", organization?.id)
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error("Bid not found");
      }

      // Check if bid can be edited
      if (!["draft", "published", "paused"].includes(data.status)) {
        toast({
          title: "Cannot Edit Bid",
          description: "This bid cannot be edited in its current status.",
          variant: "destructive",
        });
        navigate(`/bids/${id}`);
        return;
      }

      setBid(data);
    } catch (error: any) {
      console.error("Error fetching bid:", error);
      toast({
        title: "Error",
        description: "Failed to load bid details. Please try again.",
        variant: "destructive",
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
        
        <Alert variant="info" className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            Note: Some fields in this form are visual only and will not be saved to the database yet. Only the Bid Name and Start Date will be updated.
          </AlertDescription>
        </Alert>
        
        <EditBidForm
          bid={bid}
          onSuccess={() => {
            navigate(`/bids/${id}`);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default EditBid;
