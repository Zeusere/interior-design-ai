export default function handler(req, res) {
  const hasReplicateKey = !!process.env.REPLICATE_API_KEY;
  const hasSupabaseUrl = !!process.env.SUPABASE_URL;
  const hasSupabaseKey = !!process.env.SUPABASE_ANON_KEY;
  
  res.json({
    status: 'ok',
    apis: {
      replicate: hasReplicateKey,
      supabase: hasSupabaseUrl && hasSupabaseKey
    },
    environment: {
      replicate_api_key: hasReplicateKey ? '✅ Configurada' : '❌ No configurada',
      supabase_url: hasSupabaseUrl ? '✅ Configurada' : '❌ No configurada',
      supabase_anon_key: hasSupabaseKey ? '✅ Configurada' : '❌ No configurada'
    },
    timestamp: new Date().toISOString()
  });
}
