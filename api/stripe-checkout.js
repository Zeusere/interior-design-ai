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
  console.log('=== STRIPE CHECKOUT START ===')
  console.log('Method:', req.method)
  console.log('Body:', req.body)
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { planType, userId, userEmail, successUrl, cancelUrl } = req.body
    console.log('Extracted data:', { planType, userId, userEmail, successUrl, cancelUrl })

    if (!planType || !userId || !userEmail) {
      console.log('Missing required fields')
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Verificar variables de entorno
    console.log('Environment check:', {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SET' : 'MISSING',
      STRIPE_MONTHLY_PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID ? 'SET' : 'MISSING',
      STRIPE_YEARLY_PRICE_ID: process.env.STRIPE_YEARLY_PRICE_ID ? 'SET' : 'MISSING',
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'
    })

    if (!PRICE_IDS[planType]) {
      console.log('Invalid plan type:', planType)
      return res.status(400).json({ error: 'Invalid plan type' })
    }

    console.log('Price ID for plan:', PRICE_IDS[planType])

    // Verificar si el usuario ya existe en la base de datos
    console.log('Checking existing user in Supabase...')
    const { data: existingUser, error: supabaseError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (supabaseError && supabaseError.code !== 'PGRST116') {
      console.log('Supabase error:', supabaseError)
      throw supabaseError
    }

    console.log('Existing user:', existingUser)
    let customerId = existingUser?.stripe_customer_id

    // Verificar si el customer ID existe en Stripe
    if (customerId) {
      try {
        console.log('Verifying existing Stripe customer:', customerId)
        await stripe.customers.retrieve(customerId)
        console.log('Customer exists in Stripe')
      } catch (customerError) {
        console.log('Customer not found in Stripe, will create new one:', customerError.message)
        customerId = null
        
        // Limpiar customer ID inválido de la base de datos
        if (existingUser) {
          console.log('Cleaning up invalid customer ID from database...')
          await supabase
            .from('user_subscriptions')
            .update({ 
              stripe_customer_id: null,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
        }
      }
    }

    // Si no existe customer en Stripe, crear uno
    if (!customerId) {
      console.log('Creating new Stripe customer...')
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId
        }
      })
      customerId = customer.id
      console.log('Stripe customer created:', customerId)

      // Guardar o actualizar en la base de datos
      console.log('Saving customer to Supabase...')
      
      if (existingUser) {
        // Usuario existe, actualizar solo el customer ID
        console.log('Updating existing user with new customer ID...')
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({ 
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (updateError) {
          console.log('Supabase update error:', updateError)
          throw updateError
        }
        console.log('User updated successfully')
      } else {
        // Usuario no existe, crear uno nuevo
        console.log('Creating new user...')
        const { error: insertError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: userId,
            stripe_customer_id: customerId,
            email: userEmail,
            plan: 'free',
            usage_count: 0,
            max_usage: 5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.log('Supabase insert error:', insertError)
          throw insertError
        }
        console.log('New user created successfully')
      }
    }

    // Crear sesión de checkout
    console.log('Creating Stripe checkout session...')
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

    console.log('Checkout session created successfully:', session.id)
    res.status(200).json({ sessionId: session.id })
    
  } catch (error) {
    console.error('Error creating checkout session:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({ error: 'Internal server error' })
  }
}
