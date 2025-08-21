module.exports = async (req, res) => {
  try {
    console.log('=== BASIC DEBUG START ===')
    
    // 1. Test básico - solo verificar que la función se ejecuta
    console.log('Function is executing...')
    
    // 2. Verificar variables de entorno básicas
    const envCheck = {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
    }
    
    console.log('Environment check:', envCheck)
    
    // 3. Test de respuesta básica
    res.status(200).json({
      success: true,
      message: 'Basic debug endpoint working',
      environment: envCheck,
      timestamp: new Date().toISOString(),
      step: 'basic_test_completed'
    })
    
  } catch (error) {
    console.error('BASIC DEBUG ERROR:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      step: 'basic_test_failed'
    })
  }
}
