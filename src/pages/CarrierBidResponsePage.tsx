
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInvitationByToken } from "@/services/invitationsService";
import { getRoutesByBid } from "@/services/routesService";
import { Route } from "@/types/route";
import { CarrierInvitation } from "@/types/invitation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const CarrierBidResponsePage = () => {
  const { token } = useParams<{ token: string }>();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [invitation, setInvitation] = useState<CarrierInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvitationAndRoutes = async () => {
      try {
        if (!token) {
          setError("Invalid invitation link");
          setLoading(false);
          return;
        }

        // Load invitation by token
        const invitationData = await getInvitationByToken(token);
        
        if (!invitationData) {
          setError("Invalid invitation. The link you used may be expired or incorrect.");
          setLoading(false);
          return;
        }

        setInvitation(invitationData);

        // Load routes associated with the bid
        const routesData = await getRoutesByBid(invitationData.bid_id);
        setRoutes(routesData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading invitation data:", err);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };

    loadInvitationAndRoutes();
  }, [token]);

  if (loading) {
    return <div className="container my-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container my-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="container my-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Routes</AlertTitle>
          <AlertDescription>
            There are no routes associated with this bid for you to review.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container my-8">
      <h1 className="text-2xl font-bold mb-6">Bid Response</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <Card key={route.id}>
            <CardHeader>
              <CardTitle>
                {route.origin_city} to {route.destination_city}
              </CardTitle>
              <CardDescription>{route.equipment_type}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2"><span className="font-medium">Commodity:</span> {route.commodity}</p>
              <p className="mb-2"><span className="font-medium">Weekly Volume:</span> {route.weekly_volume}</p>
              {route.distance && <p><span className="font-medium">Distance:</span> {route.distance} miles</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CarrierBidResponsePage;
