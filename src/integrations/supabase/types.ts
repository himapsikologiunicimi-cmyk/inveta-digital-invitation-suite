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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      greeting_templates: {
        Row: {
          created_at: string | null
          id: string
          template: string
          type: Database["public"]["Enums"]["greeting_type"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          template: string
          type: Database["public"]["Enums"]["greeting_type"]
        }
        Update: {
          created_at?: string | null
          id?: string
          template?: string
          type?: Database["public"]["Enums"]["greeting_type"]
        }
        Relationships: []
      }
      guests: {
        Row: {
          created_at: string | null
          id: string
          invitation_id: string
          name: string
          shared_via: string[] | null
          slug: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invitation_id: string
          name: string
          shared_via?: string[] | null
          slug: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invitation_id?: string
          name?: string
          shared_via?: string[] | null
          slug?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string | null
          custom_message: string | null
          greeting_type: Database["public"]["Enums"]["greeting_type"] | null
          id: string
          salutation: Database["public"]["Enums"]["salutation_type"] | null
          theme_id: number
          theme_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_message?: string | null
          greeting_type?: Database["public"]["Enums"]["greeting_type"] | null
          id?: string
          salutation?: Database["public"]["Enums"]["salutation_type"] | null
          theme_id: number
          theme_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_message?: string | null
          greeting_type?: Database["public"]["Enums"]["greeting_type"] | null
          id?: string
          salutation?: Database["public"]["Enums"]["salutation_type"] | null
          theme_id?: number
          theme_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          couple_names: string
          couple_photo_url: string | null
          created_at: string
          customer_name: string
          id: string
          invitation_link: string | null
          notes: string | null
          payment_amount: number | null
          payment_date: string | null
          payment_proof_url: string | null
          status: Database["public"]["Enums"]["order_status"]
          theme_id: number
          theme_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          couple_names: string
          couple_photo_url?: string | null
          created_at?: string
          customer_name: string
          id?: string
          invitation_link?: string | null
          notes?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_proof_url?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          theme_id: number
          theme_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          couple_names?: string
          couple_photo_url?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          invitation_link?: string | null
          notes?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_proof_url?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          theme_id?: number
          theme_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
      greeting_type: "formal" | "muslim" | "nasrani" | "hindu" | "ultah"
      order_status:
        | "pending_payment"
        | "payment_received"
        | "in_progress"
        | "completed"
      salutation_type: "to" | "dear" | "kepada"
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
    Enums: {
      app_role: ["admin", "customer"],
      greeting_type: ["formal", "muslim", "nasrani", "hindu", "ultah"],
      order_status: [
        "pending_payment",
        "payment_received",
        "in_progress",
        "completed",
      ],
      salutation_type: ["to", "dear", "kepada"],
    },
  },
} as const
