
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function CompletedState() {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Profile Completed</h3>
          <p className="text-muted-foreground mb-6">
            Thank you for completing your carrier profile. You can now close this page.
          </p>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </CardContent>
    </Card>
  );
}
