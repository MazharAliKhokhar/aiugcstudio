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
        }
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
      }
    }
    Enums: {
      video_status: 'pending' | 'processing' | 'completed' | 'failed'
    }
  }
}
