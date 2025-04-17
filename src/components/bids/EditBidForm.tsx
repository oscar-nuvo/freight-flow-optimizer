
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
      if (!organization?.id) {
        throw new Error("Organization not found");
      }

      // Direct update without relying on org_memberships table
      const { error: updateError } = await supabase
        .from("bids")
        .update({
          name: formData.name,
          start_date: formData.start_date || null,
          submission_date: formData.submission_date || null,
          rate_duration: formData.rate_duration || null,
          mode: formData.mode,
          equipment_type: formData.equipment_type || null,
          instructions: formData.instructions || null,
        })
        .eq("id", bid.id)
        .eq("org_id", organization.id);

      if (updateError) {
        console.error("Error updating bid:", updateError);
        throw new Error(updateError.message);
      }

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
                <SelectItem value="placeholder" disabled>Select duration</SelectItem>
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
                <SelectItem value="placeholder" disabled>Select equipment type</SelectItem>
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
              value={formData.instructions || ""}
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
