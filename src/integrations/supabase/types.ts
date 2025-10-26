export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      company_profiles: {
        Row: {
          address: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          company_name: string
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          owner_id: string
          payment_terms_default: string | null
          phone: string | null
          tax_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          company_name: string
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          owner_id: string
          payment_terms_default?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          owner_id?: string
          payment_terms_default?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      cv_experiences: {
        Row: {
          company: string
          created_at: string
          cv_profile_id: string | null
          description_bullets_json: Json | null
          end_date: string | null
          id: string
          job_title: string
          owner_id: string
          start_date: string | null
        }
        Insert: {
          company: string
          created_at?: string
          cv_profile_id?: string | null
          description_bullets_json?: Json | null
          end_date?: string | null
          id?: string
          job_title: string
          owner_id: string
          start_date?: string | null
        }
        Update: {
          company?: string
          created_at?: string
          cv_profile_id?: string | null
          description_bullets_json?: Json | null
          end_date?: string | null
          id?: string
          job_title?: string
          owner_id?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_experiences_cv_profile_id_fkey"
            columns: ["cv_profile_id"]
            isOneToOne: false
            referencedRelation: "cv_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_profiles: {
        Row: {
          created_at: string
          education_json: Json | null
          email: string | null
          full_name: string
          id: string
          location: string | null
          owner_id: string
          phone: string | null
          selected_headshot_url: string | null
          skills_json: Json | null
          summary: string | null
          template_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          education_json?: Json | null
          email?: string | null
          full_name: string
          id?: string
          location?: string | null
          owner_id: string
          phone?: string | null
          selected_headshot_url?: string | null
          skills_json?: Json | null
          summary?: string | null
          template_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          education_json?: Json | null
          email?: string | null
          full_name?: string
          id?: string
          location?: string | null
          owner_id?: string
          phone?: string | null
          selected_headshot_url?: string | null
          skills_json?: Json | null
          summary?: string | null
          template_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cv_projects: {
        Row: {
          created_at: string
          cv_profile_id: string | null
          description_bullets_json: Json | null
          id: string
          outcome: string | null
          owner_id: string
          project_name: string
          technologies_json: Json | null
        }
        Insert: {
          created_at?: string
          cv_profile_id?: string | null
          description_bullets_json?: Json | null
          id?: string
          outcome?: string | null
          owner_id: string
          project_name: string
          technologies_json?: Json | null
        }
        Update: {
          created_at?: string
          cv_profile_id?: string | null
          description_bullets_json?: Json | null
          id?: string
          outcome?: string | null
          owner_id?: string
          project_name?: string
          technologies_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_projects_cv_profile_id_fkey"
            columns: ["cv_profile_id"]
            isOneToOne: false
            referencedRelation: "cv_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      headshots: {
        Row: {
          chosen_url: string | null
          created_at: string
          id: string
          owner_id: string
          source_file_url: string
          status: string | null
          style: string | null
          updated_at: string
          variants_json: Json | null
        }
        Insert: {
          chosen_url?: string | null
          created_at?: string
          id?: string
          owner_id: string
          source_file_url: string
          status?: string | null
          style?: string | null
          updated_at?: string
          variants_json?: Json | null
        }
        Update: {
          chosen_url?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          source_file_url?: string
          status?: string | null
          style?: string | null
          updated_at?: string
          variants_json?: Json | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          bill_to_address: string | null
          bill_to_email: string | null
          bill_to_name: string | null
          bill_to_phone: string | null
          client_name: string
          created_at: string
          due_date: string | null
          email: string | null
          id: string
          invoice_number: string
          items_json: Json
          notes: string | null
          owner_id: string
          status: string | null
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          bill_to_address?: string | null
          bill_to_email?: string | null
          bill_to_name?: string | null
          bill_to_phone?: string | null
          client_name: string
          created_at?: string
          due_date?: string | null
          email?: string | null
          id?: string
          invoice_number: string
          items_json?: Json
          notes?: string | null
          owner_id: string
          status?: string | null
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          bill_to_address?: string | null
          bill_to_email?: string | null
          bill_to_name?: string | null
          bill_to_phone?: string | null
          client_name?: string
          created_at?: string
          due_date?: string | null
          email?: string | null
          id?: string
          invoice_number?: string
          items_json?: Json
          notes?: string | null
          owner_id?: string
          status?: string | null
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
