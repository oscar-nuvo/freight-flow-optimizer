
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EquipmentType, RouteFilters } from "@/types/route";

interface RoutesFilterProps {
  filters: RouteFilters;
  onFilterChange: (filters: RouteFilters) => void;
}

export function RoutesFilter({ filters, onFilterChange }: RoutesFilterProps) {
  const [tempFilters, setTempFilters] = useState<RouteFilters>(filters);
  const equipmentTypes: EquipmentType[] = ["Dry Van", "Reefer", "Flatbed"];

  const handleInputChange = (key: keyof RouteFilters, value: string) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectChange = (value: EquipmentType | undefined) => {
    setTempFilters(prev => ({ ...prev, equipment_type: value }));
  };

  const handleApplyFilters = () => {
    onFilterChange(tempFilters);
  };

  const handleResetFilters = () => {
    const emptyFilters: RouteFilters = {};
    setTempFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <Card>
      <CardHeader className="px-6 py-4">
        <CardTitle className="text-lg">Route Search</CardTitle>
        <CardDescription>
          Search for specific routes or filter by criteria
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder="Origin city"
            value={tempFilters.origin_city || ""}
            onChange={(e) => handleInputChange('origin_city', e.target.value)}
          />
        </div>
        <div>
          <Input
            placeholder="Destination city"
            value={tempFilters.destination_city || ""}
            onChange={(e) => handleInputChange('destination_city', e.target.value)}
          />
        </div>
        <div>
          <Select
            value={tempFilters.equipment_type}
            onValueChange={(value) => handleSelectChange(value as EquipmentType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Equipment Type" />
            </SelectTrigger>
            <SelectContent>
              {equipmentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="flex gap-2">
            <Button
              variant="default"
              className="flex-1"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
