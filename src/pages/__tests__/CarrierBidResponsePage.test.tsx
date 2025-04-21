
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CarrierBidResponsePage from "../CarrierBidResponsePage";
import * as invitationsService from "@/services/invitationsService";
import * as routesService from "@/services/routesService";
import * as bidResponsesService from "@/services/bidResponsesService";
import { CarrierInvitation, InvitationStatus, CurrencyType } from "@/types/invitation";
import { Route as RouteType, EquipmentType } from "@/types/route";

// Mock the services
vi.mock("@/services/invitationsService");
vi.mock("@/services/routesService");
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
      organization_id: "org-123"  // Added field
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
    vi.mocked(routesService.getRoutesByBid).mockResolvedValue(mockRoutes);
    vi.mocked(bidResponsesService.getExistingResponse).mockResolvedValue(null);

    render(
      <MemoryRouter initialEntries={["/bid/respond/token-123"]}>
        <Routes>
          <Route path="/bid/respond/:token" element={<CarrierBidResponsePage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText("Loading bid information...")).not.toBeInTheDocument();
    });

    // Verify services were called
    expect(invitationsService.getInvitationByToken).toHaveBeenCalledWith("token-123");
    expect(routesService.getRoutesByBid).toHaveBeenCalledWith("bid-123");

    // Verify UI elements
    expect(screen.getByText("Carrier Bid Response Portal")).toBeInTheDocument();
    expect(screen.getByText("Chicago")).toBeInTheDocument();
    expect(screen.getByText("New York")).toBeInTheDocument();
  });

  it("should display error when invitation is invalid", async () => {
    // Mock invitation service to return null
    vi.mocked(invitationsService.getInvitationByToken).mockResolvedValue(null);

    render(
      <MemoryRouter initialEntries={["/bid/respond/invalid-token"]}>
        <Routes>
          <Route path="/bid/respond/:token" element={<CarrierBidResponsePage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for error to show
    await waitFor(() => {
      expect(screen.queryByText("Loading bid information...")).not.toBeInTheDocument();
    });

    // Verify error message
    expect(screen.getByText("Invalid or expired invitation token")).toBeInTheDocument();
    expect(screen.getByText("Return Home")).toBeInTheDocument();
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
      organization_id: "org-123"  // Added field
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

    // Mock existing response - Use CurrencyType for currency
    const mockExistingResponse = {
      id: "response-123",
      bid_id: "bid-123",
      carrier_id: "carrier-123",
      invitation_id: "inv-123",
      responder_name: "John Doe",
      responder_email: "john@example.com",
      submitted_at: "2023-06-01T00:00:00.000Z",
      version: 1,
      routes_submitted: 1,
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
    vi.mocked(routesService.getRoutesByBid).mockResolvedValue(mockRoutes);
    vi.mocked(bidResponsesService.getExistingResponse).mockResolvedValue(mockExistingResponse);

    render(
      <MemoryRouter initialEntries={["/bid/respond/token-123"]}>
        <Routes>
          <Route path="/bid/respond/:token" element={<CarrierBidResponsePage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText("Loading bid information...")).not.toBeInTheDocument();
    });

    // Verify pre-filled form data
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
  });
});
