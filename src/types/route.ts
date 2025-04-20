
export type EquipmentType = 'Dry Van' | 'Reefer' | 'Flatbed';

export interface Route {
  id: string;
  organization_id: string;
  origin_city: string;
  destination_city: string;
  equipment_type: EquipmentType;
  commodity: string;
  weekly_volume: number;
  distance: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  route_bids?: { bid_id: string }[];
}

export interface RouteFormValues {
  origin_city: string;
  destination_city: string;
  equipment_type: EquipmentType;
  commodity: string;
  weekly_volume: number;
  distance?: number;
}

export interface RouteFilters {
  origin_city?: string;
  destination_city?: string;
  equipment_type?: EquipmentType;
  commodity?: string;
}
