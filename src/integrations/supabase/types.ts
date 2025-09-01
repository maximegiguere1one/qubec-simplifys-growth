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
      email_queue: {
        Row: {
          attempts: number
          created_at: string
          email_type: string
          error_message: string | null
          html_content: string
          id: string
          lead_id: string | null
          max_attempts: number
          recipient_email: string
          scheduled_for: string
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          email_type: string
          error_message?: string | null
          html_content: string
          id?: string
          lead_id?: string | null
          max_attempts?: number
          recipient_email: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          email_type?: string
          error_message?: string | null
          html_content?: string
          id?: string
          lead_id?: string | null
          max_attempts?: number
          recipient_email?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_lead_id_fkey"
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
      email_settings: {
        Row: {
          created_at: string
          daily_send_limit: number | null
          default_sequence: string | null
          from_email: string
          from_name: string
          id: string
          reply_to: string | null
          sending_paused: boolean
          test_recipient: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_send_limit?: number | null
          default_sequence?: string | null
          from_email: string
          from_name?: string
          id?: string
          reply_to?: string | null
          sending_paused?: boolean
          test_recipient?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_send_limit?: number | null
          default_sequence?: string | null
          from_email?: string
          from_name?: string
          id?: string
          reply_to?: string | null
          sending_paused?: boolean
          test_recipient?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribes: {
        Row: {
          created_at: string
          email: string
          id: string
          lead_id: string | null
          unsubscribed_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          lead_id?: string | null
          unsubscribed_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          lead_id?: string | null
          unsubscribed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_unsubscribes_lead_id_fkey"
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
      lead_notes: {
        Row: {
          author_user_id: string
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          lead_id: string
          note_type: string | null
          updated_at: string | null
        }
        Insert: {
          author_user_id: string
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          lead_id: string
          note_type?: string | null
          updated_at?: string | null
        }
        Update: {
          author_user_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          lead_id?: string
          note_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tag_assignments: {
        Row: {
          assigned_at: string | null
          id: string
          lead_id: string
          tag_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          lead_id: string
          tag_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          lead_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tag_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "lead_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      lead_tasks: {
        Row: {
          assigned_to_user_id: string
          completed_at: string | null
          created_at: string | null
          created_by_user_id: string
          description: string | null
          due_date: string | null
          id: string
          lead_id: string
          priority: string | null
          status: string | null
          task_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to_user_id: string
          completed_at?: string | null
          created_at?: string | null
          created_by_user_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id: string
          priority?: string | null
          status?: string | null
          task_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to_user_id?: string
          completed_at?: string | null
          created_at?: string | null
          created_by_user_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string
          priority?: string | null
          status?: string | null
          task_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_tasks_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lead_tasks_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lead_tasks_lead_id_fkey"
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
          company: string | null
          conversion_probability: number | null
          created_at: string
          email: string
          id: string
          industry: string | null
          last_activity_at: string | null
          lead_quality: string | null
          lead_value: number | null
          lifecycle_stage: string | null
          location: string | null
          name: string
          next_follow_up_at: string | null
          owner_user_id: string | null
          phone: string | null
          priority: string | null
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
          company?: string | null
          conversion_probability?: number | null
          created_at?: string
          email: string
          id?: string
          industry?: string | null
          last_activity_at?: string | null
          lead_quality?: string | null
          lead_value?: number | null
          lifecycle_stage?: string | null
          location?: string | null
          name: string
          next_follow_up_at?: string | null
          owner_user_id?: string | null
          phone?: string | null
          priority?: string | null
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
          company?: string | null
          conversion_probability?: number | null
          created_at?: string
          email?: string
          id?: string
          industry?: string | null
          last_activity_at?: string | null
          lead_quality?: string | null
          lead_value?: number | null
          lifecycle_stage?: string | null
          location?: string | null
          name?: string
          next_follow_up_at?: string | null
          owner_user_id?: string | null
          phone?: string | null
          priority?: string | null
          score?: number | null
          scoring_data?: Json | null
          segment?: string | null
          source?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
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
      saved_lead_views: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_lead_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          ip_address: unknown
          max_operations?: number
          table_name: string
          time_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_events: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_honeypot: {
        Args: { form_data: Json }
        Returns: boolean
      }
      get_advanced_metrics: {
        Args: { days_back?: number }
        Returns: {
          average_lead_score: number
          cold_leads_count: number
          consultation_booking_rate: number
          hot_leads_count: number
          lead_capture_rate: number
          qualified_leads_count: number
          quiz_completion_rate: number
          quiz_start_rate: number
          total_visitors: number
          warm_leads_count: number
        }[]
      }
      get_dashboard_metrics: {
        Args: { days_back?: number }
        Returns: {
          avg_quiz_score: number
          bookings: number
          conversion_rate: number
          quiz_completions: number
          total_leads: number
          vsl_views: number
        }[]
      }
      get_email_delivery_stats: {
        Args: { days_back?: number }
        Returns: {
          last_successful_send: string
          success_rate: number
          total_failed: number
          total_sent: number
        }[]
      }
      get_experiment_results: {
        Args: { days_back?: number }
        Returns: {
          conversion_rate: number
          conversions: number
          test_name: string
          total_views: number
          variant: string
        }[]
      }
      validate_session_id: {
        Args: { session_id: string }
        Returns: boolean
      }
      validate_utm_params: {
        Args: { utm_data: Json }
        Returns: boolean
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
