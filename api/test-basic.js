export default async function handler(req, res) {
  try {
    // Test ultra básico - solo variables de entorno
    const envCheck = {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'undefined'
    }

    res.status(200).json({
      success: true,
      message: 'API is working!',
      environment: envCheck,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}
