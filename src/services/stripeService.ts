import { loadStripe } from '@stripe/stripe-js'

// Configurar con tu clave pública de Stripe
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY
console.log('Stripe public key loaded:', stripePublicKey ? 'SET' : 'MISSING')
console.log('Stripe public key starts with:', stripePublicKey?.substring(0, 7) || 'UNDEFINED')

const stripePromise = loadStripe(stripePublicKey)

export interface CreateSubscriptionRequest {
  planType: 'monthly' | 'yearly'
  userId: string
  userEmail: string
  successUrl: string
  cancelUrl: string
}

export interface SubscriptionStatus {
  isActive: boolean
  plan: 'free' | 'monthly' | 'yearly'
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
  usageCount: number
  maxUsage: number
}

class StripeService {
  private get baseUrl(): string {
    // Si VITE_API_URL está definido, usarlo
    if (import.meta.env.VITE_API_URL) {
      const url = import.meta.env.VITE_API_URL
      // Eliminar barra final si existe
      return url.endsWith('/') ? url.slice(0, -1) : url
    }
    
    // Si no, usar la URL actual (mismo dominio)
    return window.location.origin
  }

  async createCheckoutSession(request: CreateSubscriptionRequest): Promise<string> {
    try {
      const url = `${this.baseUrl}/api/stripe-checkout`
      console.log('Making request to:', url)
      console.log('Request payload:', request)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Error creating checkout session: ${response.status} ${errorText}`)
      }

      const { sessionId } = await response.json()
      console.log('Session ID received:', sessionId)
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe not loaded')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }

      return sessionId
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/subscription-status?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error('Error fetching subscription status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching subscription status:', error)
      // Return default free status if error
      return {
        isActive: false,
        plan: 'free' as const,
        usageCount: 0,
        maxUsage: 5
      }
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('Error canceling subscription')
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  async updateUsageCount(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/update-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      if (response.status === 403) {
        throw new Error('Usage limit exceeded')
      }

      if (!response.ok) {
        throw new Error('Error updating usage count')
      }
    } catch (error) {
      console.error('Error updating usage count:', error)
      throw error
    }
  }

  // Utility functions
  getPlanDisplayName(plan: string): string {
    switch (plan) {
      case 'monthly':
        return 'Pro Mensual'
      case 'yearly':
        return 'Pro Anual'
      default:
        return 'Gratis'
    }
  }

  getPlanPrice(plan: string): number {
    switch (plan) {
      case 'monthly':
        return 19
      case 'yearly':
        return 149
      default:
        return 0
    }
  }

  isProPlan(plan: string): boolean {
    return plan === 'monthly' || plan === 'yearly'
  }

  canUseFeature(subscriptionStatus: SubscriptionStatus): boolean {
    // Si tiene suscripción activa, puede usar ilimitadamente
    if (subscriptionStatus.isActive && this.isProPlan(subscriptionStatus.plan)) {
      return true
    }
    
    // Si es plan gratuito, verificar límite de uso
    return subscriptionStatus.usageCount < subscriptionStatus.maxUsage
  }
}

export const stripeService = new StripeService()
