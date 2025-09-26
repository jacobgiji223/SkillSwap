export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          username: string | null
          bio: string | null
          avatar_url: string | null
          credits: number
          is_ngo_volunteer: boolean
          location_name: string | null
          location_coordinates: unknown | null
          skills_taught: number
          skills_learned: number
          average_rating: number
          total_reviews: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          username?: string | null
          bio?: string | null
          avatar_url?: string | null
          credits?: number
          is_ngo_volunteer?: boolean
          location_name?: string | null
          location_coordinates?: unknown | null
          skills_taught?: number
          skills_learned?: number
          average_rating?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          username?: string | null
          bio?: string | null
          avatar_url?: string | null
          credits?: number
          is_ngo_volunteer?: boolean
          location_name?: string | null
          location_coordinates?: unknown | null
          skills_taught?: number
          skills_learned?: number
          average_rating?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          credits_per_hour: number
          max_duration_hours: number | null
          is_active: boolean
          location_coordinates: unknown | null
          location_name: string | null
          embedding: number[] | null
          tags: string[] | null
          difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: string
          credits_per_hour: number
          max_duration_hours?: number | null
          is_active?: boolean
          location_coordinates?: unknown | null
          location_name?: string | null
          embedding?: number[] | null
          tags?: string[] | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          credits_per_hour?: number
          max_duration_hours?: number | null
          is_active?: boolean
          location_coordinates?: unknown | null
          location_name?: string | null
          embedding?: number[] | null
          tags?: string[] | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | null
          created_at?: string
          updated_at?: string
        }
      }
      swaps: {
        Row: {
          id: string
          skill_id: string
          teacher_id: string
          learner_id: string
          status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'declined' | 'cancelled'
          scheduled_at: string | null
          duration_hours: number
          total_credits: number
          message: string | null
          meeting_type: 'in_person' | 'online' | 'hybrid' | null
          meeting_details: Json | null
          completion_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          skill_id: string
          teacher_id: string
          learner_id: string
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'declined' | 'cancelled'
          scheduled_at?: string | null
          duration_hours: number
          total_credits: number
          message?: string | null
          meeting_type?: 'in_person' | 'online' | 'hybrid' | null
          meeting_details?: Json | null
          completion_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          skill_id?: string
          teacher_id?: string
          learner_id?: string
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'declined' | 'cancelled'
          scheduled_at?: string | null
          duration_hours?: number
          total_credits?: number
          message?: string | null
          meeting_type?: 'in_person' | 'online' | 'hybrid' | null
          meeting_details?: Json | null
          completion_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          swap_id: string | null
          participant_1: string
          participant_2: string
          last_message_at: string
          created_at: string
        }
        Insert: {
          id?: string
          swap_id?: string | null
          participant_1: string
          participant_2: string
          last_message_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          swap_id?: string | null
          participant_1?: string
          participant_2?: string
          last_message_at?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          content: string
          message_type: 'text' | 'image' | 'file'
          file_url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          content: string
          message_type?: 'text' | 'image' | 'file'
          file_url?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          content?: string
          message_type?: 'text' | 'image' | 'file'
          file_url?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          from_user_id: string | null
          to_user_id: string
          swap_id: string | null
          amount: number
          transaction_type: 'swap_payment' | 'signup_bonus' | 'referral_bonus' | 'admin_adjustment'
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id?: string | null
          to_user_id: string
          swap_id?: string | null
          amount: number
          transaction_type: 'swap_payment' | 'signup_bonus' | 'referral_bonus' | 'admin_adjustment'
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string | null
          to_user_id?: string
          swap_id?: string | null
          amount?: number
          transaction_type?: 'swap_payment' | 'signup_bonus' | 'referral_bonus' | 'admin_adjustment'
          description?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          swap_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
          review_type: 'as_teacher' | 'as_learner'
          created_at: string
        }
        Insert: {
          id?: string
          swap_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
          review_type: 'as_teacher' | 'as_learner'
          created_at?: string
        }
        Update: {
          id?: string
          swap_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string | null
          review_type?: 'as_teacher' | 'as_learner'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_skills_nearby: {
        Args: {
          user_lat: number
          user_lng: number
          radius_km?: number
          skill_category?: string
          limit_count?: number
        }
        Returns: {
          id: string
          title: string
          description: string
          category: string
          credits_per_hour: number
          user_name: string
          user_avatar: string
          distance_km: number
          location_name: string
        }[]
      }
      handle_swap_completion: {
        Args: {
          swap_uuid: string
        }
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