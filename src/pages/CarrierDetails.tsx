
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CarrierDetailsForm } from "@/components/carriers/CarrierDetailsForm";
import { getCarrierById, updateCarrier } from "@/services/carriersService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Copy, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CarrierDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [carrier, setCarrier] = useState(null);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadCarrier = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const carrierData = await getCarrierById(id);
        setCarrier(carrierData);
      } catch (err) {
        console.error("Error loading carrier:", err);
        setError("Failed to load carrier details");
      } finally {
        setIsLoading(false);
      }
    };

    loadCarrier();
  }, [id]);

  // Function to generate a new invite token if needed
  const generateInviteLink = async () => {
    if (!carrier || !id) return null;

    try {
      // If there's no invite token yet, generate one
      if (!carrier.invite_token) {
        // Generate a new UUID for the invite token
        const updatedCarrier = await updateCarrier(id, {
          ...carrier,
          invite_token: crypto.randomUUID(),
          invite_sent_at: new Date().toISOString()
        });
        setCarrier(updatedCarrier);
      }

      // Construct the profile URL
      const baseUrl = window.location.origin;
      return `${baseUrl}/carrier-onboarding/${carrier.invite_token || ""}`;
    } catch (error) {
      console.error("Error generating invite link:", error);
      return null;
    }
  };

  // Function to copy the invite link to clipboard
  const copyInviteLink = async () => {
    const link = await generateInviteLink();
    if (!link) {
      toast({
        title: "Error",
        description: "Failed to generate invite link",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      toast({
        title: "Success",
        description: "Invite link copied to clipboard",
      });

      // Reset copy success message after 3 seconds
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Error",
        description: "Failed to copy invite link",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => navigate("/carriers")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Carriers
            </Button>
            <h1 className="text-3xl font-bold">{carrier?.name || "Carrier Details"}</h1>
          </div>
          {carrier && !carrier.profile_completed_at && (
            <Button onClick={copyInviteLink} className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span>Copy Invite Link</span>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => navigate("/carriers")}>Return to Carriers</Button>
              </div>
            </CardContent>
          </Card>
        ) : carrier ? (
          <CarrierDetailsForm carrier={carrier} />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">Carrier not found</p>
                <Button onClick={() => navigate("/carriers")}>Return to Carriers</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CarrierDetails;
