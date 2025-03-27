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
      artists_pending: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name_official: string
          submitted_by: string | null
          verified_artist_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name_official: string
          submitted_by?: string | null
          verified_artist_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name_official?: string
          submitted_by?: string | null
          verified_artist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artists_pending_verified_artist_id_fkey"
            columns: ["verified_artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
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
      concert_schedules_pending: {
        Row: {
          concert_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          schedule_date: string
          start_time: string | null
          status: string | null
        }
        Insert: {
          concert_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          schedule_date: string
          start_time?: string | null
          status?: string | null
        }
        Update: {
          concert_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          schedule_date?: string
          start_time?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concert_schedules_pending_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "concerts_pending"
            referencedColumns: ["id"]
          },
        ]
      }
      concerts: {
        Row: {
          artists_json: Json | null
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
          artists_json?: Json | null
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
          artists_json?: Json | null
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
      concerts_artists: {
        Row: {
          artist_id: string | null
          concert_id: string | null
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          artist_id?: string | null
          concert_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          artist_id?: string | null
          concert_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concerts_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concerts_artists_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "concerts"
            referencedColumns: ["id"]
          },
        ]
      }
      concerts_artists_pending: {
        Row: {
          artist_id: string | null
          artist_pending_id: string | null
          concert_id: string | null
          concert_pending_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          start_time: string | null
          status: string | null
        }
        Insert: {
          artist_id?: string | null
          artist_pending_id?: string | null
          concert_id?: string | null
          concert_pending_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          start_time?: string | null
          status?: string | null
        }
        Update: {
          artist_id?: string | null
          artist_pending_id?: string | null
          concert_id?: string | null
          concert_pending_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          start_time?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concerts_artists_pending_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concerts_artists_pending_artist_pending_id_fkey"
            columns: ["artist_pending_id"]
            isOneToOne: false
            referencedRelation: "artists_pending"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concerts_artists_pending_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "concerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concerts_artists_pending_concert_pending_id_fkey"
            columns: ["concert_pending_id"]
            isOneToOne: false
            referencedRelation: "concerts_pending"
            referencedColumns: ["id"]
          },
        ]
      }
      concerts_pending: {
        Row: {
          artists_json: Json | null
          concert_date: string
          created_at: string | null
          created_by: string | null
          id: string
          poster_url: string | null
          start_time: string | null
          submitted_by: string | null
          ticket_link: string | null
          title: string
          tour_id: string | null
          updated_at: string | null
          venue_id: string | null
          venue_pending_id: string | null
          verified_concert_id: string | null
        }
        Insert: {
          artists_json?: Json | null
          concert_date: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          poster_url?: string | null
          start_time?: string | null
          submitted_by?: string | null
          ticket_link?: string | null
          title: string
          tour_id?: string | null
          updated_at?: string | null
          venue_id?: string | null
          venue_pending_id?: string | null
          verified_concert_id?: string | null
        }
        Update: {
          artists_json?: Json | null
          concert_date?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          poster_url?: string | null
          start_time?: string | null
          submitted_by?: string | null
          ticket_link?: string | null
          title?: string
          tour_id?: string | null
          updated_at?: string | null
          venue_id?: string | null
          venue_pending_id?: string | null
          verified_concert_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concerts_pending_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concerts_pending_venue_pending_id_fkey"
            columns: ["venue_pending_id"]
            isOneToOne: false
            referencedRelation: "venues_pending"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concerts_pending_verified_concert_id_fkey"
            columns: ["verified_concert_id"]
            isOneToOne: false
            referencedRelation: "concerts"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          artist_id: string | null
          artist_pending_id: string | null
          concert_id: string | null
          concert_pending_id: string | null
          content: string
          created_at: string | null
          id: string
          rating: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          artist_id?: string | null
          artist_pending_id?: string | null
          concert_id?: string | null
          concert_pending_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          rating?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          artist_id?: string | null
          artist_pending_id?: string | null
          concert_id?: string | null
          concert_pending_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          rating?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_artist_pending_id_fkey"
            columns: ["artist_pending_id"]
            isOneToOne: false
            referencedRelation: "artists_pending"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_concert_id_fkey"
            columns: ["concert_id"]
            isOneToOne: false
            referencedRelation: "concerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_concert_pending_id_fkey"
            columns: ["concert_pending_id"]
            isOneToOne: false
            referencedRelation: "concerts_pending"
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
          address: string | null
          capacity: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          capacity?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          capacity?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      venues_pending: {
        Row: {
          address: string
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          submitted_by: string | null
          verified_venue_id: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          submitted_by?: string | null
          verified_venue_id?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          submitted_by?: string | null
          verified_venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_pending_verified_venue_id_fkey"
            columns: ["verified_venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
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
