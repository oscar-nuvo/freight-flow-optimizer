export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          organization_id: string
          user_id: string
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          organization_id: string
          user_id: string
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          organization_id?: string
          user_id?: string
        }
        Relationships: []
      }
      bids: {
        Row: {
          carriers: number | null
          contract_file: string | null
          created_at: string
          end_date: string | null
          equipment_type: string | null
          id: string
          instructions: string | null
          lanes: number | null
          mode: string | null
          name: string
          org_id: string
          progress: number | null
          rate_duration: string | null
          start_date: string | null
          status: string
          submission_date: string | null
          updated_at: string
        }
        Insert: {
          carriers?: number | null
          contract_file?: string | null
          created_at?: string
          end_date?: string | null
          equipment_type?: string | null
          id?: string
          instructions?: string | null
          lanes?: number | null
          mode?: string | null
          name: string
          org_id: string
          progress?: number | null
          rate_duration?: string | null
          start_date?: string | null
          status?: string
          submission_date?: string | null
          updated_at?: string
        }
        Update: {
          carriers?: number | null
          contract_file?: string | null
          created_at?: string
          end_date?: string | null
          equipment_type?: string | null
          id?: string
          instructions?: string | null
          lanes?: number | null
          mode?: string | null
          name?: string
          org_id?: string
          progress?: number | null
          rate_duration?: string | null
          start_date?: string | null
          status?: string
          submission_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      carriers: {
        Row: {
          account_name: string | null
          account_number: string | null
          additional_contacts: Json[] | null
          address_line1: string | null
          address_line2: string | null
          authority_types: string[] | null
          authorized_for_hazmat: boolean | null
          b1_drivers_count: number | null
          bank_name: string | null
          bank_statement_doc: string | null
          billing_email: string | null
          cargo_insurance_doc: string | null
          cdl_drivers_count: number | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          countries_of_operation: string[] | null
          country: string | null
          created_at: string
          cross_border_routes: string[] | null
          ctpat_svi_number: string | null
          currency: string | null
          description: string | null
          dry_van_trailers_count: number | null
          engages_in_trailer_exchanges: boolean | null
          flatbed_trailers_count: number | null
          fmcsa_authority_active: boolean | null
          handles_inbond_ca_shipments: boolean | null
          id: string
          insurance_expiry: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          invite_sent_at: string | null
          invite_token: string | null
          is_ctpat_certified: boolean | null
          legal_business_name: string | null
          mc_number: string | null
          name: string
          offers_team_driver_services: boolean | null
          org_id: string
          payments_via_intermediary: boolean | null
          payout_method: string | null
          power_units_count: number | null
          primary_lanes: Json[] | null
          primary_liability_doc: string | null
          profile_completed_at: string | null
          provides_cross_border_services: boolean | null
          reefer_trailers_count: number | null
          registration_type: string | null
          rfc_number: string | null
          routing_number: string | null
          scac: string | null
          service_types: string[] | null
          state: string | null
          status: string
          swift_code: string | null
          tax_id: string | null
          telematics_provider: string | null
          tracking_method: string | null
          trailer_exchange_partners: string | null
          updated_at: string
          usdot_number: string | null
          w9_form_doc: string | null
          website: string | null
          yard_locations: Json[] | null
          zip_code: string | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          additional_contacts?: Json[] | null
          address_line1?: string | null
          address_line2?: string | null
          authority_types?: string[] | null
          authorized_for_hazmat?: boolean | null
          b1_drivers_count?: number | null
          bank_name?: string | null
          bank_statement_doc?: string | null
          billing_email?: string | null
          cargo_insurance_doc?: string | null
          cdl_drivers_count?: number | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          countries_of_operation?: string[] | null
          country?: string | null
          created_at?: string
          cross_border_routes?: string[] | null
          ctpat_svi_number?: string | null
          currency?: string | null
          description?: string | null
          dry_van_trailers_count?: number | null
          engages_in_trailer_exchanges?: boolean | null
          flatbed_trailers_count?: number | null
          fmcsa_authority_active?: boolean | null
          handles_inbond_ca_shipments?: boolean | null
          id?: string
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          invite_sent_at?: string | null
          invite_token?: string | null
          is_ctpat_certified?: boolean | null
          legal_business_name?: string | null
          mc_number?: string | null
          name: string
          offers_team_driver_services?: boolean | null
          org_id: string
          payments_via_intermediary?: boolean | null
          payout_method?: string | null
          power_units_count?: number | null
          primary_lanes?: Json[] | null
          primary_liability_doc?: string | null
          profile_completed_at?: string | null
          provides_cross_border_services?: boolean | null
          reefer_trailers_count?: number | null
          registration_type?: string | null
          rfc_number?: string | null
          routing_number?: string | null
          scac?: string | null
          service_types?: string[] | null
          state?: string | null
          status?: string
          swift_code?: string | null
          tax_id?: string | null
          telematics_provider?: string | null
          tracking_method?: string | null
          trailer_exchange_partners?: string | null
          updated_at?: string
          usdot_number?: string | null
          w9_form_doc?: string | null
          website?: string | null
          yard_locations?: Json[] | null
          zip_code?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          additional_contacts?: Json[] | null
          address_line1?: string | null
          address_line2?: string | null
          authority_types?: string[] | null
          authorized_for_hazmat?: boolean | null
          b1_drivers_count?: number | null
          bank_name?: string | null
          bank_statement_doc?: string | null
          billing_email?: string | null
          cargo_insurance_doc?: string | null
          cdl_drivers_count?: number | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          countries_of_operation?: string[] | null
          country?: string | null
          created_at?: string
          cross_border_routes?: string[] | null
          ctpat_svi_number?: string | null
          currency?: string | null
          description?: string | null
          dry_van_trailers_count?: number | null
          engages_in_trailer_exchanges?: boolean | null
          flatbed_trailers_count?: number | null
          fmcsa_authority_active?: boolean | null
          handles_inbond_ca_shipments?: boolean | null
          id?: string
          insurance_expiry?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          invite_sent_at?: string | null
          invite_token?: string | null
          is_ctpat_certified?: boolean | null
          legal_business_name?: string | null
          mc_number?: string | null
          name?: string
          offers_team_driver_services?: boolean | null
          org_id?: string
          payments_via_intermediary?: boolean | null
          payout_method?: string | null
          power_units_count?: number | null
          primary_lanes?: Json[] | null
          primary_liability_doc?: string | null
          profile_completed_at?: string | null
          provides_cross_border_services?: boolean | null
          reefer_trailers_count?: number | null
          registration_type?: string | null
          rfc_number?: string | null
          routing_number?: string | null
          scac?: string | null
          service_types?: string[] | null
          state?: string | null
          status?: string
          swift_code?: string | null
          tax_id?: string | null
          telematics_provider?: string | null
          tracking_method?: string | null
          trailer_exchange_partners?: string | null
          updated_at?: string
          usdot_number?: string | null
          w9_form_doc?: string | null
          website?: string | null
          yard_locations?: Json[] | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carriers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          subscription_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          subscription_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          org_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          org_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          org_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      route_bids: {
        Row: {
          bid_id: string
          created_at: string
          id: string
          route_id: string
          updated_at: string
        }
        Insert: {
          bid_id: string
          created_at?: string
          id?: string
          route_id: string
          updated_at?: string
        }
        Update: {
          bid_id?: string
          created_at?: string
          id?: string
          route_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_bids_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_bids_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          commodity: string
          created_at: string
          destination_city: string
          distance: number | null
          equipment_type: string
          id: string
          is_deleted: boolean
          organization_id: string
          origin_city: string
          updated_at: string
          weekly_volume: number
        }
        Insert: {
          commodity: string
          created_at?: string
          destination_city: string
          distance?: number | null
          equipment_type: string
          id?: string
          is_deleted?: boolean
          organization_id: string
          origin_city: string
          updated_at?: string
          weekly_volume?: number
        }
        Update: {
          commodity?: string
          created_at?: string
          destination_city?: string
          distance?: number | null
          equipment_type?: string
          id?: string
          is_deleted?: boolean
          organization_id?: string
          origin_city?: string
          updated_at?: string
          weekly_volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "routes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_audit_log: {
        Args: {
          p_entity_type: string
          p_entity_id: string
          p_action: string
          p_changes?: Json
          p_metadata?: Json
          p_ip_address?: string
        }
        Returns: string
      }
      get_user_org_id: {
        Args: { user_id?: string }
        Returns: string
      }
      get_user_organizations: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_orgs: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      is_admin_of_org: {
        Args: { org_id: string }
        Returns: boolean
      }
      is_member_of_org: {
        Args: { org_id: string }
        Returns: boolean
      }
      is_new_org: {
        Args: { org_uuid: string }
        Returns: boolean
      }
      is_org_admin: {
        Args: { org_uuid: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { org_uuid: string }
        Returns: boolean
      }
      jsonb_diff_val: {
        Args: { val1: Json; val2: Json }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
