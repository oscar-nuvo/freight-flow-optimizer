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
    rate_duration: bid.rate_duration || "none",
    mode: bid.mode || "over_the_road",
    equipment_type: bid.equipment_type || "none",
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
      if (!organization?.id) {
        throw new Error("Organization not found");
      }

      console.log("Updating bid with data:", {
        id: bid.id,
        org_id: organization.id,
        formData
      });

      const updates = {
        name: formData.name,
        submission_date: formData.submission_date || null,
        start_date: formData.start_date || null,
        rate_duration: formData.rate_duration === "none" ? null : formData.rate_duration,
        mode: formData.mode,
        equipment_type: formData.equipment_type === "none" ? null : formData.equipment_type,
        instructions: formData.instructions || null,
        updated_at: new Date().toISOString()
      };

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
            <Select
              value={formData.rate_duration}
              onValueChange={(value) => handleChange("rate_duration", value)}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode">Mode</Label>
            <Select
              value={formData.mode}
              onValueChange={(value) => handleChange("mode", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="over_the_road">Over the Road</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment_type">Equipment Type</Label>
            <Select
              value={formData.equipment_type}
              onValueChange={(value) => handleChange("equipment_type", value)}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions for the RFP</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => handleChange("instructions", e.target.value)}
              rows={4}
            />
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
