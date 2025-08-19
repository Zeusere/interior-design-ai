import express from 'express';
import cors from 'cors';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Configurar multer para archivos temporales
const upload = multer({ dest: '/tmp/' });

// Configuración de APIs
const API_CONFIG = {
  replicate: {
    baseUrl: 'https://api.replicate.com/v1',
    model: 'adirik/interior-design',
    version: '76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38',
    apiKey: process.env.REPLICATE_API_KEY
  },
  replicateBackup: {
    baseUrl: 'https://api.replicate.com/v1',
    model: 'timbrooks/instruct-pix2pix',
    version: '30c1d0b916a6f8efce20493a5d61ee27491ab2a60437c13c588468b9810ec23f',
    apiKey: process.env.REPLICATE_API_KEY
  },
  // NOTA: La configuración de upscaling se movió a api/enhance-image.js
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY
  }
};

// Función para convertir imagen a base64
function imageToBase64(imagePath) {
  try {
    console.log('📁 Procesando imagen:', imagePath);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Archivo no encontrado: ${imagePath}`);
    }
    
    // Leer el archivo
    const imageBuffer = fs.readFileSync(imagePath);
    console.log('📊 Tamaño del archivo leído:', imageBuffer.length, 'bytes');
    
    if (imageBuffer.length === 0) {
      throw new Error('El archivo está vacío');
    }
    
    // Convertir a base64
    const base64 = imageBuffer.toString('base64');
    console.log('📷 Imagen convertida a base64, tamaño:', base64.length);
    
    return base64;
  } catch (error) {
    console.error('❌ Error procesando imagen:', error);
    throw new Error(`Error al procesar la imagen: ${error.message}`);
  }
}

// Función para procesar y subir imagen a Supabase Storage
async function uploadToSupabase(imagePath) {
  try {
    console.log('☁️ Procesando imagen con Sharp y subiendo a Supabase...');
    console.log('📁 Ruta de imagen:', imagePath);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Archivo no encontrado: ${imagePath}`);
    }
    
    // Leer el archivo y verificar su tamaño
    const fileStats = fs.statSync(imagePath);
    console.log('📊 Tamaño del archivo:', fileStats.size, 'bytes');
    
    if (fileStats.size === 0) {
      throw new Error('El archivo está vacío');
    }
    
    // Procesar imagen con Sharp para garantizar formato correcto
    let processedImageBuffer;
    try {
      processedImageBuffer = await sharp(imagePath)
        .jpeg({ quality: 85, progressive: true })
        .resize(1024, 1024, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .toBuffer();
    } catch (sharpError) {
      console.error('❌ Error de Sharp:', sharpError.message);
      // Intentar sin resize primero
      try {
        processedImageBuffer = await sharp(imagePath)
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
      } catch (secondError) {
        throw new Error(`Error procesando imagen: ${sharpError.message}. Segundo intento: ${secondError.message}`);
      }
    }
    
    console.log('📊 Tamaño después del procesamiento:', processedImageBuffer.length, 'bytes');
    console.log('🔧 Imagen convertida a JPEG con Sharp');
    
    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileName = `temp-images/${timestamp}-${randomId}.jpg`;
    
    console.log('📤 Subiendo archivo como:', fileName);
    
    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('interior-images')
      .upload(fileName, processedImageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw new Error(`Error de Supabase: ${error.message}`);
    }
    
    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('interior-images')
      .getPublicUrl(fileName);
    
    const publicUrl = publicUrlData.publicUrl;
    console.log('✅ Imagen procesada y subida exitosamente a Supabase:', publicUrl);
    console.log('📋 Formato final: JPEG optimizado');
    
    return publicUrl;
    
  } catch (error) {
    console.error('❌ Error procesando imagen con Sharp:', error);
    throw new Error(`No se pudo procesar la imagen: ${error.message}`);
  }
}

// Función para crear prompt optimizado - VERSIÓN PROFESIONAL MEJORADA
function createPrompt(options) {
  // Mapeo de estilos con descripciones específicas y materiales
  const styleMap = {
    modern: {
      description: 'ultra-modern contemporary',
      cabinets: 'sleek handleless cabinets in matte white or charcoal',
      furniture: 'minimalist furniture with clean geometric lines',
      materials: 'polished concrete, brushed steel, glass',
      details: 'hidden storage, integrated lighting, floating elements'
    },
    classic: {
      description: 'timeless traditional',
      cabinets: 'classic raised-panel cabinetry in rich wood tones',
      furniture: 'elegant traditional furniture with refined details',
      materials: 'natural wood, marble, brass accents',
      details: 'crown molding, decorative hardware, sophisticated trim'
    },
    industrial: {
      description: 'raw industrial loft-style',
      cabinets: 'metal-framed cabinets with weathered wood or steel doors',
      furniture: 'reclaimed wood and metal industrial furniture',
      materials: 'exposed brick, raw steel, concrete, weathered wood',
      details: 'visible pipes, metal brackets, Edison bulb fixtures'
    },
    bohemian: {
      description: 'eclectic bohemian',
      cabinets: 'painted cabinets in rich jewel tones with vintage hardware',
      furniture: 'mix of vintage and artisanal furniture pieces',
      materials: 'natural textures, woven elements, colorful tiles',
      details: 'layered textiles, plants, artistic accessories'
    },
    scandinavian: {
      description: 'Nordic minimalist',
      cabinets: 'light wood cabinets with simple clean lines',
      furniture: 'functional light wood furniture with cozy textiles',
      materials: 'pale woods, white surfaces, natural fibers',
      details: 'hygge elements, minimal decoration, functional design'
    },
    luxury: {
      description: 'high-end luxury',
      cabinets: 'premium custom cabinetry with gold or brass details',
      furniture: 'designer furniture with luxurious fabrics',
      materials: 'marble, gold accents, premium woods, crystal',
      details: 'custom millwork, statement lighting, opulent finishes'
    }
  };

  // Mapeo específico por tipo de habitación con elementos clave
  const roomSpecifics = {
    'living-room': {
      focus: 'seating area and entertainment space',
      replace: 'furniture with stylish sofa, coffee table, accent chairs, side tables',
      flooring: 'premium hardwood or large format tiles',
      walls: 'feature wall with textural elements or artwork'
    },
    'bedroom': {
      focus: 'sleeping and relaxation area',
      replace: 'furniture with elegant bed frame, nightstands, dresser, reading chair',
      flooring: 'warm hardwood or luxury carpet',
      walls: 'calming headboard wall with soft textures'
    },
    'kitchen': {
      focus: 'cooking and dining preparation area',
      replace: 'cabinets and countertops',
      flooring: 'durable luxury vinyl, tile, or hardwood',
      walls: 'backsplash with premium tiles or natural stone'
    },
    'dining-room': {
      focus: 'formal dining and entertaining space',
      replace: 'furniture with dining table, chairs, buffet, lighting fixture',
      flooring: 'elegant hardwood or polished tile',
      walls: 'statement wall with wainscoting or bold color'
    },
    'bathroom': {
      focus: 'bathing and grooming area',
      replace: 'vanity, fixtures, and tile work',
      flooring: 'luxury tile or natural stone',
      walls: 'premium tile work and modern fixtures'
    },
    'office': {
      focus: 'workspace and productivity area',
      replace: 'furniture with modern desk, ergonomic chair, storage solutions',
      flooring: 'professional hardwood or commercial-grade flooring',
      walls: 'built-in shelving and organized storage'
    }
  };

  // Mapeo de iluminación mejorado
  const lightingMap = {
    natural: 'maximize natural daylight from existing windows, bright airy atmosphere',
    warm: 'warm 2700K-3000K lighting creating cozy inviting ambiance',
    cool: 'crisp 4000K-5000K lighting for modern bright environment',
    dramatic: 'accent lighting with strong shadows and highlights',
    ambient: 'soft layered lighting with multiple warm sources'
  };

  // Mapeo de esquemas de color mejorado
  const colorMap = {
    neutral: 'sophisticated neutral palette with warm whites, soft grays, and natural beiges',
    monochrome: 'elegant monochromatic scheme with varying shades of gray and white',
    earth: 'warm earth tones with rich browns, terracotta, and natural ochres',
    vibrant: 'bold vibrant colors with energetic accents and confident hues',
    pastel: 'soft pastel palette with gentle pinks, blues, and sage greens',
    jewel: 'rich jewel tones with deep emeralds, sapphires, and warm golds'
  };

  // Obtener configuraciones
  const styleConfig = styleMap[options.style] || styleMap.modern;
  const roomConfig = roomSpecifics[options.roomType] || roomSpecifics['living-room'];
  const lighting = lightingMap[options.lighting] || lightingMap.natural;
  const colors = colorMap[options.colorScheme] || colorMap.neutral;

  // Construir prompt profesional basado en el ejemplo proporcionado
  const mainPrompt = [
    `Photorealistic interior makeover of this ${options.roomType.replace('-', ' ')}.`,
    `Preserve the exact walls, windows, doors, and architectural layout.`,
    `${roomConfig.replace} with ${styleConfig.description} style.`,
    `Apply ${colors} throughout the space.`,
    `Use ${styleConfig.materials} for surfaces and accents.`,
    `${roomConfig.flooring} for flooring.`,
    `${lighting}.`,
    `Include ${styleConfig.details}.`,
    `European contemporary design principles, realistic textures, accurate reflections, professional photography quality.`
  ].join(' ');

  return mainPrompt;
}

// Endpoint principal
app.post('/api/generate-design', upload.single('image'), async (req, res) => {
  try {
    console.log('🎨 Iniciando generación de diseño...');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó imagen' });
    }

    const options = JSON.parse(req.body.options || '{}');
    console.log('📋 Opciones recibidas:', options);

    // Verificar API key
    if (!API_CONFIG.replicate.apiKey) {
      return res.status(500).json({ 
        error: 'Replicate API no configurada',
        details: 'Configura REPLICATE_API_KEY en las variables de entorno'
      });
    }

    // Subir imagen a Supabase Storage para obtener URL pública
    let publicImageUrl;
    try {
      publicImageUrl = await uploadToSupabase(req.file.path);
    } catch (uploadError) {
      console.error('❌ Error subiendo imagen a Supabase:', uploadError);
      // Limpiar archivo temporal
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ 
        error: 'Error procesando la imagen',
        details: uploadError.message
      });
    }
    
    const prompt = createPrompt(options);
    console.log('📝 Prompt generado:', prompt);

    // Llamar a Replicate
    const replicateResponse = await fetch(`${API_CONFIG.replicate.baseUrl}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_CONFIG.replicate.apiKey}`,
        'Content-Type': 'application/json',
      },
              body: JSON.stringify({
          version: API_CONFIG.replicate.version,
          input: {
            image: publicImageUrl,
            prompt: prompt,
            negative_prompt: 'warped cabinets, extra walls, incorrect reflections, motion blur, floating furniture, furniture against walls, unrealistic proportions, broken geometry, poor architectural perspective, misaligned windows, doors in wrong places, furniture floating in air, oversaturated colors, cartoonish appearance, amateur photography, blurry textures, incorrect shadows, objects without physics, cut off furniture, incomplete room elements, distorted materials, fake plastic appearance, poor lighting quality, cluttered messy space, low resolution, pixelated, artificial looking',
            num_inference_steps: 30,
            guidance_scale: 8.5,
            prompt_strength: 0.85,
            seed: Math.floor(Math.random() * 1000000)
          }
        })
    });

    if (!replicateResponse.ok) {
      console.log('⚠️ Primer modelo falló, intentando con backup...');
      
      // Prompt simplificado para el modelo backup
      const backupPrompt = `Redesign this room with ${options.style} style, ${options.lighting} lighting, and ${options.colorScheme} colors. Maintain architectural structure, add appropriate furniture for ${options.roomType}. Professional interior design, photorealistic quality.`;
      
      const backupResponse = await fetch(`${API_CONFIG.replicateBackup.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${API_CONFIG.replicateBackup.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: API_CONFIG.replicateBackup.version,
          input: {
            image: publicImageUrl,
            prompt: backupPrompt,
            negative_prompt: "warped cabinets, extra walls, incorrect reflections, motion blur, floating furniture, unrealistic proportions, broken geometry, poor architectural perspective, blurry, low quality, cartoonish, oversaturated colors",
            num_inference_steps: 30,
            guidance_scale: 8.0,
            prompt_strength: 0.85,
            seed: Math.floor(Math.random() * 1000000)
          }
        })
      });
      
      if (!backupResponse.ok) {
        const errorText = await backupResponse.text();
        console.error('❌ Error de Replicate (backup):', errorText);
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ 
          error: 'Error al comunicarse con Replicate',
          details: errorText
        });
      }
      
      replicateResponse = backupResponse;
    }

    const prediction = await replicateResponse.json();
    console.log('📡 Predicción iniciada:', prediction.id);

    // Polling para obtener resultado
    let attempts = 0;
    const maxAttempts = 60; // 5 minutos máximo

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`${API_CONFIG.replicate.baseUrl}/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${API_CONFIG.replicate.apiKey}`,
        }
      });

      const statusData = await statusResponse.json();
      console.log(`📊 Intento ${attempts + 1}: ${statusData.status}`);

      if (statusData.status === 'succeeded') {
        let resultImageUrl = '';
        
        if (Array.isArray(statusData.output) && statusData.output.length > 0) {
          resultImageUrl = statusData.output[0];
        } else if (typeof statusData.output === 'string') {
          resultImageUrl = statusData.output;
        } else {
          console.log('⚠️ Formato de output inesperado:', statusData.output);
          resultImageUrl = statusData.output;
        }
        
        console.log('✅ Diseño generado exitosamente');
        
        // Guardar en la base de datos
        try {
          const userId = req.headers['x-user-id']; // Pasaremos esto desde el frontend
          
          if (userId) {
            const { data: savedImage, error: dbError } = await supabase
              .from('images')
              .insert([{
                user_id: userId,
                original_url: publicImageUrl,      // Imagen original
                processed_url: resultImageUrl,     // Imagen procesada por IA
                room_type: options.roomType || 'living-room',
                style_applied: options.style || 'modern',
                processing_options: options,
                processing_status: 'completed',
                is_temporary: true,  // Por defecto temporal (hasta que el usuario la guarde)
                auto_delete_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
              }])
              .select()
              .single();

            if (dbError) {
              console.error('⚠️ Error guardando en BD (continuando):', dbError);
            } else {
              console.log('✅ Imagen guardada en BD:', savedImage.id);
            }
          }
        } catch (dbError) {
          console.error('⚠️ Error en BD (continuando):', dbError);
        }
        
        // Limpiar archivo temporal
        fs.unlinkSync(req.file.path);
        
        return res.json({
          success: true,
          imageUrl: resultImageUrl,
          prompt: prompt,
          processingTime: attempts * 5
        });
      }

      if (statusData.status === 'failed') {
        console.error('❌ Generación fallida:', statusData.error);
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ 
          error: 'La generación falló',
          details: statusData.error
        });
      }

      // Esperar 5 segundos antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    // Timeout
    fs.unlinkSync(req.file.path);
    return res.status(408).json({ error: 'Timeout: La generación tomó demasiado tiempo' });

  } catch (error) {
    console.error('💥 Error general:', error);
    
    // Limpiar archivo si existe
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// NOTA: El endpoint /api/enhance-image ahora está en un archivo separado (api/enhance-image.js)
// para cumplir con el sistema de enrutamiento de Vercel

// Endpoint de health check
app.get('/api/health', (req, res) => {
  const hasReplicateKey = !!API_CONFIG.replicate.apiKey;
  const hasOpenAIKey = !!API_CONFIG.openai.apiKey;
  
  res.json({
    status: 'ok',
    apis: {
      replicate: hasReplicateKey,
      openai: hasOpenAIKey
    },
    timestamp: new Date().toISOString()
  });
});

// Exportar para Vercel
export default app;
