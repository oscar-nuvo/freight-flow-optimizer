
import { useState, useEffect } from "react";
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
import { Search, Filter, X } from "lucide-react";

interface EnhancedRoutesFilterProps {
  filters: RouteFilters;
  onFilterChange: (filters: RouteFilters) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isSearching: boolean;
  resultsCount: number;
}

export function EnhancedRoutesFilter({ 
  filters, 
  onFilterChange,
  searchTerm,
  onSearchChange,
  isSearching,
  resultsCount
}: EnhancedRoutesFilterProps) {
  const [tempFilters, setTempFilters] = useState<RouteFilters>(filters);
  const [hasFiltersApplied, setHasFiltersApplied] = useState(false);
  const equipmentTypes: EquipmentType[] = ["Dry Van", "Reefer", "Flatbed"];

  useEffect(() => {
    // Check if any filters are applied
    setHasFiltersApplied(
      !!tempFilters.origin_city || 
      !!tempFilters.destination_city || 
      !!tempFilters.equipment_type
    );
  }, [tempFilters]);

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
    onSearchChange("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleClearSearch = () => {
    onSearchChange("");
  };

  return (
    <Card>
      <CardHeader className="px-6 py-4">
        <CardTitle className="text-lg">Route Search</CardTitle>
        <CardDescription>
          Search for specific routes or filter by criteria
          {resultsCount > 0 && (
            <span className="ml-2 text-sm font-medium">
              ({resultsCount} {resultsCount === 1 ? 'result' : 'results'} found)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search origin, destination, or commodity..."
            className="pl-9 pr-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-1 top-1 h-8 w-8 p-0" 
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                disabled={isSearching}
              >
                {isSearching ? "Searching..." : "Apply Filters"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleResetFilters}
                disabled={isSearching || (!hasFiltersApplied && !searchTerm)}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
