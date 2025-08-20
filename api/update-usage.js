const { createClient } = require('@supabase/supabase-js')

// Debug environment variables
console.log('Environment check:', {
  SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

module.exports = async (req, res) => {
  console.log('update-usage: Received request', { method: req.method, body: req.body })
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.body

    if (!userId) {
      console.log('update-usage: Missing userId')
      return res.status(400).json({ error: 'User ID is required' })
    }

    console.log('update-usage: Processing for userId:', userId)

    // Obtener información actual del usuario
    console.log('update-usage: Fetching subscription for user:', userId)
    const { data: subscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    console.log('update-usage: Fetch result:', { subscription, error: fetchError })

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.log('update-usage: Database error:', fetchError)
      throw fetchError
    }

    // Si no existe registro, crear uno por defecto
    if (!subscription) {
      await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan: 'free',
          usage_count: 1,
          max_usage: 5,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      return res.status(200).json({ success: true, usageCount: 1 })
    }

    // Verificar si puede usar la función
    const isProUser = subscription.plan === 'monthly' || subscription.plan === 'yearly'
    const hasActiveSubscription = subscription.status === 'active'

    // Si es usuario Pro con suscripción activa, no incrementar contador (uso ilimitado)
    if (isProUser && hasActiveSubscription) {
      return res.status(200).json({ success: true, usageCount: subscription.usage_count })
    }

    // Si es usuario gratuito, verificar límite
    const currentUsage = subscription.usage_count || 0
    const maxUsage = subscription.max_usage || 5

    if (currentUsage >= maxUsage) {
      return res.status(403).json({ 
        error: 'Usage limit exceeded', 
        usageCount: currentUsage,
        maxUsage: maxUsage
      })
    }

    // Incrementar contador de uso
    const newUsageCount = currentUsage + 1
    
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        usage_count: newUsageCount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      throw updateError
    }

    res.status(200).json({ 
      success: true, 
      usageCount: newUsageCount,
      maxUsage: maxUsage,
      limitReached: newUsageCount >= maxUsage
    })

  } catch (error) {
    console.error('Error updating usage:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
