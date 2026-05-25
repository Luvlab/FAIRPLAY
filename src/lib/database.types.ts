export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          home_team: string
          away_team: string
          home_score: number
          away_score: number
          minute: number
          status: 'pre' | 'live' | 'ht' | 'ft' | 'et' | 'pens'
          league_id: string
          venue_name: string
          venue_lat: number | null
          venue_lng: number | null
          date: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['games']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['games']['Insert']>
      }
      referee_calls: {
        Row: {
          id: string
          game_id: string
          call_id: string
          call_name: string
          minute: number
          user_id: string
          user_name: string
          is_official: boolean
          agree_count: number
          disagree_count: number
          lat: number | null
          lng: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['referee_calls']['Row'], 'id' | 'agree_count' | 'disagree_count' | 'created_at'>
        Update: Partial<Database['public']['Tables']['referee_calls']['Insert']>
      }
      match_media: {
        Row: {
          id: string
          game_id: string
          user_id: string
          type: 'image' | 'video'
          url: string
          minute: number
          caption: string | null
          lat: number | null
          lng: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['match_media']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['match_media']['Insert']>
      }
      local_leagues: {
        Row: {
          id: string
          name: string
          country: string
          age_group: string
          teams: string[]
          created_by: string
          is_public: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['local_leagues']['Row'], 'id' | 'is_public' | 'created_at'>
        Update: Partial<Database['public']['Tables']['local_leagues']['Insert']>
      }
      call_votes: {
        Row: {
          id: string
          call_id: string
          user_id: string
          vote: 'agree' | 'disagree'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['call_votes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['call_votes']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_vote: {
        Args: { p_call_id: string; p_col: string }
        Returns: void
      }
    }
    Enums: Record<string, never>
  }
}
