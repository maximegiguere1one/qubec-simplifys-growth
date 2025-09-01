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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          challenge: string | null
          company: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          email: string
          id: string
          lead_id: string | null
          name: string
          phone: string
          selected_date: string
          selected_time: string
          session_id: string
          status: Database["public"]["Enums"]["booking_status"]
          timezone: string | null
        }
        Insert: {
          challenge?: string | null
          company?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          email: string
          id?: string
          lead_id?: string | null
          name: string
          phone: string
          selected_date: string
          selected_time: string
          session_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          timezone?: string | null
        }
        Update: {
          challenge?: string | null
          company?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          lead_id?: string | null
          name?: string
          phone?: string
          selected_date?: string
          selected_time?: string
          session_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          facebook_event_name: string
          facebook_response: Json | null
          id: string
          lead_id: string | null
          sent_at: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          facebook_event_name: string
          facebook_response?: Json | null
          id?: string
          lead_id?: string | null
          sent_at?: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          facebook_event_name?: string
          facebook_response?: Json | null
          id?: string
          lead_id?: string | null
          sent_at?: string
          session_id?: string | null
        }
        Relationships: []
      }
      email_delivery_logs: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          lead_id: string | null
          provider_response: Json | null
          recipient_email: string
          sent_at: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          lead_id?: string | null
          provider_response?: Json | null
          recipient_email: string
          sent_at?: string
          status: string
          subject: string
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          lead_id?: string | null
          provider_response?: Json | null
          recipient_email?: string
          sent_at?: string
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_delivery_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_events: {
        Row: {
          action: string
          created_at: string
          email_id: string
          id: string
          lead_id: string | null
          timestamp: string
        }
        Insert: {
          action: string
          created_at?: string
          email_id: string
          id?: string
          lead_id?: string | null
          timestamp?: string
        }
        Update: {
          action?: string
          created_at?: string
          email_id?: string
          id?: string
          lead_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequence_triggers: {
        Row: {
          created_at: string
          id: string
          lead_id: string | null
          sequence_id: string
          triggered_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id?: string | null
          sequence_id: string
          triggered_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string | null
          sequence_id?: string
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_triggers_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: Database["public"]["Enums"]["funnel_event_type"]
          id: string
          ip_address: unknown | null
          lead_id: string | null
          page_url: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: Database["public"]["Enums"]["funnel_event_type"]
          id?: string
          ip_address?: unknown | null
          lead_id?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: Database["public"]["Enums"]["funnel_event_type"]
          id?: string
          ip_address?: unknown | null
          lead_id?: string | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          business_size: string | null
          created_at: string
          email: string
          id: string
          industry: string | null
          location: string | null
          name: string
          phone: string | null
          score: number | null
          scoring_data: Json | null
          segment: string | null
          source: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          business_size?: string | null
          created_at?: string
          email: string
          id?: string
          industry?: string | null
          location?: string | null
          name: string
          phone?: string | null
          score?: number | null
          scoring_data?: Json | null
          segment?: string | null
          source?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          business_size?: string | null
          created_at?: string
          email?: string
          id?: string
          industry?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          score?: number | null
          scoring_data?: Json | null
          segment?: string | null
          source?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answer_score: number
          answer_value: string
          answered_at: string
          id: string
          question_id: number
          quiz_session_id: string
          time_spent_seconds: number | null
        }
        Insert: {
          answer_score: number
          answer_value: string
          answered_at?: string
          id?: string
          question_id: number
          quiz_session_id: string
          time_spent_seconds?: number | null
        }
        Update: {
          answer_score?: number
          answer_value?: string
          answered_at?: string
          id?: string
          question_id?: number
          quiz_session_id?: string
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_quiz_session_id_fkey"
            columns: ["quiz_session_id"]
            isOneToOne: false
            referencedRelation: "quiz_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_sessions: {
        Row: {
          abandoned_at: string | null
          completed_at: string | null
          id: string
          lead_id: string | null
          session_id: string
          started_at: string
          status: Database["public"]["Enums"]["quiz_session_status"]
          time_spent_seconds: number | null
          total_score: number | null
        }
        Insert: {
          abandoned_at?: string | null
          completed_at?: string | null
          id?: string
          lead_id?: string | null
          session_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["quiz_session_status"]
          time_spent_seconds?: number | null
          total_score?: number | null
        }
        Update: {
          abandoned_at?: string | null
          completed_at?: string | null
          id?: string
          lead_id?: string | null
          session_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["quiz_session_status"]
          time_spent_seconds?: number | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_events: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      booking_status:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      funnel_event_type:
        | "lp_view"
        | "lp_submit_optin"
        | "quiz_start"
        | "quiz_question_answer"
        | "quiz_complete"
        | "vsl_view"
        | "vsl_play"
        | "vsl_cta_click"
        | "bookcall_view"
        | "bookcall_submit"
        | "bookcall_confirm"
        | "quiz_view"
        | "performance_metric"
        | "guarantee_view"
        | "guarantee_cta_click"
      quiz_session_status: "started" | "completed" | "abandoned"
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
      booking_status: [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      funnel_event_type: [
        "lp_view",
        "lp_submit_optin",
        "quiz_start",
        "quiz_question_answer",
        "quiz_complete",
        "vsl_view",
        "vsl_play",
        "vsl_cta_click",
        "bookcall_view",
        "bookcall_submit",
        "bookcall_confirm",
        "quiz_view",
        "performance_metric",
        "guarantee_view",
        "guarantee_cta_click",
      ],
      quiz_session_status: ["started", "completed", "abandoned"],
    },
  },
} as const
