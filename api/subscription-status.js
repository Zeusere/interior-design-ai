import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Obtener información de suscripción del usuario
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error
    }

    // Si no existe registro, crear uno por defecto para usuario gratuito
    if (!subscription) {
      const { data: newSub } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan: 'free',
          usage_count: 0,
          max_usage: 5,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      return res.status(200).json({
        isActive: false,
        plan: 'free',
        usageCount: 0,
        maxUsage: 5,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      })
    }

    // Verificar si la suscripción está activa
    const isActive = subscription.status === 'active' && 
                    (subscription.plan === 'monthly' || subscription.plan === 'yearly') &&
                    (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date())

    res.status(200).json({
      isActive: isActive,
      plan: subscription.plan,
      usageCount: subscription.usage_count || 0,
      maxUsage: subscription.max_usage || (subscription.plan === 'free' ? 5 : -1),
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      status: subscription.status
    })

  } catch (error) {
    console.error('Error fetching subscription status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
