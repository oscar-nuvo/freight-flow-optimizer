
import { useState, useEffect } from "react";
import { Carrier } from "@/services/carriersService";
import { getActiveCarriersForInvitation } from "@/services/invitationsService";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface CarrierSelectionListProps {
  selectedCarriers: Carrier[];
  onChange: (carriers: Carrier[]) => void;
}

export function CarrierSelectionList({ 
  selectedCarriers, 
  onChange 
}: CarrierSelectionListProps) {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [filteredCarriers, setFilteredCarriers] = useState<Carrier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load active carriers
  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        setIsLoading(true);
        const activeCarriers = await getActiveCarriersForInvitation();
        setCarriers(activeCarriers);
        setFilteredCarriers(activeCarriers);
        
        // Auto-select all carriers by default if no selections yet
        if (selectedCarriers.length === 0) {
          onChange(activeCarriers);
        }
      } catch (error) {
        console.error("Failed to load active carriers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarriers();
  }, [onChange]);

  // Filter carriers based on search query
  useEffect(() => {
    const filtered = carriers.filter(carrier => 
      carrier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (carrier.contact_name && carrier.contact_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredCarriers(filtered);
  }, [searchQuery, carriers]);

  // Check if a carrier is selected
  const isSelected = (carrier: Carrier) => {
    return selectedCarriers.some(selected => selected.id === carrier.id);
  };

  // Toggle carrier selection
  const toggleCarrier = (carrier: Carrier) => {
    if (isSelected(carrier)) {
      onChange(selectedCarriers.filter(selected => selected.id !== carrier.id));
    } else {
      onChange([...selectedCarriers, carrier]);
    }
  };

  // Select all carriers
  const selectAll = () => {
    onChange(filteredCarriers);
  };

  // Clear all selections
  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Badge variant="secondary" className="px-2 py-1">
          Only active carriers shown
        </Badge>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectAll}
            disabled={isLoading || filteredCarriers.length === 0}
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAll}
            disabled={isLoading || selectedCarriers.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search carriers..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border rounded">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      ) : filteredCarriers.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">No active carriers found</p>
        </div>
      ) : (
        <div className="max-h-[350px] overflow-y-auto border rounded-md">
          {filteredCarriers.map((carrier) => (
            <div 
              key={carrier.id} 
              className="flex items-center space-x-3 p-3 border-b hover:bg-muted/50 cursor-pointer"
              onClick={() => toggleCarrier(carrier)}
            >
              <Checkbox 
                checked={isSelected(carrier)} 
                onCheckedChange={() => toggleCarrier(carrier)} 
                id={`carrier-${carrier.id}`}
              />
              <div className="flex-1">
                <label 
                  htmlFor={`carrier-${carrier.id}`} 
                  className="font-medium cursor-pointer"
                >
                  {carrier.name}
                </label>
                {carrier.contact_name && (
                  <p className="text-xs text-muted-foreground">
                    Contact: {carrier.contact_name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-2 text-sm text-muted-foreground">
        <span>
          {filteredCarriers.length} active carriers
        </span>
        <span>
          {selectedCarriers.length} selected
        </span>
      </div>
    </div>
  );
}
