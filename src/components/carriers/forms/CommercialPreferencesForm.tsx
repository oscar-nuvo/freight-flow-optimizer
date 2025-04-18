
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CarrierFormValues } from "@/types/carrier";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CommercialPreferencesFormProps {
  form: UseFormReturn<any>;
  onSubmit: (e: React.FormEvent) => void;
}

interface YardLocation {
  city: string;
  state: string;
  country: string;
}

interface Lane {
  origin: string;
  destination: string;
  weekly_volume: number;
}

export function CommercialPreferencesForm({ form, onSubmit }: CommercialPreferencesFormProps) {
  const [newYardLocation, setNewYardLocation] = useState<YardLocation>({
    city: "",
    state: "",
    country: "US",
  });
  
  const [newLane, setNewLane] = useState<Lane>({
    origin: "",
    destination: "",
    weekly_volume: 0,
  });
  
  const [showAddYard, setShowAddYard] = useState(false);
  const [showAddLane, setShowAddLane] = useState(false);
  
  // Get the current yard locations or initialize an empty array
  const yardLocations = form.watch('yard_locations') || [];
  
  // Get the current primary lanes or initialize an empty array
  const primaryLanes = form.watch('primary_lanes') || [];
  
  const addYardLocation = () => {
    if (newYardLocation.city && newYardLocation.state) {
      const updatedLocations = [...yardLocations, newYardLocation];
      form.setValue('yard_locations', updatedLocations);
      
      // Reset the form
      setNewYardLocation({
        city: "",
        state: "",
        country: "US",
      });
      setShowAddYard(false);
    }
  };
  
  const removeYardLocation = (index: number) => {
    const updatedLocations = [...yardLocations];
    updatedLocations.splice(index, 1);
    form.setValue('yard_locations', updatedLocations);
  };
  
  const addLane = () => {
    if (newLane.origin && newLane.destination) {
      const updatedLanes = [...primaryLanes, newLane];
      form.setValue('primary_lanes', updatedLanes);
      
      // Reset the form
      setNewLane({
        origin: "",
        destination: "",
        weekly_volume: 0,
      });
      setShowAddLane(false);
    }
  };
  
  const removeLane = (index: number) => {
    const updatedLanes = [...primaryLanes];
    updatedLanes.splice(index, 1);
    form.setValue('primary_lanes', updatedLanes);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Yard Locations</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setShowAddYard(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
        
        {yardLocations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {yardLocations.map((location: YardLocation, index: number) => (
              <Card key={index}>
                <CardContent className="pt-4 pb-2 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{location.city}, {location.state}</p>
                    <p className="text-sm text-muted-foreground">
                      {location.country === "US" ? "United States" : 
                       location.country === "CA" ? "Canada" : 
                       location.country === "MX" ? "Mexico" : location.country}
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeYardLocation(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No yard locations added yet.</p>
        )}
        
        {showAddYard && (
          <Card className="mt-4">
            <CardContent className="pt-4">
              <h4 className="font-medium mb-3">Add New Yard Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input 
                    value={newYardLocation.city}
                    onChange={(e) => setNewYardLocation({...newYardLocation, city: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">State/Province</label>
                  <Input 
                    value={newYardLocation.state}
                    onChange={(e) => setNewYardLocation({...newYardLocation, state: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Select 
                    value={newYardLocation.country}
                    onValueChange={(value) => setNewYardLocation({...newYardLocation, country: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="MX">Mexico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddYard(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={addYardLocation}
                  disabled={!newYardLocation.city || !newYardLocation.state}
                >
                  Add Location
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Primary Lanes Serviced</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setShowAddLane(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lane
          </Button>
        </div>
        
        {primaryLanes.length > 0 ? (
          <div className="space-y-4">
            {primaryLanes.map((lane: Lane, index: number) => (
              <Card key={index}>
                <CardContent className="pt-4 pb-2 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{lane.origin} to {lane.destination}</p>
                    <p className="text-sm text-muted-foreground">
                      Weekly volume: {lane.weekly_volume} loads
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeLane(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No primary lanes added yet.</p>
        )}
        
        {showAddLane && (
          <Card className="mt-4">
            <CardContent className="pt-4">
              <h4 className="font-medium mb-3">Add New Lane</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">Origin</label>
                  <Input 
                    value={newLane.origin}
                    onChange={(e) => setNewLane({...newLane, origin: e.target.value})}
                    className="mt-1"
                    placeholder="City, State"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Destination</label>
                  <Input 
                    value={newLane.destination}
                    onChange={(e) => setNewLane({...newLane, destination: e.target.value})}
                    className="mt-1"
                    placeholder="City, State"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Weekly Volume</label>
                  <Input 
                    type="number"
                    value={newLane.weekly_volume}
                    onChange={(e) => setNewLane({
                      ...newLane, 
                      weekly_volume: parseInt(e.target.value) || 0
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddLane(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={addLane}
                  disabled={!newLane.origin || !newLane.destination}
                >
                  Add Lane
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Tracking Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tracking_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How do you share tracking information?</FormLabel>
                <FormControl>
                  <Select 
                    value={field.value || ''} 
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tracking method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mirror_account">Mirror Account</SelectItem>
                      <SelectItem value="individual_links">Individual Tracking Links</SelectItem>
                      <SelectItem value="aggregator">An Aggregator</SelectItem>
                      <SelectItem value="no_support">Do not support tracking</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {form.watch('tracking_method') === 'aggregator' && (
            <FormField
              control={form.control}
              name="telematics_provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Which Telematics provider do you use?</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder="e.g., Project 44, Fourkites, Trucker Tools"
                    />
                  </FormControl>
                  <FormDescription>
                    Examples: Project 44, Fourkites, Trucker Tools
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
