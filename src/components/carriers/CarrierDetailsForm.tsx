import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, User, MapPin, FileText, Truck, FileCheck, Landmark, ReceiptText, Truck as TruckIcon } from "lucide-react";
import { Carrier } from "@/services/carriersService";
import { BasicInfoForm } from "./forms/BasicInfoForm";
import { OperationalDetailsForm } from "./forms/OperationalDetailsForm";
import { FleetDetailsForm } from "./forms/FleetDetailsForm";
import { ComplianceForm } from "./forms/ComplianceForm";
import { ContactInfoForm } from "./forms/ContactInfoForm";
import { BillingInfoForm } from "./forms/BillingInfoForm";
import { CommercialPreferencesForm } from "./forms/CommercialPreferencesForm";

interface CarrierDetailsFormProps {
  carrier: Carrier;
}

export function CarrierDetailsForm({ carrier }: CarrierDetailsFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const navigate = useNavigate();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Carrier Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-8">
            <TabsTrigger value="basic">
              <Building className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="operational">
              <TruckIcon className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Operational</span>
            </TabsTrigger>
            <TabsTrigger value="fleet">
              <Truck className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Fleet</span>
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <FileCheck className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="contact">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="billing">
              <Landmark className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <ReceiptText className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <BasicInfoForm carrier={carrier} onSuccess={() => {}} />
          </TabsContent>
          
          <TabsContent value="operational">
            <OperationalDetailsForm carrier={carrier} />
          </TabsContent>
          
          <TabsContent value="fleet">
            <FleetDetailsForm carrier={carrier} />
          </TabsContent>
          
          <TabsContent value="compliance">
            <ComplianceForm carrier={carrier} />
          </TabsContent>
          
          <TabsContent value="contact">
            <ContactInfoForm carrier={carrier} />
          </TabsContent>
          
          <TabsContent value="billing">
            <BillingInfoForm carrier={carrier} />
          </TabsContent>
          
          <TabsContent value="preferences">
            <CommercialPreferencesForm carrier={carrier} />
          </TabsContent>
          
          <div className="p-4 bg-muted rounded-md mt-6">
            <h3 className="font-medium mb-2">Profile Completion Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created:</p>
                <p>{formatDate(carrier.created_at)}</p>
              </div>
              {carrier.invite_sent_at && (
                <div>
                  <p className="text-muted-foreground">Invite Sent:</p>
                  <p>{formatDate(carrier.invite_sent_at)}</p>
                </div>
              )}
              {carrier.profile_completed_at && (
                <div>
                  <p className="text-muted-foreground">Profile Completed:</p>
                  <p>{formatDate(carrier.profile_completed_at)}</p>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
