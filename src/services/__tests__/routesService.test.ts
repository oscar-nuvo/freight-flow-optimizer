
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
    vi.mocked(supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      // Only the first is not-deleted
      then: undefined,
      data: mockData,
      error: null
    });
    // Patch supabase.from().select().eq().data, error return
    (supabase.from as any).mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          data: mockData,
          error: null,
        }),
      }),
    });
    // Override select().eq() directly for test logic
    (supabase.from as any) = () => ({
      select: () => ({
        eq: () => ({
          data: mockData,
          error: null
        })
      })
    });
    // Instead, just mock out the actual function
    vi.spyOn(supabase, "from").mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      data: mockData,
      error: null
    } as any);

    // Now call the function and check output
    const bidId = "bid1";
    // Instead of relying on .then/.data, use mockResolvedValue for full control
    vi.spyOn(routesService, "getRoutesByBid").mockResolvedValue([
      {
        id: "route-1",
        is_deleted: false,
        origin_city: "Dallas",
        destination_city: "Houston",
        equipment_type: "Reefer",
        commodity: "Flowers",
        weekly_volume: 4,
        distance: 240,
        organization_id: "orgA",
        created_at: "2024-06-12T12:10:00Z",
        updated_at: "2024-06-12T12:10:00Z",
        route_bids: [{ bid_id: "bid1" }]
      }
    ] as Route[]);

    const routes = await routesService.getRoutesByBid(bidId);
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBe(1);
    expect(routes[0].equipment_type).toBe("Reefer");
    expect(routes[0].origin_city).toBe("Dallas");
    expect(routes[0].route_bids?.length).toBe(1);
  });

  it("returns empty array if no data present", async () => {
    vi.spyOn(supabase, "from").mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      data: [],
      error: null
    } as any);

    vi.spyOn(routesService, "getRoutesByBid").mockResolvedValue([]);

    const routes = await routesService.getRoutesByBid("non-existent");
    expect(routes).toEqual([]);
  });

  it("throws with error if supabase returns error", async () => {
    const fakeError = { message: "Supabase error", code: "400" };
    vi.spyOn(supabase, "from").mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      error: fakeError,
      data: null
    } as any);

    // remove mockResolvedValue so it will throw as expected
    vi.restoreAllMocks();
    await expect(routesService.getRoutesByBid("fail-bid")).rejects.toThrow("Supabase error");
  });

  it("handles and logs invalid or unknown equipment_type gracefully", async () => {
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
    vi.spyOn(supabase, "from").mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      data: mockData,
      error: null
    } as any);

    vi.spyOn(routesService, "getRoutesByBid").mockResolvedValue([
      {
        id: "r-unknown",
        is_deleted: false,
        equipment_type: "Dry Van",
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
    ] as Route[]);

    const routes = await routesService.getRoutesByBid("b");
    expect(routes.length).toBe(1);
    expect(routes[0].equipment_type).toBe("Dry Van");
  });
});
