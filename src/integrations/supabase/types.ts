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
      advisor_founder_assignments: {
        Row: {
          advisor_id: string | null
          assigned_at: string | null
          founder_id: string | null
          id: string
          status: string | null
        }
        Insert: {
          advisor_id?: string | null
          assigned_at?: string | null
          founder_id?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          advisor_id?: string | null
          assigned_at?: string | null
          founder_id?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advisor_founder_assignments_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_founder_assignments_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_monthly_reports: {
        Row: {
          advisor_id: string | null
          content: Json | null
          created_at: string | null
          id: string
          month: number
          submitted_at: string | null
          year: number
        }
        Insert: {
          advisor_id?: string | null
          content?: Json | null
          created_at?: string | null
          id?: string
          month: number
          submitted_at?: string | null
          year: number
        }
        Update: {
          advisor_id?: string | null
          content?: Json | null
          created_at?: string | null
          id?: string
          month?: number
          submitted_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "advisor_monthly_reports_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_resources: {
        Row: {
          advisor_id: string | null
          created_at: string | null
          description: string | null
          download_url: string | null
          file_url: string | null
          id: string
          is_published: boolean | null
          resource_type: string | null
          target_audience: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          advisor_id?: string | null
          created_at?: string | null
          description?: string | null
          download_url?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          resource_type?: string | null
          target_audience?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          advisor_id?: string | null
          created_at?: string | null
          description?: string | null
          download_url?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          resource_type?: string | null
          target_audience?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advisor_resources_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_testimonials: {
        Row: {
          advisor_id: string | null
          created_at: string | null
          founder_id: string | null
          id: string
          is_featured: boolean | null
          testimonial_text: string
        }
        Insert: {
          advisor_id?: string | null
          created_at?: string | null
          founder_id?: string | null
          id?: string
          is_featured?: boolean | null
          testimonial_text: string
        }
        Update: {
          advisor_id?: string | null
          created_at?: string | null
          founder_id?: string | null
          id?: string
          is_featured?: boolean | null
          testimonial_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_testimonials_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_testimonials_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      advisors: {
        Row: {
          application_id: string | null
          average_likelihood_to_recommend: number | null
          average_session_rating: number | null
          badge_level: string | null
          created_at: string | null
          email: string | null
          expertise_areas: string[] | null
          founders_mentored: number | null
          full_name: string
          id: string
          linkedin_url: string | null
          location_city: string | null
          location_country: string | null
          notes: string | null
          overall_score: number | null
          satisfaction_score: number | null
          sessions_completed: number | null
          status: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          application_id?: string | null
          average_likelihood_to_recommend?: number | null
          average_session_rating?: number | null
          badge_level?: string | null
          created_at?: string | null
          email?: string | null
          expertise_areas?: string[] | null
          founders_mentored?: number | null
          full_name: string
          id?: string
          linkedin_url?: string | null
          location_city?: string | null
          location_country?: string | null
          notes?: string | null
          overall_score?: number | null
          satisfaction_score?: number | null
          sessions_completed?: number | null
          status?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          application_id?: string | null
          average_likelihood_to_recommend?: number | null
          average_session_rating?: number | null
          badge_level?: string | null
          created_at?: string | null
          email?: string | null
          expertise_areas?: string[] | null
          founders_mentored?: number | null
          full_name?: string
          id?: string
          linkedin_url?: string | null
          location_city?: string | null
          location_country?: string | null
          notes?: string | null
          overall_score?: number | null
          satisfaction_score?: number | null
          sessions_completed?: number | null
          status?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advisors_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "application_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      application_submissions: {
        Row: {
          application_type: string
          created_at: string
          email: string
          form_data: Json
          full_name: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          application_type: string
          created_at?: string
          email: string
          form_data: Json
          full_name: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          application_type?: string
          created_at?: string
          email?: string
          form_data?: Json
          full_name?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendars: {
        Row: {
          calendar_type: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          name: string
          url: string | null
        }
        Insert: {
          calendar_type?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          name: string
          url?: string | null
        }
        Update: {
          calendar_type?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          name?: string
          url?: string | null
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          content: Json | null
          created_at: string | null
          featured: boolean | null
          founder_id: string | null
          id: string
          published_at: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          featured?: boolean | null
          founder_id?: string | null
          id?: string
          published_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          featured?: boolean | null
          founder_id?: string | null
          id?: string
          published_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_studies_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string | null
          description: string | null
          form_type: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          form_type?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          form_type?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          url?: string | null
        }
        Relationships: []
      }
      founder_goals: {
        Row: {
          created_at: string | null
          founder_id: string | null
          goal_description: string | null
          goal_title: string
          id: string
          progress_percentage: number | null
          status: string | null
          target_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          founder_id?: string | null
          goal_description?: string | null
          goal_title: string
          id?: string
          progress_percentage?: number | null
          status?: string | null
          target_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          founder_id?: string | null
          goal_description?: string | null
          goal_title?: string
          id?: string
          progress_percentage?: number | null
          status?: string | null
          target_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "founder_goals_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_reflections: {
        Row: {
          content: string
          created_at: string | null
          founder_id: string | null
          id: string
          is_featured: boolean | null
          reflection_type: string | null
          shared_with_advisors: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          founder_id?: string | null
          id?: string
          is_featured?: boolean | null
          reflection_type?: string | null
          shared_with_advisors?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          founder_id?: string | null
          id?: string
          is_featured?: boolean | null
          reflection_type?: string | null
          shared_with_advisors?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "founder_reflections_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      founders: {
        Row: {
          application_id: string | null
          bottleneck_status: string | null
          created_at: string | null
          email: string | null
          full_name: string
          has_story: boolean | null
          has_testimonial: boolean | null
          id: string
          location_city: string | null
          location_country: string | null
          revenue_last_12_months: number | null
          sector: string | null
          stage: string | null
          startup_name: string | null
          team_size: number | null
          top_bottleneck: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          application_id?: string | null
          bottleneck_status?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          has_story?: boolean | null
          has_testimonial?: boolean | null
          id?: string
          location_city?: string | null
          location_country?: string | null
          revenue_last_12_months?: number | null
          sector?: string | null
          stage?: string | null
          startup_name?: string | null
          team_size?: number | null
          top_bottleneck?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          application_id?: string | null
          bottleneck_status?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          has_story?: boolean | null
          has_testimonial?: boolean | null
          id?: string
          location_city?: string | null
          location_country?: string | null
          revenue_last_12_months?: number | null
          sector?: string | null
          stage?: string | null
          startup_name?: string | null
          team_size?: number | null
          top_bottleneck?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "founders_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "application_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics: {
        Row: {
          active_advisors_count: number | null
          active_founders_count: number | null
          case_studies_ready: number | null
          created_at: string | null
          date: string
          id: string
          sessions_this_month: number | null
          total_sessions_completed: number | null
        }
        Insert: {
          active_advisors_count?: number | null
          active_founders_count?: number | null
          case_studies_ready?: number | null
          created_at?: string | null
          date: string
          id?: string
          sessions_this_month?: number | null
          total_sessions_completed?: number | null
        }
        Update: {
          active_advisors_count?: number | null
          active_founders_count?: number | null
          case_studies_ready?: number | null
          created_at?: string | null
          date?: string
          id?: string
          sessions_this_month?: number | null
          total_sessions_completed?: number | null
        }
        Relationships: []
      }
      program_timeline: {
        Row: {
          advisors_involved: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          founders_involved: number | null
          id: string
          month_number: number
          start_date: string | null
          status: string | null
          title: string
        }
        Insert: {
          advisors_involved?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          founders_involved?: number | null
          id?: string
          month_number: number
          start_date?: string | null
          status?: string | null
          title: string
        }
        Update: {
          advisors_involved?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          founders_involved?: number | null
          id?: string
          month_number?: number
          start_date?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      session_notes: {
        Row: {
          action_items: Json | null
          ai_summary: string | null
          created_at: string | null
          created_by: string | null
          id: string
          key_insights: Json | null
          notes_content: string | null
          session_id: string | null
          updated_at: string | null
        }
        Insert: {
          action_items?: Json | null
          ai_summary?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          key_insights?: Json | null
          notes_content?: string | null
          session_id?: string | null
          updated_at?: string | null
        }
        Update: {
          action_items?: Json | null
          ai_summary?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          key_insights?: Json | null
          notes_content?: string | null
          session_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          advisor_id: string | null
          advisor_rating: number | null
          calendar_event_id: string | null
          created_at: string | null
          duration_minutes: number | null
          founder_id: string | null
          founder_testimonial: string | null
          id: string
          likelihood_to_recommend: number | null
          notes: string | null
          outcome: string | null
          rating: number | null
          session_date: string | null
          session_type: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          zoom_link: string | null
        }
        Insert: {
          advisor_id?: string | null
          advisor_rating?: number | null
          calendar_event_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          founder_id?: string | null
          founder_testimonial?: string | null
          id?: string
          likelihood_to_recommend?: number | null
          notes?: string | null
          outcome?: string | null
          rating?: number | null
          session_date?: string | null
          session_type?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          zoom_link?: string | null
        }
        Update: {
          advisor_id?: string | null
          advisor_rating?: number | null
          calendar_event_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          founder_id?: string | null
          founder_testimonial?: string | null
          id?: string
          likelihood_to_recommend?: number | null
          notes?: string | null
          outcome?: string | null
          rating?: number | null
          session_date?: string | null
          session_type?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          zoom_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "founders"
            referencedColumns: ["id"]
          },
        ]
      }
      to_dos: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          due_date: string | null
          id: string
          linked_entity_id: string | null
          linked_entity_type: string | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          linked_entity_id?: string | null
          linked_entity_type?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "to_dos_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          status: string | null
          tool_type: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          status?: string | null
          tool_type?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          status?: string | null
          tool_type?: string | null
          url?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          role: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      current_platform_totals: {
        Row: {
          case_studies_ready: number | null
          sessions_this_month: number | null
          total_active_advisors: number | null
          total_active_founders: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_application: {
        Args: { application_id: string; reviewer_id: string }
        Returns: Json
      }
      calculate_advisor_performance: {
        Args: { advisor_uuid: string }
        Returns: {
          avg_rating: number
          avg_likelihood: number
          overall_score: number
          badge_level: string
        }[]
      }
      calculate_monthly_metrics_comparison: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_month_founders: number
          previous_month_founders: number
          current_month_advisors: number
          previous_month_advisors: number
          current_month_sessions: number
          previous_month_sessions: number
          current_month_case_studies: number
          previous_month_case_studies: number
        }[]
      }
      reject_application: {
        Args: { application_id: string; reviewer_id: string; reason: string }
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
