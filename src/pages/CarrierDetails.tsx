
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CarrierDetailsForm } from "@/components/carriers/CarrierDetailsForm";
import { getCarrierById } from "@/services/carriersService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

const CarrierDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [carrier, setCarrier] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
