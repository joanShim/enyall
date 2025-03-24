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
      artists: {
        Row: {
          debut_date: string | null
          id: string
          name_en: string | null
          name_ko: string | null
          name_official: string
          profile_image_url: string | null
        }
        Insert: {
          debut_date?: string | null
          id?: string
          name_en?: string | null
          name_ko?: string | null
          name_official?: string
          profile_image_url?: string | null
        }
        Update: {
          debut_date?: string | null
          id?: string
          name_en?: string | null
          name_ko?: string | null
          name_official?: string
          profile_image_url?: string | null
        }
        Relationships: []
      }
      concert_schedules: {
        Row: {
          concert_id: string | null
          created_at: string | null
          id: string
          schedule_date: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          concert_id?: string | null
          created_at?: string | null
          id?: string
          schedule_date: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          concert_id?: string | null
          created_at?: string | null
          id?: string
          schedule_date?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concert_schedules_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "concerts"
            referencedColumns: ["id"]
          },
        ]
      }
      concerts: {
        Row: {
          created_at: string | null
          id: string
          poster_url: string | null
          ticket_link: string | null
          title: string
          tour_id: string | null
          updated_at: string | null
          venue_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          poster_url?: string | null
          ticket_link?: string | null
          title: string
          tour_id?: string | null
          updated_at?: string | null
          venue_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          poster_url?: string | null
          ticket_link?: string | null
          title?: string
          tour_id?: string | null
          updated_at?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "concerts_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tours: {
        Row: {
          created_at: string | null
          id: string
          poster_url: string | null
          title: string
          title_en: string | null
          title_ko: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          poster_url?: string | null
          title: string
          title_en?: string | null
          title_ko?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          poster_url?: string | null
          title?: string
          title_en?: string | null
          title_ko?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string
          created_at: string
          email: string
          favorites: string[]
          follower_count: number | null
          following_count: number | null
          id: string
          name: string
        }
        Insert: {
          avatar_url?: string
          created_at?: string
          email?: string
          favorites: string[]
          follower_count?: number | null
          following_count?: number | null
          id?: string
          name?: string
        }
        Update: {
          avatar_url?: string
          created_at?: string
          email?: string
          favorites?: string[]
          follower_count?: number | null
          following_count?: number | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string
          capacity: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          address: string
          capacity?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          capacity?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
