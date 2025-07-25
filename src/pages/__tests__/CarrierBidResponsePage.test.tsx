
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CarrierBidResponsePage from "../CarrierBidResponsePage";
import * as invitationsService from "@/services/invitationsService";
import * as secureRoutesService from "@/services/secureRoutesService";
import * as bidResponsesService from "@/services/bidResponsesService";
import { CarrierInvitation, InvitationStatus, CurrencyType } from "@/types/invitation";
import { Route as RouteType, EquipmentType } from "@/types/route";

// Mock the services
vi.mock("@/services/invitationsService");
vi.mock("@/services/secureRoutesService");
vi.mock("@/services/bidResponsesService");
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe("CarrierBidResponsePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should display routes and form when invitation is valid", async () => {
    // Mock invitation data - Added missing organization_id field for type compliance
    const mockInvitation: CarrierInvitation = {
      id: "inv-123",
      bid_id: "bid-123",
      carrier_id: "carrier-123",
      token: "token-123",
      status: "pending" as InvitationStatus,
      invited_at: "2023-06-01T00:00:00.000Z",
      delivery_channels: ['email'],
      delivery_status: {},
      created_by: "user-123",
      organization_id: "org-123"
    };

    // Mock routes data with mandatory route_bids array included
    const mockRoutes: RouteType[] = [
      {
        id: "route-1",
        organization_id: "org-123",
        origin_city: "Chicago",
        destination_city: "New York",
        equipment_type: "Dry Van" as EquipmentType,
        commodity: "Electronics",
        weekly_volume: 5,
        distance: 800,
        is_deleted: false,
        created_at: "2023-06-01T00:00:00.000Z",
        updated_at: "2023-06-01T00:00:00.000Z",
        route_bids: [{ bid_id: "bid-123" }]
      }
    ];

    // Setup mocks
    vi.mocked(invitationsService.getInvitationByToken).mockResolvedValue(mockInvitation);
    vi.mocked(invitationsService.updateInvitationStatus).mockResolvedValue(mockInvitation);
    vi.mocked(secureRoutesService.getRoutesByBidWithToken).mockResolvedValue(mockRoutes);
    vi.mocked(secureRoutesService.validateInvitationAccess).mockResolvedValue(true);
    vi.mocked(bidResponsesService.getExistingResponse).mockResolvedValue(null);

    const { getByText, queryByText } = render(
      <MemoryRouter initialEntries={["/bid/respond/token-123"]}>
        <Routes>
          <Route path="/bid/respond/:token" element={<CarrierBidResponsePage />} />
        </Routes>
      </MemoryRouter>
    );

    // Allow time for data to load
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify services were called
    expect(invitationsService.getInvitationByToken).toHaveBeenCalledWith("token-123");
    expect(secureRoutesService.getRoutesByBidWithToken).toHaveBeenCalledWith("bid-123", "token-123");

    // Verify UI elements
    expect(getByText("Carrier Bid Response Portal")).toBeInTheDocument();
    expect(getByText("Chicago")).toBeInTheDocument();
    expect(getByText("New York")).toBeInTheDocument();
  });

  it("should display error when invitation is invalid", async () => {
    // Mock invitation service to return null
    vi.mocked(invitationsService.getInvitationByToken).mockResolvedValue(null);

    const { getByText, queryByText } = render(
      <MemoryRouter initialEntries={["/bid/respond/invalid-token"]}>
        <Routes>
          <Route path="/bid/respond/:token" element={<CarrierBidResponsePage />} />
        </Routes>
      </MemoryRouter>
    );

    // Allow time for error to show
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify error message
    expect(getByText("Invalid or expired invitation token")).toBeInTheDocument();
    expect(getByText("Return Home")).toBeInTheDocument();
  });

  it("should pre-fill form when there's an existing response", async () => {
    // Mock invitation data - Added missing organization_id field for type compliance
    const mockInvitation: CarrierInvitation = {
      id: "inv-123",
      bid_id: "bid-123",
      carrier_id: "carrier-123",
      token: "token-123",
      status: "opened" as InvitationStatus,
      invited_at: "2023-06-01T00:00:00.000Z",
      delivery_channels: ['email'],
      delivery_status: {},
      created_by: "user-123",
      organization_id: "org-123"
    };

    // Mock routes data with mandatory route_bids included
    const mockRoutes: RouteType[] = [
      {
        id: "route-1",
        organization_id: "org-123",
        origin_city: "Chicago",
        destination_city: "New York",
        equipment_type: "Dry Van" as EquipmentType,
        commodity: "Electronics",
        weekly_volume: 5,
        distance: 800,
        is_deleted: false,
        created_at: "2023-06-01T00:00:00.000Z",
        updated_at: "2023-06-01T00:00:00.000Z",
        route_bids: [{ bid_id: "bid-123" }]
      }
    ];

    // Mock existing response - Use CurrencyType for currency and include is_draft
    const mockExistingResponse = {
      id: "response-123",
      bid_id: "bid-123",
      carrier_id: "carrier-123",
      invitation_id: "inv-123",
      organization_id: "org-123",
      responder_name: "John Doe",
      responder_email: "john@example.com",
      submitted_at: "2023-06-01T00:00:00.000Z",
      version: 1,
      routes_submitted: 1,
      raw_response_json: null,
      is_draft: false,
      rates: {
        "route-1": {
          id: "rate-1",
          value: 1200,
          currency: "USD" as CurrencyType,
          comment: "Sample comment"
        }
      }
    };

    // Setup mocks
    vi.mocked(invitationsService.getInvitationByToken).mockResolvedValue(mockInvitation);
    vi.mocked(secureRoutesService.getRoutesByBidWithToken).mockResolvedValue(mockRoutes);
    vi.mocked(secureRoutesService.validateInvitationAccess).mockResolvedValue(true);
    vi.mocked(bidResponsesService.getExistingResponse).mockResolvedValue(mockExistingResponse);

    const { getByDisplayValue, queryByText } = render(
      <MemoryRouter initialEntries={["/bid/respond/token-123"]}>
        <Routes>
          <Route path="/bid/respond/:token" element={<CarrierBidResponsePage />} />
        </Routes>
      </MemoryRouter>
    );

    // Allow time for data to load
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify pre-filled form data
    expect(getByDisplayValue("John Doe")).toBeInTheDocument();
  });
});
