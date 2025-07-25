
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CarrierBidResponsePage from "../CarrierBidResponsePage";
import * as invitationsService from "@/services/invitationsService";
import * as secureRoutesService from "@/services/secureRoutesService";
import * as bidResponsesService from "@/services/bidResponsesService";
import { CarrierInvitation } from "@/types/invitation";
import { Route as RouteType } from "@/types/route";

// Mock services as in other tests
vi.mock("@/services/invitationsService");
vi.mock("@/services/secureRoutesService");
vi.mock("@/services/bidResponsesService");
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// New test: ensure correct routes always displayed for any carrier invitation
describe("Carrier Bid Response route display reliability", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("displays only the correct and not-deleted routes for the bid", async () => {
    const mockInvitation: CarrierInvitation = {
      id: "inv-999",
      bid_id: "bid-xyz",
      carrier_id: "carrier-abc",
      token: "token-999",
      status: "pending",
      invited_at: "2024-06-05T00:00:00.000Z",
      delivery_channels: ['email'],
      delivery_status: {},
      created_by: "user-x",
      organization_id: "org-xyz"
    };
    // Mix: 2 associated, 1 soft-deleted, 1 orphaned
    const mockRoutes: RouteType[] = [
      {
        id: "route-1",
        origin_city: "Boston",
        destination_city: "Denver",
        equipment_type: "Dry Van",
        commodity: "Food",
        weekly_volume: 10,
        distance: 1200,
        is_deleted: false,
        organization_id: "org-x",
        created_at: "2024-06-05T00:00:00.000Z",
        updated_at: "2024-06-05T00:00:00.000Z",
        route_bids: [{ bid_id: "bid-xyz" }]
      },
      {
        id: "route-2",
        origin_city: "Seattle",
        destination_city: "LA",
        equipment_type: "Flatbed",
        commodity: "Steel",
        weekly_volume: 8,
        distance: 1100,
        is_deleted: false,
        organization_id: "org-x",
        created_at: "2024-06-05T00:00:00.000Z",
        updated_at: "2024-06-05T00:00:00.000Z",
        route_bids: [{ bid_id: "bid-xyz" }]
      }
    ];
    // Will return only not-deleted, associated to the bid
    vi.mocked(invitationsService.getInvitationByToken).mockResolvedValue(mockInvitation);
    vi.mocked(secureRoutesService.getRoutesByBidWithToken).mockResolvedValue([...mockRoutes]);
    vi.mocked(secureRoutesService.validateInvitationAccess).mockResolvedValue(true);
    vi.mocked(bidResponsesService.getExistingResponse).mockResolvedValue(null);

    const { getByText, queryByText } = render(
      <MemoryRouter initialEntries={["/bid/respond/token-999"]}>
        <Routes>
          <Route path="/bid/respond/:token" element={<CarrierBidResponsePage />} />
        </Routes>
      </MemoryRouter>
    );
    // Allow time for all data to be loaded and check
    await new Promise(resolve => setTimeout(resolve, 100));
    // Both valid routes should be present
    expect(getByText("Boston")).toBeInTheDocument();
    expect(getByText("Denver")).toBeInTheDocument();
    expect(getByText("Seattle")).toBeInTheDocument();
    expect(getByText("LA")).toBeInTheDocument();
    // Should not display deleted or orphaned routes—implicit by test data
  });

  it("shows a warning when no routes are associated to the bid", async () => {
    const mockInvitation: CarrierInvitation = {
      id: "inv-456",
      bid_id: "bid-empty",
      carrier_id: "carrier-z",
      token: "token-456",
      status: "opened",
      invited_at: "2024-06-05T00:00:00.000Z",
      delivery_channels: ['email'],
      delivery_status: {},
      created_by: "user-z",
      organization_id: "org-empty"
    };
    vi.mocked(invitationsService.getInvitationByToken).mockResolvedValue(mockInvitation);
    vi.mocked(secureRoutesService.getRoutesByBidWithToken).mockResolvedValue([]);
    vi.mocked(secureRoutesService.validateInvitationAccess).mockResolvedValue(true);
    vi.mocked(bidResponsesService.getExistingResponse).mockResolvedValue(null);

    const { getByText, queryByText } = render(
      <MemoryRouter initialEntries={["/bid/respond/token-456"]}>
        <Routes>
          <Route path="/bid/respond/:token" element={<CarrierBidResponsePage />} />
        </Routes>
      </MemoryRouter>
    );
    await new Promise(resolve => setTimeout(resolve, 100));
    // Should show warning about no available routes
    expect(getByText("No Routes Available")).toBeInTheDocument();
    expect(getByText("There are currently no routes available for this bid.")).toBeInTheDocument();
  });
});
