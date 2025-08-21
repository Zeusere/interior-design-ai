import Stripe from 'stripe'

export default async function handler(req, res) {
  try {
    console.log('=== STRIPE DEBUG START ===')
    
    // 1. Verificar variables de entorno
    const envCheck = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SET' : 'MISSING',
      STRIPE_MONTHLY_PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID ? 'SET' : 'MISSING',
      STRIPE_YEARLY_PRICE_ID: process.env.STRIPE_YEARLY_PRICE_ID ? 'SET' : 'MISSING'
    }
    
    console.log('Environment check:', envCheck)
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        error: 'STRIPE_SECRET_KEY missing'
      })
    }
    
    // 2. Crear cliente Stripe
    console.log('Creating Stripe client...')
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
    console.log('Stripe client created successfully')
    
    // 3. Test básico - listar productos
    console.log('Testing Stripe connection...')
    const products = await stripe.products.list({ limit: 1 })
    
    console.log('Stripe test successful:', {
      productsCount: products.data.length,
      firstProduct: products.data[0]?.name || 'None'
    })
    
    res.status(200).json({
      success: true,
      environment: envCheck,
      stripeConnection: 'OK',
      productsCount: products.data.length
    })
    
  } catch (error) {
    console.error('STRIPE DEBUG ERROR:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      step: 'stripe_test_failed'
    })
  }
}
