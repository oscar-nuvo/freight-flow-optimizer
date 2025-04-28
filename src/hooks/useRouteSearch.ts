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

  const combinedFilters = useCallback(() => {
    const combined: RouteFilters = { ...filters };
    if (debouncedSearchTerm) {
      // Client-side filtering will be handled in processRoutes
    }
    return combined;
  }, [filters, debouncedSearchTerm]);

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

  const processRoutes = useCallback((): Route[] => {
    if (!routesData) return [];

    // The server already converts equipment_type to EquipmentType enum
    const typedRoutes = routesData;

    if (!debouncedSearchTerm) return typedRoutes;
    
    const term = debouncedSearchTerm.toLowerCase();
    return typedRoutes.filter(route => 
      route.origin_city.toLowerCase().includes(term) ||
      route.destination_city.toLowerCase().includes(term) ||
      route.commodity.toLowerCase().includes(term)
    );
  }, [routesData, debouncedSearchTerm]);

  const processedRoutes = processRoutes();

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
