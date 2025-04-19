
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  error: string;
  isCompleted?: boolean;
}

export function ErrorState({ error, isCompleted = false }: ErrorStateProps) {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {isCompleted ? "Profile Already Completed" : "Error"}
          </h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </CardContent>
    </Card>
  );
}
