import express from 'express';
import cors from 'cors';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Configurar ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Configurar multer para archivos temporales (compatible con Vercel)
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
  // Modelo de upscaling para mejora de calidad - ACTUALIZADO
  replicateUpscale: {
    baseUrl: 'https://api.replicate.com/v1',
    model: 'jingyunliang/swinir',
    version: '660d922d33153019e8c263a3bba265de882e7f4f70396546b6c9c8f9d47a021a',
    apiKey: process.env.REPLICATE_API_KEY
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY
  }
};

// Función para convertir imagen a base64 simple (sin data URI)
function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    console.log('📷 Imagen convertida a base64, tamaño:', base64.length);
    return base64;
  } catch (error) {
    console.error('Error procesando imagen:', error);
    throw new Error('Error al procesar la imagen');
  }
}



// Función para crear URL temporal para la imagen
function createTempImageUrl(imagePath, req) {
  const filename = imagePath.split('/').pop();
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/temp-images/${filename}`;
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

// Función para guardar imagen GENERADA de data URI a Supabase Storage
async function saveGeneratedImageToSupabase(dataUri) {
  try {
    console.log('💾 Guardando imagen generada en Supabase...');
    console.log('🔍 Validando data URI...');
    
    if (!dataUri || typeof dataUri !== 'string') {
      throw new Error(`Data URI inválida - tipo: ${typeof dataUri}, valor: ${dataUri}`);
    }
    
    console.log('🔍 Data URI válida, extrayendo contenido base64...');
    
    // Extraer el contenido base64 del data URI
    const matches = dataUri.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.error('❌ Data URI no coincide con el patrón esperado');
      console.error('📋 Data URI recibida:', dataUri.substring(0, 100) + '...');
      throw new Error(`Formato de data URI inválido - patrón no coincide`);
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    console.log('📊 Tamaño de imagen generada:', imageBuffer.length, 'bytes');
    console.log('🖼️ Tipo MIME:', mimeType);
    
    // Procesar con Sharp para asegurar formato consistente
    const processedImageBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 90, progressive: true })
      .toBuffer();
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileName = `generated-images/${timestamp}-${randomId}.jpg`;
    
    console.log('📤 Subiendo imagen generada como:', fileName);
    
    const { data, error } = await supabase.storage
      .from('interior-images')
      .upload(fileName, processedImageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Error de Supabase al guardar imagen generada:', error);
      throw new Error(`Error de Supabase: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('interior-images')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;
    console.log('✅ Imagen generada guardada exitosamente en Supabase:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('❌ Error guardando imagen generada:', error);
    throw new Error(`No se pudo guardar la imagen generada: ${error.message}`);
  }
}

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: '🎨 Interior Design AI Backend',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      generateDesign: '/api/generate-design',
      enhanceImage: '/api/enhance-image',
      tempImages: '/temp-images'
    }
  });
});

// Endpoint para probar acceso a imágenes
app.get('/api/test-image', (req, res) => {
  // Listar archivos en el directorio uploads
  try {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    
    const files = fs.readdirSync(uploadDir);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const fileList = files.map(file => ({
      filename: file,
      url: `${baseUrl}/temp-images/${file}`,
      path: `/tmp/${file}`
    }));
    
    res.json({
      message: 'Archivos temporales disponibles',
      baseUrl: baseUrl,
      files: fileList
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Función para crear prompt optimizado para instruct-pix2pix
function createPrompt(options) {
  const styleMap = {
    modern: 'modern minimalist',
    classic: 'classic elegant',
    industrial: 'industrial style',
    bohemian: 'bohemian eclectic',
    scandinavian: 'scandinavian style',
    luxury: 'luxury sophisticated'
  };

  const lightingMap = {
    natural: 'with natural lighting',
    warm: 'with warm lighting', 
    cool: 'with cool lighting',
    dramatic: 'with dramatic lighting',
    ambient: 'with ambient lighting'
  };

  const colorMap = {
    neutral: 'in neutral colors',
    monochrome: 'in black and white',
    earth: 'in earth tones',
    vibrant: 'in vibrant colors',
    pastel: 'in pastel colors',
    jewel: 'in jewel tones'
  };

  const roomType = options.roomType.replace('-', ' ');
  const style = styleMap[options.style] || options.style;
  const lighting = lightingMap[options.lighting] || '';
  const colors = colorMap[options.colorScheme] || '';

  // Prompt más simple y directo para instruct-pix2pix
  // Prompt específico para mantener estructura arquitectónica
  return `Redesign this ${roomType} with ${style} style ${colors} ${lighting}. Change furniture, colors, and decor.`;
}

// Endpoint para generar diseño con Replicate
app.post('/api/generate-design', upload.single('image'), async (req, res) => {
  try {
    console.log('🎨 Iniciando generación de diseño...');
    
    // Verificar API key
    if (!API_CONFIG.replicate.apiKey) {
      return res.status(400).json({ 
        error: 'API key de Replicate no configurada. Añade REPLICATE_API_KEY en .env.local' 
      });
    }

    // Procesar imagen
    const imageFile = req.file;
    const options = JSON.parse(req.body.options);
    
    if (!imageFile) {
      return res.status(400).json({ error: 'No se proporcionó imagen' });
    }

    console.log('📁 Imagen recibida:', imageFile.originalname);
    console.log('⚙️ Opciones:', options);

    // Verificar que el archivo existe
    if (!fs.existsSync(imageFile.path)) {
      return res.status(400).json({ error: 'Archivo de imagen no encontrado' });
    }
    
    // Obtener información del archivo
    const fileStats = fs.statSync(imageFile.path);
    console.log('📊 Información del archivo:');
    console.log('  - Ruta:', imageFile.path);
    console.log('  - Tamaño:', fileStats.size, 'bytes');
    console.log('  - Nombre original:', imageFile.originalname);
    
    // Crear URL temporal para la imagen
    const imageUrl = createTempImageUrl(imageFile.path, req);
    console.log('🌐 URL temporal de imagen:', imageUrl);
    
    // Crear prompt optimizado
    const prompt = createPrompt(options);
    console.log('📝 Prompt generado:', prompt);

    // Subir imagen a Supabase Storage para obtener URL pública
    let publicImageUrl;
    try {
      publicImageUrl = await uploadToSupabase(imageFile.path);
    } catch (uploadError) {
      console.error('❌ Error subiendo imagen a Supabase:', uploadError);
      // Limpiar archivo temporal
      fs.unlinkSync(imageFile.path);
      return res.status(500).json({ 
        error: 'Error procesando la imagen',
        details: uploadError.message
      });
    }
    
    console.log('🚀 Enviando solicitud a Replicate...');
    console.log('📸 Usando imagen desde URL pública:', publicImageUrl);
    console.log('🎯 Modelo:', API_CONFIG.replicate.model);
    console.log('🎯 Versión:', API_CONFIG.replicate.version);
    console.log('🎯 Prompt:', prompt);
    console.log('🎯 Prompt strength:', 0.8);
    
    let response = await fetch(`${API_CONFIG.replicate.baseUrl}/predictions`, {
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
          negative_prompt: "blurry, low quality, distorted, unrealistic",
          num_inference_steps: 20,
          guidance_scale: 7.5,
          prompt_strength: 0.8
        }
      })
    });

    // Si el primer modelo falla, intentar con el backup
    if (!response.ok) {
      console.log('⚠️ Primer modelo falló, intentando con backup...');
      response = await fetch(`${API_CONFIG.replicateBackup.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${API_CONFIG.replicateBackup.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: API_CONFIG.replicateBackup.version,
          input: {
            image: publicImageUrl,
            prompt: prompt,
            negative_prompt: "blurry, low quality, distorted, unrealistic, bad architecture, poor lighting, oversaturated, cartoonish",
            num_inference_steps: 30,
            guidance_scale: 8.0,
            prompt_strength: 0.85,
            seed: Math.floor(Math.random() * 1000000)
          }
        })
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error de Replicate:', errorText);
      return res.status(response.status).json({ 
        error: `Error de Replicate: ${response.statusText}`,
        details: errorText
      });
    }

    const prediction = await response.json();
    console.log('✅ Predicción creada:', prediction.id);

    // Polling para obtener resultado
    let attempts = 0;
    const maxAttempts = 60; // 5 minutos máximo

    while (attempts < maxAttempts) {
      console.log(`🔄 Verificando resultado... (${attempts + 1}/${maxAttempts})`);
      
      const statusResponse = await fetch(
        `${API_CONFIG.replicate.baseUrl}/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Token ${API_CONFIG.replicate.apiKey}`,
          }
        }
      );

      const statusData = await statusResponse.json();
      console.log('📊 Estado:', statusData.status);

      if (statusData.status === 'succeeded') {
        console.log('🎉 ¡Diseño completado!');
        console.log('📋 statusData completo:', JSON.stringify(statusData, null, 2));
        console.log('🖼️ Tipo de output:', typeof statusData.output);
        console.log('🔍 Es array:', Array.isArray(statusData.output));
        console.log('📏 Length del output:', statusData.output ? statusData.output.length : 'N/A');
        
        // Manejar diferentes tipos de output del modelo
        let resultImageUrl;
        if (Array.isArray(statusData.output)) {
          resultImageUrl = statusData.output[0];
          console.log('📋 Usando primer elemento del array');
          console.log('📋 Tipo del primer elemento:', typeof resultImageUrl);
          console.log('📋 Length del primer elemento:', resultImageUrl ? resultImageUrl.length : 'N/A');
        } else if (typeof statusData.output === 'string') {
          resultImageUrl = statusData.output;
          console.log('📋 Usando string directamente');
        } else {
          console.log('⚠️ Formato de output inesperado:', statusData.output);
          resultImageUrl = statusData.output;
        }
        
        console.log('🌐 URL original de imagen:', resultImageUrl);
        console.log('📋 Tipo de resultImageUrl:', typeof resultImageUrl);
        console.log('📋 Length:', resultImageUrl ? resultImageUrl.length : 'N/A');
        
        // TEMPORAL: Primero vamos a hacer que funcione como ayer (sin Supabase)
        // Después agregaremos el guardado en Supabase paso a paso
        
        // Limpiar archivo temporal
        fs.unlinkSync(imageFile.path);
        
        return res.json({
          success: true,
          imageUrl: resultImageUrl,
          prompt: prompt,
          processingTime: attempts * 5
        });
      }

      if (statusData.status === 'failed') {
        console.error('❌ Generación fallida:', statusData.error);
        fs.unlinkSync(imageFile.path);
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
    fs.unlinkSync(imageFile.path);
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

// Endpoint para mejorar calidad de imagen
app.post('/api/enhance-image', upload.single('image'), async (req, res) => {
  try {
    console.log('✨ Iniciando mejora de calidad de imagen...');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó imagen' });
    }

    // Verificar API key
    if (!API_CONFIG.replicateUpscale.apiKey) {
      return res.status(500).json({ 
        error: 'Replicate API no configurada para upscaling',
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

    console.log('🔧 Llamando a SwinIR para mejora de calidad...');

    // Llamar a Replicate SwinIR para mejora de calidad
    const replicateResponse = await fetch(`${API_CONFIG.replicateUpscale.baseUrl}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_CONFIG.replicateUpscale.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: API_CONFIG.replicateUpscale.version,
        input: {
          image: publicImageUrl,
          task: "real_sr", // Tarea de super-resolución
          scale: 2 // Aumentar resolución x2
        }
      })
    });

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      console.error('❌ Error de Replicate (upscale):', errorText);
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ 
        error: 'Error al comunicarse con Replicate para upscaling',
        details: errorText
      });
    }

    const prediction = await replicateResponse.json();
    console.log('📡 Predicción de upscaling iniciada:', prediction.id);

    // Polling para obtener resultado
    let attempts = 0;
    const maxAttempts = 60; // 5 minutos máximo

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`${API_CONFIG.replicateUpscale.baseUrl}/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${API_CONFIG.replicateUpscale.apiKey}`,
        }
      });

      const statusData = await statusResponse.json();
      console.log(`📊 Intento upscale ${attempts + 1}: ${statusData.status}`);

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
        
        console.log('✅ Imagen mejorada exitosamente');
        
        // Limpiar archivo temporal
        fs.unlinkSync(req.file.path);
        
        return res.json({
          success: true,
          imageUrl: resultImageUrl,
          processingTime: attempts * 5
        });
      }

      if (statusData.status === 'failed') {
        console.error('❌ Mejora fallida:', statusData.error);
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ 
          error: 'La mejora de imagen falló',
          details: statusData.error
        });
      }

      // Esperar 5 segundos antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    // Timeout
    fs.unlinkSync(req.file.path);
    return res.status(408).json({ error: 'Timeout: La mejora de imagen tomó demasiado tiempo' });

  } catch (error) {
    console.error('💥 Error general en mejora de imagen:', error);
    
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

// En Vercel, el directorio /tmp ya existe y es temporal
console.log('📁 Usando directorio temporal /tmp para archivos');

// Solo iniciar el servidor si no estamos en Vercel
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend iniciado en http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    
    // Verificar configuración
    if (API_CONFIG.replicate.apiKey) {
      console.log('✅ Replicate API configurada');
    } else {
      console.log('⚠️  Replicate API no configurada');
    }
    
    if (API_CONFIG.openai.apiKey) {
      console.log('✅ OpenAI API configurada');
    } else {
      console.log('⚠️  OpenAI API no configurada');
    }
  });
}

// Exportar para Vercel
export default app;