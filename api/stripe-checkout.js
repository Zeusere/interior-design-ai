import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Configuración
const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Configuración de precios
const PRICE_IDS = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
  yearly: process.env.STRIPE_YEARLY_PRICE_ID
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { planType, userId, userEmail, successUrl, cancelUrl } = req.body

    if (!planType || !userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (!PRICE_IDS[planType]) {
      return res.status(400).json({ error: 'Invalid plan type' })
    }

    // Verificar si el usuario ya existe en la base de datos
    const { data: existingUser } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    let customerId = existingUser?.stripe_customer_id

    // Si no existe customer en Stripe, crear uno
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId
        }
      })
      customerId = customer.id

      // Guardar o actualizar en la base de datos
      await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          email: userEmail,
          plan: 'free',
          usage_count: 0,
          max_usage: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
    }

    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[planType],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        planType: planType
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      automatic_tax: {
        enabled: true,
      },
    })

    res.status(200).json({ sessionId: session.id })
    
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
