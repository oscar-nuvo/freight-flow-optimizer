
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ResponderInfoFormProps {
  initialValues: {
    name: string;
    email: string;
  };
  onChange: (values: { name: string; email: string }) => void;
}

export function ResponderInfoForm({ initialValues, onChange }: ResponderInfoFormProps) {
  const [name, setName] = useState(initialValues.name || "");
  const [email, setEmail] = useState(initialValues.email || "");
  
  useEffect(() => {
    setName(initialValues.name || "");
    setEmail(initialValues.email || "");
  }, [initialValues]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    onChange({ name: newName, email });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    onChange({ name, email: newEmail });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Your Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="responder-name">Your Name <span className="text-red-500">*</span></Label>
            <Input
              id="responder-name"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responder-email">Your Email <span className="text-red-500">*</span></Label>
            <Input
              id="responder-email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResponderInfoForm;
