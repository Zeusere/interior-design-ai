export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_status: 'trial' | 'active' | 'cancelled' | 'expired'
          subscription_type: 'monthly' | 'annual' | null
          subscription_expires_at: string | null
          trial_expires_at: string | null
          credits_remaining: number
          total_images_processed: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_status?: 'trial' | 'active' | 'cancelled' | 'expired'
          subscription_type?: 'monthly' | 'annual' | null
          subscription_expires_at?: string | null
          trial_expires_at?: string | null
          credits_remaining?: number
          total_images_processed?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_status?: 'trial' | 'active' | 'cancelled' | 'expired'
          subscription_type?: 'monthly' | 'annual' | null
          subscription_expires_at?: string | null
          trial_expires_at?: string | null
          credits_remaining?: number
          total_images_processed?: number
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          property_type: 'residential' | 'commercial' | 'office' | 'hotel' | 'restaurant'
          address: string | null
          status: 'active' | 'completed' | 'archived'
          cover_image_url: string | null
          total_images: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          property_type?: 'residential' | 'commercial' | 'office' | 'hotel' | 'restaurant'
          address?: string | null
          status?: 'active' | 'completed' | 'archived'
          cover_image_url?: string | null
          total_images?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          property_type?: 'residential' | 'commercial' | 'office' | 'hotel' | 'restaurant'
          address?: string | null
          status?: 'active' | 'completed' | 'archived'
          cover_image_url?: string | null
          total_images?: number
          created_at?: string
          updated_at?: string
        }
      }
      images: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          original_url: string
          processed_url: string | null
          enhanced_url: string | null
          room_type: string
          style_applied: string | null
          processing_options: any | null
          processing_status: 'pending' | 'processing' | 'completed' | 'failed'
          file_size_mb: number | null
          dimensions: any | null
          is_temporary: boolean
          auto_delete_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          original_url: string
          processed_url?: string | null
          enhanced_url?: string | null
          room_type: string
          style_applied?: string | null
          processing_options?: any | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          file_size_mb?: number | null
          dimensions?: any | null
          is_temporary?: boolean
          auto_delete_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          original_url?: string
          processed_url?: string | null
          enhanced_url?: string | null
          room_type?: string
          style_applied?: string | null
          processing_options?: any | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          file_size_mb?: number | null
          dimensions?: any | null
          is_temporary?: boolean
          auto_delete_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      billing_history: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          stripe_payment_intent_id: string | null
          amount_cents: number
          currency: string
          status: 'pending' | 'succeeded' | 'failed' | 'cancelled'
          subscription_type: 'monthly' | 'annual' | null
          period_start: string | null
          period_end: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          stripe_payment_intent_id?: string | null
          amount_cents: number
          currency?: string
          status: 'pending' | 'succeeded' | 'failed' | 'cancelled'
          subscription_type?: 'monthly' | 'annual' | null
          period_start?: string | null
          period_end?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          stripe_payment_intent_id?: string | null
          amount_cents?: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed' | 'cancelled'
          subscription_type?: 'monthly' | 'annual' | null
          period_start?: string | null
          period_end?: string | null
          created_at?: string
        }
      }
      credit_usage: {
        Row: {
          id: string
          user_id: string
          image_id: string | null
          action_type: 'design_generation' | 'image_enhancement'
          credits_used: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_id?: string | null
          action_type: 'design_generation' | 'image_enhancement'
          credits_used?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_id?: string | null
          action_type?: 'design_generation' | 'image_enhancement'
          credits_used?: number
          created_at?: string
        }
      }
    }
    Views: {
      user_stats: {
        Row: {
          id: string | null
          email: string | null
          subscription_status: string | null
          credits_remaining: number | null
          total_images_processed: number | null
          total_projects: number | null
          total_images: number | null
          images_last_30_days: number | null
        }
      }
    }
    Functions: {
      cleanup_expired_images: {
        Args: {}
        Returns: number
      }
    }
  }
}

// Tipos de conveniencia para uso en la aplicación
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type ImageRecord = Database['public']['Tables']['images']['Row']
export type BillingHistory = Database['public']['Tables']['billing_history']['Row']
export type CreditUsage = Database['public']['Tables']['credit_usage']['Row']
export type UserStats = Database['public']['Views']['user_stats']['Row']

// Tipos para inserts
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ImageInsert = Database['public']['Tables']['images']['Insert']
