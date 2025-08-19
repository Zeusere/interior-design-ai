import { createClient } from '@supabase/supabase-js'
import Cors from 'cors'

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Configurando Supabase:', { 
  supabaseUrl: !!supabaseUrl, 
  supabaseAnonKey: !!supabaseAnonKey
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de Supabase no configuradas')
  throw new Error('Variables de Supabase requeridas no encontradas')
}

// Crear cliente base (sin autenticación)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Función para crear cliente autenticado
const getAuthenticatedSupabase = (accessToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
}

// Configurar CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000', 
    'https://interior-design-ai-kfng.vercel.app',
    'https://interior-design-ai-kfng-1zbuv4a6l-zeuseres-projects.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}

const corsMiddleware = Cors(corsOptions)

// Función para ejecutar middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export default async function handler(req, res) {
  // Aplicar CORS
  await runMiddleware(req, res, corsMiddleware)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    // 1. Obtener token de autenticación del header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token de autenticación requerido',
        hint: 'Incluye Authorization: Bearer <token> en el header'
      })
    }

    const accessToken = authHeader.replace('Bearer ', '')
    console.log('🔐 Token recibido:', accessToken.substring(0, 20) + '...')

    // 2. Crear cliente autenticado
    const supabase = getAuthenticatedSupabase(accessToken)

    // 3. Verificar que el usuario está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('❌ Error de autenticación:', authError)
      return res.status(401).json({ 
        error: 'Token de autenticación inválido',
        details: authError?.message 
      })
    }

    console.log('✅ Usuario autenticado:', user.id, user.email)

    // 4. Obtener datos del body
    const { 
      projectName, 
      originalImageUrl, 
      processedImageUrls = [],
      designOptions = {} 
    } = req.body

    console.log('📋 Guardando proyecto:', { 
      projectName, 
      userId: user.id,
      originalImageUrl: originalImageUrl ? 'presente' : 'ausente', 
      processedImageUrls: processedImageUrls.length,
      designOptions 
    })

    // 5. Validar datos requeridos (userId viene de la autenticación)
    if (!projectName || !originalImageUrl) {
      console.error('❌ Datos faltantes:', { projectName: !!projectName, originalImageUrl: !!originalImageUrl })
      return res.status(400).json({ 
        error: 'Datos requeridos: projectName, originalImageUrl',
        received: { projectName: !!projectName, originalImageUrl: !!originalImageUrl }
      })
    }

    const userId = user.id

    // 1. Crear el proyecto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([{
        user_id: userId,
        name: projectName,
        description: `Proyecto creado el ${new Date().toLocaleDateString()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (projectError) {
      console.error('❌ Error creando proyecto:', {
        error: projectError,
        message: projectError.message,
        details: projectError.details,
        hint: projectError.hint,
        code: projectError.code
      })
      return res.status(500).json({ 
        error: 'Error creando proyecto', 
        details: projectError.message,
        supabaseError: projectError 
      })
    }

    console.log('✅ Proyecto creado:', project.id)

    // 2. Crear registro de imagen original
    const { data: originalImage, error: originalError } = await supabase
      .from('images')
      .insert([{
        user_id: userId,
        original_url: originalImageUrl,
        processed_url: null,
        room_type: designOptions.roomType || 'living-room',
        style_applied: designOptions.style || 'modern',
        processing_options: designOptions,
        processing_status: 'completed',
        is_temporary: false, // ¡Importante! Ya no es temporal
        auto_delete_at: null, // No se borra automáticamente
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (originalError) {
      console.error('❌ Error guardando imagen original:', originalError)
      return res.status(500).json({ error: 'Error guardando imagen original', details: originalError.message })
    }

    console.log('✅ Imagen original guardada:', originalImage.id)

    // 3. Vincular imagen original al proyecto
    const { error: linkOriginalError } = await supabase
      .from('project_images')
      .insert([{
        project_id: project.id,
        image_id: originalImage.id,
        image_type: 'original',
        display_order: 0,
        created_at: new Date().toISOString()
      }])

    if (linkOriginalError) {
      console.error('❌ Error vinculando imagen original:', linkOriginalError)
    }

    // 4. Crear y vincular imágenes procesadas
    const savedProcessedImages = []
    
    for (let i = 0; i < processedImageUrls.length; i++) {
      const processedUrl = processedImageUrls[i]
      
      // Crear imagen procesada
      const { data: processedImage, error: processedError } = await supabase
        .from('images')
        .insert([{
          user_id: userId,
          original_url: originalImageUrl,
          processed_url: processedUrl,
          room_type: designOptions.roomType || 'living-room',
          style_applied: designOptions.style || 'modern',
          processing_options: designOptions,
          processing_status: 'completed',
          is_temporary: false, // ¡Importante! Ya no es temporal
          auto_delete_at: null, // No se borra automáticamente
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (processedError) {
        console.error(`❌ Error guardando imagen procesada ${i + 1}:`, processedError)
        continue
      }

      // Vincular al proyecto
      const { error: linkProcessedError } = await supabase
        .from('project_images')
        .insert([{
          project_id: project.id,
          image_id: processedImage.id,
          image_type: 'processed',
          display_order: i + 1,
          created_at: new Date().toISOString()
        }])

      if (linkProcessedError) {
        console.error(`❌ Error vinculando imagen procesada ${i + 1}:`, linkProcessedError)
      } else {
        savedProcessedImages.push(processedImage)
        console.log(`✅ Imagen procesada ${i + 1} guardada:`, processedImage.id)
      }
    }

    // 5. Respuesta exitosa
    return res.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        created_at: project.created_at
      },
      images: {
        original: originalImage,
        processed: savedProcessedImages
      },
      message: `Proyecto "${projectName}" guardado exitosamente`
    })

  } catch (error) {
    console.error('💥 Error en save-project:', error)
    return res.status(500).json({ 
      error: 'Error interno del servidor', 
      details: error.message 
    })
  }
}

