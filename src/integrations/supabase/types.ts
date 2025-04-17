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
      bids: {
        Row: {
          carriers: number | null
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          lanes: number | null
          name: string
          org_id: string
          progress: number | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          carriers?: number | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          lanes?: number | null
          name: string
          org_id: string
          progress?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          carriers?: number | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          lanes?: number | null
          name?: string
          org_id?: string
          progress?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      carrier_contacts: {
        Row: {
          carrier_id: string
          created_at: string
          email: string
          id: string
          job_title: string | null
          name: string
          phone: string | null
          receives_rate_inquiries: boolean | null
          updated_at: string
        }
        Insert: {
          carrier_id: string
          created_at?: string
          email: string
          id?: string
          job_title?: string | null
          name: string
          phone?: string | null
          receives_rate_inquiries?: boolean | null
          updated_at?: string
        }
        Update: {
          carrier_id?: string
          created_at?: string
          email?: string
          id?: string
          job_title?: string | null
          name?: string
          phone?: string | null
          receives_rate_inquiries?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carrier_contacts_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
        ]
      }
      carrier_documents: {
        Row: {
          carrier_id: string
          expires_at: string | null
          file_name: string
          file_path: string
          id: string
          type: string
          uploaded_at: string
        }
        Insert: {
          carrier_id: string
          expires_at?: string | null
          file_name: string
          file_path: string
          id?: string
          type: string
          uploaded_at?: string
        }
        Update: {
          carrier_id?: string
          expires_at?: string | null
          file_name?: string
          file_path?: string
          id?: string
          type?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carrier_documents_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
        ]
      }
      carrier_profiles: {
        Row: {
          account_name: string | null
          account_number: string | null
          authority_types: string[] | null
          b1_drivers: number | null
          bank_name: string | null
          billing_email: string | null
          cdl_drivers: number | null
          city: string | null
          countries_of_operation: string[] | null
          country: string | null
          created_at: string
          cross_border_services: string[] | null
          ctpat_certified: boolean | null
          ctpat_svi_number: string | null
          currency: string | null
          dry_van_trailers: number | null
          engages_in_trailer_exchanges: boolean | null
          flatbed_trailers: number | null
          fmcsa_authority_active: boolean | null
          handles_inbond_shipments: boolean | null
          hazmat_authorized: boolean | null
          id: string
          intermediary_payments: boolean | null
          legal_name: string | null
          payout_method: string | null
          power_units: number | null
          primary_lanes: Json[] | null
          provides_cross_border: boolean | null
          reefer_trailers: number | null
          registration_number: string | null
          registration_type: string | null
          routing_number: string | null
          scac_number: string | null
          service_types: string[] | null
          state: string | null
          street_name: string | null
          street_number: string | null
          swift_code: string | null
          tax_id: string | null
          team_driver_services: boolean | null
          telematics_provider: string | null
          tracking_method: string | null
          trailer_exchange_partners: string | null
          updated_at: string
          website_url: string | null
          yard_locations: Json[] | null
          zip_code: string | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          authority_types?: string[] | null
          b1_drivers?: number | null
          bank_name?: string | null
          billing_email?: string | null
          cdl_drivers?: number | null
          city?: string | null
          countries_of_operation?: string[] | null
          country?: string | null
          created_at?: string
          cross_border_services?: string[] | null
          ctpat_certified?: boolean | null
          ctpat_svi_number?: string | null
          currency?: string | null
          dry_van_trailers?: number | null
          engages_in_trailer_exchanges?: boolean | null
          flatbed_trailers?: number | null
          fmcsa_authority_active?: boolean | null
          handles_inbond_shipments?: boolean | null
          hazmat_authorized?: boolean | null
          id: string
          intermediary_payments?: boolean | null
          legal_name?: string | null
          payout_method?: string | null
          power_units?: number | null
          primary_lanes?: Json[] | null
          provides_cross_border?: boolean | null
          reefer_trailers?: number | null
          registration_number?: string | null
          registration_type?: string | null
          routing_number?: string | null
          scac_number?: string | null
          service_types?: string[] | null
          state?: string | null
          street_name?: string | null
          street_number?: string | null
          swift_code?: string | null
          tax_id?: string | null
          team_driver_services?: boolean | null
          telematics_provider?: string | null
          tracking_method?: string | null
          trailer_exchange_partners?: string | null
          updated_at?: string
          website_url?: string | null
          yard_locations?: Json[] | null
          zip_code?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          authority_types?: string[] | null
          b1_drivers?: number | null
          bank_name?: string | null
          billing_email?: string | null
          cdl_drivers?: number | null
          city?: string | null
          countries_of_operation?: string[] | null
          country?: string | null
          created_at?: string
          cross_border_services?: string[] | null
          ctpat_certified?: boolean | null
          ctpat_svi_number?: string | null
          currency?: string | null
          dry_van_trailers?: number | null
          engages_in_trailer_exchanges?: boolean | null
          flatbed_trailers?: number | null
          fmcsa_authority_active?: boolean | null
          handles_inbond_shipments?: boolean | null
          hazmat_authorized?: boolean | null
          id?: string
          intermediary_payments?: boolean | null
          legal_name?: string | null
          payout_method?: string | null
          power_units?: number | null
          primary_lanes?: Json[] | null
          provides_cross_border?: boolean | null
          reefer_trailers?: number | null
          registration_number?: string | null
          registration_type?: string | null
          routing_number?: string | null
          scac_number?: string | null
          service_types?: string[] | null
          state?: string | null
          street_name?: string | null
          street_number?: string | null
          swift_code?: string | null
          tax_id?: string | null
          team_driver_services?: boolean | null
          telematics_provider?: string | null
          tracking_method?: string | null
          trailer_exchange_partners?: string | null
          updated_at?: string
          website_url?: string | null
          yard_locations?: Json[] | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carrier_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
        ]
      }
      carriers: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          invite_sent_at: string | null
          invite_token: string | null
          mc_number: string | null
          name: string
          org_id: string
          profile_completed_at: string | null
          rfc_number: string | null
          status: string
          updated_at: string
          usdot_number: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          invite_sent_at?: string | null
          invite_token?: string | null
          mc_number?: string | null
          name: string
          org_id: string
          profile_completed_at?: string | null
          rfc_number?: string | null
          status?: string
          updated_at?: string
          usdot_number?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          invite_sent_at?: string | null
          invite_token?: string | null
          mc_number?: string | null
          name?: string
          org_id?: string
          profile_completed_at?: string | null
          rfc_number?: string | null
          status?: string
          updated_at?: string
          usdot_number?: string | null
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
      org_memberships: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
          subscription_updated_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          subscription_status?: string
          subscription_updated_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          subscription_status?: string
          subscription_updated_at?: string
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
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
