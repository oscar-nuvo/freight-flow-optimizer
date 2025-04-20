
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import CarrierBidResponsePage from "../CarrierBidResponsePage";
import * as invitationsService from "@/services/invitationsService";
import * as routesService from "@/services/routesService";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("@/services/invitationsService");
jest.mock("@/services/routesService");

const mockInvitation = {
  id: "inv-1",
  bid_id: "bid-1",
  carrier_id: "carrier-1",
  token: "token-abc",
  status: "delivered",
  invited_at: "2024-02-02T00:00:00Z",
  delivery_channels: ["email"],
  delivery_status: {},
  created_by: "user-1",
};

const bidRoutes = [
  {
    id: "route-a",
    organization_id: "org-1",
    origin_city: "Dallas",
    destination_city: "Houston",
    equipment_type: "Dry Van",
    commodity: "Electronics",
    weekly_volume: 5,
    distance: 240,
    is_deleted: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    route_bids: [{ bid_id: "bid-1" }],
  },
  {
    id: "route-b",
    organization_id: "org-1",
    origin_city: "Austin",
    destination_city: "San Antonio",
    equipment_type: "Reefer",
    commodity: "Food",
    weekly_volume: 3,
    distance: 80,
    is_deleted: false,
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-04T00:00:00Z",
    route_bids: [{ bid_id: "bid-1" }],
  },
];

const unrelatedRoutes = [
  {
    id: "route-c",
    organization_id: "org-2",
    origin_city: "Seattle",
    destination_city: "LA",
    equipment_type: "Flatbed",
    commodity: "Timber",
    weekly_volume: 2,
    distance: 1100,
    is_deleted: false,
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-06T00:00:00Z",
    route_bids: [{ bid_id: "bid-2" }],
  }
];

describe("CarrierBidResponsePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows only the routes associated with the invited bid", async () => {
    (invitationsService.getInvitationByToken as jest.Mock).mockResolvedValue(mockInvitation);
    (routesService.getRoutesByBid as jest.Mock).mockResolvedValue(bidRoutes);

    render(
      <MemoryRouter initialEntries={["/invite/token-abc"]}>
        <Routes>
          <Route path="/invite/:token" element={<CarrierBidResponsePage />} />
        </Routes>
      </MemoryRouter>
    );

    // Should display each associated route
    await waitFor(() => {
      expect(screen.getByText("Dallas")).toBeInTheDocument();
      expect(screen.getByText("Austin")).toBeInTheDocument();
      expect(screen.queryByText("Seattle")).not.toBeInTheDocument(); // Ensure unrelated route is not shown
    });

    expect(screen.getAllByText(/Electronics|Food/).length).toBe(2);
  });

  it("does not display routes for other bids", async () => {
    (invitationsService.getInvitationByToken as jest.Mock).mockResolvedValue(mockInvitation);
    (routesService.getRoutesByBid as jest.Mock).mockResolvedValue(bidRoutes.concat(unrelatedRoutes));

    render(
      <MemoryRouter initialEntries={["/invite/token-abc"]}>
        <Routes>
          <Route path="/invite/:token" element={<CarrierBidResponsePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Dallas")).toBeInTheDocument();
      expect(screen.getByText("Austin")).toBeInTheDocument();
      expect(screen.queryByText("Seattle")).not.toBeInTheDocument();
    });
  });

  it("displays an error if invitation token is invalid", async () => {
    (invitationsService.getInvitationByToken as jest.Mock).mockResolvedValue(null);

    render(
      <MemoryRouter initialEntries={["/invite/unknown-token"]}>
        <Routes>
          <Route path="/invite/:token" element={<CarrierBidResponsePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/invalid invitation/i)).toBeInTheDocument();
    });
  });

  it("does not show any data if the bid has no routes", async () => {
    (invitationsService.getInvitationByToken as jest.Mock).mockResolvedValue(mockInvitation);
    (routesService.getRoutesByBid as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/invite/token-abc"]}>
        <Routes>
          <Route path="/invite/:token" element={<CarrierBidResponsePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no routes/i)).toBeInTheDocument();
    });
  });
});
