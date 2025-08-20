const { createClient } = require('@supabase/supabase-js')

module.exports = async (req, res) => {
  try {
    console.log('=== SUPABASE DEBUG START ===')
    
    // 1. Verificar variables de entorno
    const envCheck = {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      SUPABASE_URL_VALUE: process.env.SUPABASE_URL || 'UNDEFINED',
      SERVICE_KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    }
    console.log('Environment check:', envCheck)

    // 2. Verificar que las variables no estén undefined
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase environment variables',
        details: envCheck
      })
    }

    // 3. Crear cliente Supabase
    console.log('Creating Supabase client...')
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    console.log('Supabase client created successfully')

    // 4. Test básico de conexión - listar tablas
    console.log('Testing basic connection...')
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables_info')
      .limit(1)

    console.log('Tables query result:', { tables, error: tablesError })

    // 5. Test específico de la tabla user_subscriptions
    console.log('Testing user_subscriptions table...')
    const { data: subscriptions, error: subError, count } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact' })
      .limit(5)

    console.log('Subscriptions query result:', { 
      data: subscriptions, 
      error: subError, 
      count,
      errorCode: subError?.code,
      errorMessage: subError?.message 
    })

    // 6. Test de inserción
    console.log('Testing INSERT capability...')
    const testUserId = 'test-user-' + Date.now()
    const { data: insertData, error: insertError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: testUserId,
        email: 'test@example.com',
        plan: 'free',
        usage_count: 0,
        max_usage: 5
      })
      .select()

    console.log('Insert test result:', { insertData, insertError })

    // 7. Limpiar test
    if (!insertError) {
      console.log('Cleaning up test data...')
      await supabase
        .from('user_subscriptions')
        .delete()
        .eq('user_id', testUserId)
    }

    console.log('=== SUPABASE DEBUG END ===')

    res.status(200).json({
      success: true,
      environment: envCheck,
      tableAccess: {
        canSelect: !subError,
        canInsert: !insertError,
        selectError: subError?.message,
        insertError: insertError?.message,
        recordCount: count
      },
      timestamp: new Date().toISOString()
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
