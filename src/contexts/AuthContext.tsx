import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, getUserProfile, checkActiveSubscription } from '../lib/supabase'
// import type { Profile } from '../types/database'

// Temporary Profile type until we set up the database
interface Profile {
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

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  subscriptionInfo: {
    isActive: boolean
    subscriptionStatus?: string
    creditsRemaining?: number
    trialExpiresAt?: string | null
    subscriptionExpiresAt?: string | null
  }
  refreshSubscription: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionInfo, setSubscriptionInfo] = useState({
    isActive: false,
    subscriptionStatus: undefined,
    creditsRemaining: undefined,
    trialExpiresAt: null,
    subscriptionExpiresAt: null
  })

  const refreshProfile = async () => {
    if (!user) return
    
    try {
      const { data: profileData, error } = await getUserProfile(user.id)
      if (error) {
        console.error('Error fetching profile:', error)
        return
      }
      
      setProfile(profileData)
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }

  const refreshSubscription = async () => {
    if (!user) return
    
    try {
      const subscriptionData = await checkActiveSubscription(user.id)
      if ('error' in subscriptionData) {
        console.error('Error checking subscription:', subscriptionData.error)
        return
      }
      setSubscriptionInfo(subscriptionData)
    } catch (error) {
      console.error('Error refreshing subscription:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        return
      }
      
      setUser(null)
      setProfile(null)
      setSession(null)
      setSubscriptionInfo({
        isActive: false,
        subscriptionStatus: undefined,
        creditsRemaining: undefined,
        trialExpiresAt: null,
        subscriptionExpiresAt: null
      })
    } catch (error) {
      console.error('Error in signOut:', error)
    }
  }

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await refreshProfile()
          await refreshSubscription()
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Usuario logueado - cargar perfil y suscripción
          await refreshProfile()
          await refreshSubscription()
        } else {
          // Usuario deslogueado - limpiar estado
          setProfile(null)
          setSubscriptionInfo({
            isActive: false,
            subscriptionStatus: undefined,
            creditsRemaining: undefined,
            trialExpiresAt: null,
            subscriptionExpiresAt: null
          })
        }

        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Refrescar perfil y suscripción cada 5 minutos para usuarios activos
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      refreshProfile()
      refreshSubscription()
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [user])

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signOut: handleSignOut,
    refreshProfile,
    subscriptionInfo,
    refreshSubscription
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para verificar si el usuario puede realizar acciones
export const useSubscriptionCheck = () => {
  const { subscriptionInfo, user } = useAuth()
  
  const canPerformAction = (creditsRequired: number = 1) => {
    if (!user) return false
    
    // Si la suscripción está activa, permitir acción
    if (subscriptionInfo.isActive && subscriptionInfo.subscriptionStatus === 'active') {
      return true
    }
    
    // Si está en trial y tiene créditos suficientes
    if (subscriptionInfo.isActive && 
        subscriptionInfo.creditsRemaining !== undefined && 
        subscriptionInfo.creditsRemaining >= creditsRequired) {
      return true
    }
    
    return false
  }
  
  const getRemainingCredits = () => {
    return subscriptionInfo.creditsRemaining || 0
  }
  
  const isTrialUser = () => {
    return subscriptionInfo.subscriptionStatus === 'trial'
  }
  
  const isActiveSubscriber = () => {
    return subscriptionInfo.subscriptionStatus === 'active'
  }
  
  return {
    canPerformAction,
    getRemainingCredits,
    isTrialUser,
    isActiveSubscriber,
    subscriptionInfo
  }
}
