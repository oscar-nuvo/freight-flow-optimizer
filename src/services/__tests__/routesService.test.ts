
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as routesService from "../routesService";
import { supabase } from "@/integrations/supabase/client";
import { Route } from "@/types/route";

vi.mock("@/integrations/supabase/client");

describe("getRoutesByBid", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns filtered, mapped, not-deleted routes for a bid", async () => {
    // Mock the bid org_id lookup first
    vi.spyOn(supabase, "from").mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { org_id: "orgA" },
        error: null
      })
    } as any));
    
    const mockData = [
      {
        routes: {
          id: "route-1",
          is_deleted: false,
          origin_city: "Dallas",
          destination_city: "Houston",
          equipment_type: "reefer",
          commodity: "Flowers",
          weekly_volume: 4,
          distance: 240,
          organization_id: "orgA",
          created_at: "2024-06-12T12:10:00Z",
          updated_at: "2024-06-12T12:10:00Z",
          route_bids: [{ bid_id: "bid1" }],
        }
      },
      {
        routes: {
          id: "route-2",
          is_deleted: true,
          origin_city: "Austin",
          destination_city: "San Antonio",
          equipment_type: "Dry Van",
          commodity: "Beverages",
          weekly_volume: 7,
          distance: 100,
          organization_id: "orgA",
          created_at: "2024-06-12T12:20:00Z",
          updated_at: "2024-06-12T12:20:00Z",
          route_bids: [{ bid_id: "bid1" }],
        }
      }
    ];

    // Mock the route_bids query
    vi.spyOn(supabase, "from").mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: mockData,
        error: null
      })
    } as any));

    // Now call the function and check output
    const bidId = "bid1";
    const routes = await routesService.getRoutesByBid(bidId);
    
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBe(1);
    expect(routes[0].id).toBe("route-1");
    expect(routes[0].equipment_type).toBe("Reefer");
    expect(routes[0].origin_city).toBe("Dallas");
    expect(routes[0].route_bids?.length).toBe(1);
  });

  it("returns empty array if no data present", async () => {
    // Mock the bid org_id lookup
    vi.spyOn(supabase, "from").mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { org_id: "orgA" },
        error: null
      })
    } as any));
    
    // Mock empty route_bids response
    vi.spyOn(supabase, "from").mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [],
        error: null
      })
    } as any));

    const routes = await routesService.getRoutesByBid("non-existent");
    expect(routes).toEqual([]);
  });

  it("throws with error if supabase returns error", async () => {
    // Mock bid org_id lookup error
    vi.spyOn(supabase, "from").mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Supabase error", code: "400" }
      })
    } as any));

    await expect(routesService.getRoutesByBid("fail-bid")).rejects.toThrow("Failed to validate bid");
  });

  it("handles and logs invalid or unknown equipment_type gracefully", async () => {
    // Mock the bid org_id lookup
    vi.spyOn(supabase, "from").mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { org_id: "orgA" },
        error: null
      })
    } as any));
    
    const mockData = [
      {
        routes: {
          id: "r-unknown",
          is_deleted: false,
          equipment_type: "Spaceship",
          origin_city: "X",
          destination_city: "Y",
          commodity: "frozen pizza",
          weekly_volume: 1,
          distance: 999,
          organization_id: "org-unknown",
          created_at: "",
          updated_at: "",
          route_bids: [{ bid_id: "b" }]
        }
      }
    ];
    
    // Mock route_bids with unknown equipment_type
    vi.spyOn(supabase, "from").mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: mockData,
        error: null
      })
    } as any));

    const routes = await routesService.getRoutesByBid("b");
    expect(routes.length).toBe(1);
    expect(routes[0].equipment_type).toBe("Dry Van");
  });
});
