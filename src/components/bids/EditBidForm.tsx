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
  };
  onSuccess?: () => void;
}

export const EditBidForm = ({ bid, onSuccess }: EditBidFormProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { organization } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: bid.name || "",
    submission_date: bid.submission_date || "",
    start_date: bid.start_date || "",
    rate_duration: bid.rate_duration || "",
    mode: bid.mode || "over_the_road",
    equipment_type: bid.equipment_type || "",
    instructions: bid.instructions || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("bids")
        .update({
          name: formData.name,
          start_date: formData.start_date || null,
        })
        .eq("id", bid.id)
        .eq("org_id", organization?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bid updated successfully",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error updating bid:", error);
      setError("Failed to update bid. Please try again.");
      toast({
        title: "Error",
        description: "Failed to update bid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          <div className="space-y-2">
            <Label htmlFor="name">Bid Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submission_date">Last Date to Submit Bids</Label>
            <Input
              id="submission_date"
              type="date"
              value={formData.submission_date}
              onChange={(e) => handleChange("submission_date", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Note: This field will be stored locally but is not yet supported in the database.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Target Start of Operations</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate_duration">Rate Duration</Label>
            <select
              id="rate_duration"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.rate_duration}
              onChange={(e) => handleChange("rate_duration", e.target.value)}
            >
              <option value="">Select duration</option>
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Note: This field will be stored locally but is not yet supported in the database.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode">Mode</Label>
            <select
              id="mode"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.mode}
              onChange={(e) => handleChange("mode", e.target.value)}
            >
              <option value="over_the_road">Over the Road</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Note: This field will be stored locally but is not yet supported in the database.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment_type">Equipment Type</Label>
            <select
              id="equipment_type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.equipment_type}
              onChange={(e) => handleChange("equipment_type", e.target.value)}
            >
              <option value="">Select equipment type</option>
              <option value="dry_van">53' Dry Van</option>
              <option value="reefer">Reefer</option>
              <option value="flatbed">Flatbed</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Note: This field will be stored locally but is not yet supported in the database.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions for the RFP</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => handleChange("instructions", e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Note: This field will be stored locally but is not yet supported in the database.
            </p>
          </div>
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
  );
};
