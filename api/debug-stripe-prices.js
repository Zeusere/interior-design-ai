import Stripe from 'stripe'

export default async function handler(req, res) {
  try {
    console.log('=== STRIPE PRICES DEBUG START ===')
    
    // 1. Verificar variables de entorno
    const envCheck = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SET' : 'MISSING',
      STRIPE_MONTHLY_PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID || 'NOT_SET',
      STRIPE_YEARLY_PRICE_ID: process.env.STRIPE_YEARLY_PRICE_ID || 'NOT_SET'
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
    
    // 3. Verificar modo (test vs live)
    const account = await stripe.accounts.retrieve()
    console.log('Stripe account mode:', account.object === 'account' ? 'Connected' : 'Direct')
    
    // 4. Listar todos los productos y precios
    console.log('Fetching all products and prices...')
    const products = await stripe.products.list({ limit: 10 })
    
    const prices = await stripe.prices.list({ limit: 20 })
    
    console.log('Products found:', products.data.length)
    console.log('Prices found:', prices.data.length)
    
    // 5. Verificar Price IDs específicos
    const monthlyPrice = await stripe.prices.retrieve(process.env.STRIPE_MONTHLY_PRICE_ID).catch(() => null)
    const yearlyPrice = await stripe.prices.retrieve(process.env.STRIPE_YEARLY_PRICE_ID).catch(() => null)
    
    res.status(200).json({
      success: true,
      environment: envCheck,
      stripeMode: 'test', // o 'live' dependiendo de tu clave
      products: products.data.map(p => ({ id: p.id, name: p.name })),
      prices: prices.data.map(p => ({ id: p.id, product: p.product, unit_amount: p.unit_amount, currency: p.currency })),
      monthlyPrice: monthlyPrice ? {
        id: monthlyPrice.id,
        product: monthlyPrice.product,
        unit_amount: monthlyPrice.unit_amount,
        currency: monthlyPrice.currency
      } : 'NOT_FOUND',
      yearlyPrice: yearlyPrice ? {
        id: yearlyPrice.id,
        product: yearlyPrice.product,
        unit_amount: yearlyPrice.unit_amount,
        currency: yearlyPrice.currency
      } : 'NOT_FOUND'
    })
    
  } catch (error) {
    console.error('STRIPE PRICES DEBUG ERROR:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      step: 'stripe_prices_test_failed'
    })
  }
}
