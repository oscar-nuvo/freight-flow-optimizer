
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRoutes } from "@/services/routesService";
import { Route, RouteFilters, EquipmentType } from "@/types/route";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/use-toast";

export function useRouteSearch() {
  const [filters, setFilters] = useState<RouteFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();

  // Combine all filters including search term for the query
  const combinedFilters = useCallback(() => {
    const combined: RouteFilters = { ...filters };
    if (debouncedSearchTerm) {
      // We'll handle the search term in the UI for now,
      // but in future could be moved to a server-side search
    }
    return combined;
  }, [filters, debouncedSearchTerm]);

  // Main routes query with error handling
  const {
    data: routesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["routes", combinedFilters()],
    queryFn: () => {
      setIsSearching(true);
      return getRoutes(combinedFilters());
    },
  });

  // Process routes data and apply client-side filtering
  const processRoutes = useCallback((): Route[] => {
    if (!routesData) return [];

    // Cast equipment_type to EquipmentType enum
    const typedRoutes = routesData.map(route => ({
      ...route,
      equipment_type: route.equipment_type as EquipmentType
    }));

    // Apply client-side filtering for the search term
    if (!debouncedSearchTerm) return typedRoutes;
    
    const term = debouncedSearchTerm.toLowerCase();
    return typedRoutes.filter(route => 
      route.origin_city.toLowerCase().includes(term) ||
      route.destination_city.toLowerCase().includes(term) ||
      route.commodity.toLowerCase().includes(term)
    );
  }, [routesData, debouncedSearchTerm]);

  // Get the processed routes
  const processedRoutes = processRoutes();

  // Handle error notifications
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Search Error",
        description: error instanceof Error ? error.message : "Failed to fetch routes",
        variant: "destructive",
      });
    }
    setIsSearching(false);
  }, [isError, error, toast]);

  useEffect(() => {
    setIsSearching(false);
  }, [routesData]);

  return {
    routes: processedRoutes,
    isLoading,
    isSearching,
    isError,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    refetch,
    resultsCount: processedRoutes?.length || 0
  };
}
