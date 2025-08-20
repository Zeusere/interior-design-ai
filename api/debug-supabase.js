const { createClient } = require('@supabase/supabase-js')

module.exports = async (req, res) => {
  try {
    console.log('=== SUPABASE DEBUG START ===')
    
    // 1. Verificar variables de entorno
    const envCheck = {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      URL_LENGTH: process.env.SUPABASE_URL?.length || 0,
      KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    }
    console.log('Environment check:', envCheck)

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase environment variables',
        details: envCheck
      })
    }

    // 2. Crear cliente Supabase
    console.log('Creating Supabase client...')
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // 3. Test básico de la tabla user_subscriptions
    console.log('Testing user_subscriptions table...')
    const { data: subscriptions, error: subError, count } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact' })
      .limit(3)

    console.log('Query result:', { 
      data: subscriptions, 
      error: subError, 
      count,
      errorCode: subError?.code,
      errorMessage: subError?.message 
    })

    // 4. Test de inserción simple
    console.log('Testing INSERT...')
    const testUserId = 'debug-test-' + Date.now()
    const { data: insertData, error: insertError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: testUserId,
        email: 'debug@test.com',
        plan: 'free',
        usage_count: 0,
        max_usage: 5
      })
      .select()

    console.log('Insert result:', { insertData, insertError })

    // 5. Limpiar
    if (!insertError) {
      await supabase
        .from('user_subscriptions')
        .delete()
        .eq('user_id', testUserId)
    }

    res.status(200).json({
      success: true,
      environment: envCheck,
      tableAccess: {
        canSelect: !subError,
        canInsert: !insertError,
        selectError: subError?.message || null,
        insertError: insertError?.message || null,
        recordCount: count || 0
      }
    })

  } catch (error) {
    console.error('SUPABASE DEBUG ERROR:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}
