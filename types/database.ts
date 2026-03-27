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
          email: string | null
          full_name: string | null
          avatar_url: string | null
          credits: number
          lemon_squeezy_customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          variant_id: string | null
          created_at: string
          updated_at: string
          is_admin: boolean
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          lemon_squeezy_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          variant_id?: string | null
          created_at?: string
          updated_at?: string
          is_admin?: boolean
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          lemon_squeezy_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          variant_id?: string | null
          created_at?: string
          updated_at?: string
          is_admin?: boolean
        }
        Relationships: []
      }
      videos: {
        Row: {
          id: string
          user_id: string
          prompt: string
          video_url: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          duration: number
          fal_job_id: string | null
          script: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          video_url?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          duration?: number
          fal_job_id?: string | null
          script?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          video_url?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          duration?: number
          fal_job_id?: string | null
          script?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_logs: {
        Row: {
          id: string
          user_id: string
          amount: number
          reason: string | null
          admin_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          reason?: string | null
          admin_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          reason?: string | null
          admin_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Enums: {
      video_status: 'pending' | 'processing' | 'completed' | 'failed'
    }
    Functions: {
      deduct_credits: {
        Args: {
          p_user_id: string
          p_amount: number
        }
        Returns: number
      }
      increment_credits: {
        Args: {
          p_user_id: string
          p_amount: number
        }
        Returns: number
      }
    }
  }
}
