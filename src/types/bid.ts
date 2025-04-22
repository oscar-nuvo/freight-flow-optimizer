
export interface Bid {
  id: string;
  name: string;
  status: string;
  lanes?: number;
  carriers?: number;
  start_date?: string;
  end_date?: string;
  submission_date?: string;
  progress?: number;
  created_at: string;
  updated_at: string;
  org_id: string;
  rate_duration?: string;
  mode?: string;
  equipment_type?: string;
  instructions?: string;
  contract_file?: string;
}
