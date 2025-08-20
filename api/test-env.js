export default async function handler(req, res) {
  try {
    // Test básico de variables de entorno
    const envCheck = {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'undefined'
    }

    console.log('Environment check:', envCheck)

    // Verificar que las variables críticas existan antes de usar Supabase
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Missing critical environment variables',
        environment: envCheck
      })
    }

    // Test de conexión a Supabase sin service role
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseWithAnon = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    )

    console.log('Testing Supabase connection with anon key...')
    
    // Test simple de lectura
    const { data, error } = await supabaseWithAnon
      .from('user_subscriptions')
      .select('count')
      .limit(1)

    console.log('Supabase test result:', { data, error })

    res.status(200).json({
      success: true,
      environment: envCheck,
      supabaseTest: {
        data,
        error: error?.message || null
      }
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}
