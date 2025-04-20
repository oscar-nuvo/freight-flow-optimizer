
import { Carrier } from "@/services/carriersService";

export type InvitationStatus = 
  | 'pending'
  | 'delivered'
  | 'opened'
  | 'responded'
  | 'revoked';

export type DeliveryChannel = 'email' | 'sms' | 'whatsapp';

export type CurrencyType = 'USD' | 'MXN' | 'CAD';

export type DeliveryStatus =
  Record<string, 'pending' | 'delivery-success' | 'delivery-failed' | 'opened' | 'responded' | 'revoked'>;

export interface CarrierInvitation {
  id: string;
  bid_id: string;
  carrier_id: string;
  token: string;
  status: InvitationStatus;
  invited_at: string;
  revoked_at?: string;
  responded_at?: string;
  custom_message?: string;
  delivery_channels: DeliveryChannel[];
  delivery_status: DeliveryStatus;
  created_by: string;
}

export interface CarrierBidResponse {
  id: string;
  bid_id: string;
  carrier_id: string;
  invitation_id: string;
  responder_name: string;
  responder_email: string;
  submitted_at: string;
  version: number;
  routes_submitted: number;
  raw_response_json?: any;
}

export interface CarrierRouteRate {
  id: string;
  bid_id: string;
  carrier_id: string;
  route_id: string;
  response_id: string;
  value: number;
  currency: CurrencyType;
  comment?: string;
  version: number;
  submitted_at: string;
}

export interface InvitationFormData {
  carrier_ids: string[];
  custom_message: string;
  delivery_channels: DeliveryChannel[];
}
