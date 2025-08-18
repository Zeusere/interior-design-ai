import { createClient } from '@supabase/supabase-js'
// import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función para el registro con email y contraseña
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })
  return { data, error }
}

// Función para el login con email y contraseña
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// Función para login con Google
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

// Función para logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Función para reset de contraseña
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })
  return { data, error }
}

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Función para obtener el perfil del usuario
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

// Función para actualizar el perfil
export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

// Función para verificar suscripción activa
export const checkActiveSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_expires_at, trial_expires_at, credits_remaining')
    .eq('id', userId)
    .single()
  
  if (error) return { isActive: false, error }
  
  const now = new Date()
  const isTrialActive = data.trial_expires_at ? new Date(data.trial_expires_at) > now : false
  const isSubscriptionActive = data.subscription_status === 'active' && 
    data.subscription_expires_at ? new Date(data.subscription_expires_at) > now : false
  
  return {
    isActive: isTrialActive || isSubscriptionActive,
    subscriptionStatus: data.subscription_status,
    creditsRemaining: data.credits_remaining,
    trialExpiresAt: data.trial_expires_at,
    subscriptionExpiresAt: data.subscription_expires_at
  }
}
