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

// Función para crear prompt optimizado
function createPrompt(options) {
  // Mapeo de estilos con prompts específicos para preservar estructura
  const styleMap = {
    modern: 'modern minimalist interior design with clean lines, contemporary furniture, and sleek finishes',
    classic: 'elegant classic interior design with traditional furniture, sophisticated decor, and timeless elegance',
    industrial: 'industrial interior design with exposed brick, metal elements, raw materials, and urban aesthetic',
    bohemian: 'bohemian interior design with eclectic mix of colors, textures, cultural elements, and artistic flair',
    scandinavian: 'scandinavian interior design with light woods, neutral colors, functional furniture, and hygge atmosphere',
    luxury: 'luxury interior design with premium materials, sophisticated lighting, high-end finishes, and opulent details'
  };

  // Mapeo de habitaciones con muebles específicos
  const roomFurnitureMap = {
    'living-room': 'comfortable sofa, coffee table, entertainment center, accent chairs, side tables, area rug, decorative lighting',
    'bedroom': 'queen or king bed with headboard, bedside tables, wardrobe or closet, dresser, comfortable bedding, bedside lamps',
    'kitchen': 'modern cabinets, granite or marble countertops, stainless steel appliances, kitchen island, bar stools, pendant lighting',
    'dining-room': 'dining table with chairs, buffet or sideboard, chandelier or pendant light, area rug, decorative wall art',
    'bathroom': 'vanity with sink, shower or bathtub, toilet, towel racks, mirrors, tiles, modern fixtures',
    'office': 'desk with chair, bookshelves, filing cabinet, task lighting, comfortable seating area, productivity-focused design'
  };

  const roomMap = {
    'living-room': 'living room',
    'bedroom': 'bedroom',
    'kitchen': 'kitchen',
    'dining-room': 'dining room',
    'bathroom': 'bathroom',
    'office': 'home office'
  };

  const lightingMap = {
    natural: 'abundant natural lighting with large windows',
    warm: 'warm ambient lighting with cozy atmosphere',
    cool: 'cool modern lighting with contemporary fixtures',
    dramatic: 'dramatic lighting with statement fixtures',
    ambient: 'soft ambient lighting with layered illumination'
  };

  const colorMap = {
    neutral: 'neutral color palette with beige, gray, and white tones',
    monochrome: 'monochromatic color scheme with varying shades',
    earth: 'earth tone colors with warm browns and natural hues',
    vibrant: 'vibrant colors with bold accents and energetic palette',
    pastel: 'pastel colors with soft, soothing tones',
    jewel: 'jewel tone colors with rich, deep hues'
  };

  const style = styleMap[options.style] || options.style;
  const room = roomMap[options.roomType] || options.roomType;
  const furniture = roomFurnitureMap[options.roomType] || '';
  const lighting = lightingMap[options.lighting] || '';
  const colors = colorMap[options.colorScheme] || '';

  // Prompt optimizado para preservar estructura arquitectónica
  return `Transform this ${room} into a beautiful ${style} while maintaining the original architectural structure, walls, windows, and room layout. Add ${furniture} with ${lighting} and ${colors}. Professional interior design photography, photorealistic quality, perfect furniture placement, no floating objects, no furniture against walls, proper scale and proportions, architectural integrity preserved, high-end materials, impeccable attention to detail, award-winning interior design.`;
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
            negative_prompt: 'low quality, blurry, distorted, ugly, bad anatomy, floating furniture, furniture against walls, cut off objects, unrealistic proportions, poor lighting, oversaturated colors, cartoonish, architectural errors, window misplacement, door misaligned, furniture floating in air, objects without shadows, unrealistic shadows, poor composition, cluttered space, messy room, broken furniture, incomplete furniture, furniture merging with walls, unrealistic materials, poor texture quality, artificial looking, fake appearance, amateur photography, bad camera angle, poor framing',
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
            negative_prompt: "blurry, low quality, distorted, unrealistic, bad architecture, poor lighting, oversaturated, cartoonish, floating objects, furniture against walls",
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
