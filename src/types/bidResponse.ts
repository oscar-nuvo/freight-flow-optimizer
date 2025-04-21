
import { CurrencyType } from "./invitation";

export interface BidResponseFormValues {
  responderName: string;
  responderEmail: string;
  routeRates: Record<string, RouteRateFormValue>;
}

export interface RouteRateFormValue {
  value: number | null;
  comment?: string;
}

export interface BidResponseSubmission {
  bid_id: string;
  carrier_id: string;
  invitation_id: string;
  responder_name: string;
  responder_email: string;
  route_rates: Record<string, RouteRateSubmission>;
  is_draft?: boolean;
}

export interface RouteRateSubmission {
  route_id: string;
  value: number | null;
  currency: CurrencyType;
  comment?: string;
}

export interface BidResponseWithRates {
  id: string;
  bid_id: string;
  carrier_id: string;
  invitation_id: string;
  responder_name: string;
  responder_email: string;
  submitted_at: string;
  version: number;
  routes_submitted: number;
  rates: Record<string, {
    id: string;
    value: number;
    currency: CurrencyType;
    comment?: string;
  }>;
}

export interface BidResponseSummary {
  id: string;
  bid_id: string;
  carrier_id: string;
  invitation_id: string;
  responder_name: string;
  responder_email: string;
  submitted_at: string;
  version: number;
  routes_submitted: number;
  carrier_name?: string;
}

export interface BidResponseDetail extends BidResponseSummary {
  rates: Array<{
    id: string;
    route_id: string;
    value: number;
    currency: CurrencyType;
    comment?: string;
  }>;
}
