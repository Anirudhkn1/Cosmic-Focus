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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      celestial_objects: {
        Row: {
          attribution: string | null
          branch_order: number
          created_at: string
          description: string | null
          diameter: string | null
          distance_unit: string
          facts: Json
          id: string
          image_source: string | null
          image_url: string | null
          journey_index: number
          name: string
          orbital_period: string | null
          parent_id: string | null
          real_distance_from_sun: number
          route_category: string
          route_order: number
          source_url: string | null
          temperature: string | null
          type: string
        }
        Insert: {
          attribution?: string | null
          branch_order?: number
          created_at?: string
          description?: string | null
          diameter?: string | null
          distance_unit?: string
          facts?: Json
          id: string
          image_source?: string | null
          image_url?: string | null
          journey_index: number
          name: string
          orbital_period?: string | null
          parent_id?: string | null
          real_distance_from_sun: number
          route_category: string
          route_order: number
          source_url?: string | null
          temperature?: string | null
          type: string
        }
        Update: {
          attribution?: string | null
          branch_order?: number
          created_at?: string
          description?: string | null
          diameter?: string | null
          distance_unit?: string
          facts?: Json
          id?: string
          image_source?: string | null
          image_url?: string | null
          journey_index?: number
          name?: string
          orbital_period?: string | null
          parent_id?: string | null
          real_distance_from_sun?: number
          route_category?: string
          route_order?: number
          source_url?: string | null
          temperature?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "celestial_objects_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "celestial_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      discoveries: {
        Row: {
          discovered_at: string
          object_id: string
          user_id: string
        }
        Insert: {
          discovered_at?: string
          object_id: string
          user_id: string
        }
        Update: {
          discovered_at?: string
          object_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discoveries_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "celestial_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      focus_sessions: {
        Row: {
          actual_duration: number
          created_at: string
          destination_reached: boolean
          end_time: string | null
          ending_progress: number
          id: string
          method: string
          paused_at: string | null
          paused_duration: number
          planned_duration: number | null
          segment_id: string | null
          segment_start_elapsed: number
          start_time: string
          starting_progress: number
          status: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          actual_duration?: number
          created_at?: string
          destination_reached?: boolean
          end_time?: string | null
          ending_progress?: number
          id?: string
          method: string
          paused_at?: string | null
          paused_duration?: number
          planned_duration?: number | null
          segment_id?: string | null
          segment_start_elapsed?: number
          start_time?: string
          starting_progress?: number
          status?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          actual_duration?: number
          created_at?: string
          destination_reached?: boolean
          end_time?: string | null
          ending_progress?: number
          id?: string
          method?: string
          paused_at?: string | null
          paused_duration?: number
          planned_duration?: number | null
          segment_id?: string | null
          segment_start_elapsed?: number
          start_time?: string
          starting_progress?: number
          status?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "focus_sessions_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "journey_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_segments: {
        Row: {
          active: boolean
          destination_object_id: string
          id: string
          required_focus_minutes: number
          segment_order: number
          start_object_id: string
          visual_end_position: number
          visual_start_position: number
        }
        Insert: {
          active?: boolean
          destination_object_id: string
          id: string
          required_focus_minutes: number
          segment_order: number
          start_object_id: string
          visual_end_position: number
          visual_start_position: number
        }
        Update: {
          active?: boolean
          destination_object_id?: string
          id?: string
          required_focus_minutes?: number
          segment_order?: number
          start_object_id?: string
          visual_end_position?: number
          visual_start_position?: number
        }
        Relationships: [
          {
            foreignKeyName: "journey_segments_destination_object_id_fkey"
            columns: ["destination_object_id"]
            isOneToOne: false
            referencedRelation: "celestial_objects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_segments_start_object_id_fkey"
            columns: ["start_object_id"]
            isOneToOne: false
            referencedRelation: "celestial_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string
          break_beep_enabled: boolean
          completed_sessions: number
          created_at: string
          current_streak: number
          display_name: string
          gender: string
          id: string
          last_focus_date: string | null
          leaderboard_visible: boolean
          level: number
          longest_streak: number
          onboarded: boolean
          rank: string
          sound_enabled: boolean
          total_focus_minutes: number
          updated_at: string
          xp: number
        }
        Insert: {
          avatar?: string
          break_beep_enabled?: boolean
          completed_sessions?: number
          created_at?: string
          current_streak?: number
          display_name?: string
          gender?: string
          id: string
          last_focus_date?: string | null
          leaderboard_visible?: boolean
          level?: number
          longest_streak?: number
          onboarded?: boolean
          rank?: string
          sound_enabled?: boolean
          total_focus_minutes?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          avatar?: string
          break_beep_enabled?: boolean
          completed_sessions?: number
          created_at?: string
          current_streak?: number
          display_name?: string
          gender?: string
          id?: string
          last_focus_date?: string | null
          leaderboard_visible?: boolean
          level?: number
          longest_streak?: number
          onboarded?: boolean
          rank?: string
          sound_enabled?: boolean
          total_focus_minutes?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      user_journey: {
        Row: {
          current_object_id: string
          current_segment_id: string | null
          segment_focus_minutes: number
          segment_progress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_object_id?: string
          current_segment_id?: string | null
          segment_focus_minutes?: number
          segment_progress?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_object_id?: string
          current_segment_id?: string | null
          segment_focus_minutes?: number
          segment_progress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_current_object_id_fkey"
            columns: ["current_object_id"]
            isOneToOne: false
            referencedRelation: "celestial_objects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_journey_current_segment_id_fkey"
            columns: ["current_segment_id"]
            isOneToOne: false
            referencedRelation: "journey_segments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      weekly_leaderboard: {
        Args: never
        Returns: {
          avatar: string
          display_name: string
          level: number
          rank: string
          user_id: string
          weekly_minutes: number
          weekly_xp: number
        }[]
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
