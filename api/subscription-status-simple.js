const { createClient } = require('@supabase/supabase-js')

// Usar anon key en lugar de service role para test
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

module.exports = async (req, res) => {
  console.log('subscription-status-simple: Received request', { method: req.method, query: req.query })
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId } = req.query

    if (!userId) {
      console.log('subscription-status-simple: Missing userId')
      return res.status(400).json({ error: 'User ID is required' })
    }

    console.log('subscription-status-simple: Processing for userId:', userId)

    // Test básico - solo devolver datos hardcodeados por ahora
    const defaultStatus = {
      isActive: false,
      plan: 'free',
      usageCount: 0,
      maxUsage: 5,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false
    }

    console.log('subscription-status-simple: Returning default status')
    res.status(200).json(defaultStatus)

  } catch (error) {
    console.error('subscription-status-simple error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    })
  }
}
