
export interface RouteRateSubmission {
  route_id: string;
  value: number;
  currency: string;
  comment?: string;
}

export interface BidResponseFormValues {
  responderName: string;
  responderEmail: string;
  routeRates: Record<string, { value: number | null; comment?: string }>;
}

// Add this interface to fix the error in RouteRatesForm.tsx
export interface RouteRateFormValue {
  value: number | null;
  comment?: string;
}

export interface BidResponseSubmission {
  bid_id: string;
  carrier_id: string;
  invitation_id: string;
  organization_id: string;
  responder_name: string;
  responder_email: string;
  version: number;
  routes_submitted: number;
  is_draft: boolean;
}
