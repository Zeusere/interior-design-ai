module.exports = async (req, res) => {
  console.log('test-simple: Request received')
  
  try {
    // Solo test básico sin Supabase
    res.status(200).json({
      success: true,
      message: 'API funcionando correctamente',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
        hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
        hasStripeMonthly: !!process.env.STRIPE_MONTHLY_PRICE_ID,
        hasStripeYearly: !!process.env.STRIPE_YEARLY_PRICE_ID
      }
    })
  } catch (error) {
    console.error('test-simple error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
