import { loadStripe } from '@stripe/stripe-js'

// Configurar con tu clave pública de Stripe
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY
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
  private baseUrl = import.meta.env.VITE_API_URL || ''

  async createCheckoutSession(request: CreateSubscriptionRequest): Promise<string> {
    try {
      console.log('Creating checkout session with:', request)
      console.log('Base URL:', this.baseUrl)
      console.log('API URL:', `${this.baseUrl}/api/stripe-checkout`)
      
      const response = await fetch(`${this.baseUrl}/api/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Error creating checkout session: ${response.status} - ${errorText}`)
      }

      const { sessionId } = await response.json()
      
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
      console.log('getSubscriptionStatus: fetching for userId:', userId)
      const response = await fetch(`${this.baseUrl}/api/subscription-status-simple?userId=${userId}`)
      
      console.log('getSubscriptionStatus: response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('getSubscriptionStatus: Error response:', errorText)
        throw new Error(`Error fetching subscription status: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('getSubscriptionStatus: success:', result)
      return result
    } catch (error) {
      console.error('Error fetching subscription status:', error)
      // Return default free status if error
      const defaultStatus: SubscriptionStatus = {
        isActive: false,
        plan: 'free' as const,
        usageCount: 0,
        maxUsage: 5
      }
      console.log('getSubscriptionStatus: returning default status:', defaultStatus)
      return defaultStatus
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
      console.log('updateUsageCount: calling API for userId:', userId)
      const response = await fetch(`${this.baseUrl}/api/update-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      })

      console.log('updateUsageCount: response status:', response.status)

      if (response.status === 403) {
        const errorData = await response.json()
        console.log('Usage limit exceeded:', errorData)
        throw new Error('Usage limit exceeded')
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('updateUsageCount: Error response:', errorText)
        throw new Error(`Error updating usage count: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('updateUsageCount: success:', result)
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
