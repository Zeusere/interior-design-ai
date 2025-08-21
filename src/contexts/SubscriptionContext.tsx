import { createContext, useContext, useState, useEffect } from 'react'
import { stripeService, type SubscriptionStatus } from '../services/stripeService'
import { useAuth } from './AuthContext'

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus | null
  isLoading: boolean
  error: string | null
  checkUsageLimit: () => Promise<boolean>
  incrementUsage: () => Promise<boolean>
  refreshSubscription: () => Promise<void>
  upgradeToProModal: boolean
  setUpgradeToProModal: (show: boolean) => void
  handleUpgrade: (planType: 'monthly' | 'yearly') => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

interface SubscriptionProviderProps {
  children: React.ReactNode
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [upgradeToProModal, setUpgradeToProModal] = useState(false)

  // Cargar estado de suscripción cuando el usuario se autentica
  useEffect(() => {
    if (user?.id) {
      loadSubscriptionStatus()
    } else {
      setSubscriptionStatus(null)
      setIsLoading(false)
    }
  }, [user?.id])

  const loadSubscriptionStatus = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)
      const status = await stripeService.getSubscriptionStatus(user.id)
      setSubscriptionStatus(status)
    } catch (err) {
      console.error('Error loading subscription status:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      // Set default free status if error
      setSubscriptionStatus({
        isActive: false,
        plan: 'free' as const,
        usageCount: 0,
        maxUsage: 5
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSubscription = async () => {
    await loadSubscriptionStatus()
  }

  const checkUsageLimit = async (): Promise<boolean> => {
    // Esta función ahora es principalmente para uso interno del contexto
    // La verificación real se hace en el backend durante incrementUsage
    if (!subscriptionStatus) {
      await loadSubscriptionStatus()
    }

    if (!subscriptionStatus) {
      return false
    }

    return stripeService.canUseFeature(subscriptionStatus)
  }

  const incrementUsage = async (): Promise<boolean> => {
    if (!user?.id) {
      return false
    }

    try {
      // Si es usuario Pro, permitir uso sin incrementar contador
      if (subscriptionStatus?.isActive && stripeService.isProPlan(subscriptionStatus.plan)) {
        return true
      }

      // Para usuarios gratuitos, intentar incrementar contador (el backend verifica límites)
      await stripeService.updateUsageCount(user.id)
      
      // Recargar estado después del incremento exitoso
      await loadSubscriptionStatus()
      
      return true
      
    } catch (err) {
      console.error('Error incrementing usage:', err)
      
      // Si el error es por límite alcanzado, mostrar modal
      if (err instanceof Error && (err.message.includes('Usage limit exceeded') || err.message.includes('403'))) {
        setUpgradeToProModal(true)
        return false
      }
      
      setError(err instanceof Error ? err.message : 'Error al actualizar uso')
      return false
    }
  }

  const handleUpgrade = async (planType: 'monthly' | 'yearly') => {
    if (!user?.id || !user?.email) {
      setError('Usuario no autenticado')
      return
    }

    try {
      const currentUrl = window.location.origin
      await stripeService.createCheckoutSession({
        planType,
        userId: user.id,
        userEmail: user.email,
        successUrl: `${currentUrl}/app?success=true`,
        cancelUrl: `${currentUrl}/app?canceled=true`
      })
    } catch (err) {
      console.error('Error creating checkout session:', err)
      setError(err instanceof Error ? err.message : 'Error al crear sesión de pago')
    }
  }

  const value: SubscriptionContextType = {
    subscriptionStatus,
    isLoading,
    error,
    checkUsageLimit,
    incrementUsage,
    refreshSubscription,
    upgradeToProModal,
    setUpgradeToProModal,
    handleUpgrade
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

// Helper hooks para usar en componentes
export const useCanUseFeature = () => {
  const { subscriptionStatus } = useSubscription()
  
  if (!subscriptionStatus) {
    return false
  }
  
  return stripeService.canUseFeature(subscriptionStatus)
}

// Hook para verificar si puede generar nuevas imágenes
export const useCanGenerateImages = () => {
  const { subscriptionStatus } = useSubscription()
  
  if (!subscriptionStatus) {
    return false
  }
  
  return stripeService.canUseFeature(subscriptionStatus)
}

// Hook para verificar si puede ver proyectos existentes (siempre true)
export const useCanViewProjects = () => {
  // Los usuarios siempre pueden ver sus proyectos existentes
  return true
}

// Hook para verificar si puede guardar proyectos (siempre true si está autenticado)
export const useCanSaveProjects = () => {
  const { user } = useAuth()
  return !!user // Solo necesita estar autenticado
}

export const useIsProUser = () => {
  const { subscriptionStatus } = useSubscription()
  
  if (!subscriptionStatus) {
    return false
  }
  
  return subscriptionStatus.isActive && stripeService.isProPlan(subscriptionStatus.plan)
}

export const useUsageInfo = () => {
  const { subscriptionStatus } = useSubscription()
  
  if (!subscriptionStatus) {
    return { current: 0, max: 5, percentage: 0 }
  }
  
  const current = subscriptionStatus.usageCount
  const max = subscriptionStatus.maxUsage
  const percentage = max > 0 ? (current / max) * 100 : 0
  
  return { current, max, percentage }
}
