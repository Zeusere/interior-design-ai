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

// Configuración de API para mejora de imagen
const API_CONFIG = {
  replicateUpscale: {
    baseUrl: 'https://api.replicate.com/v1',
    model: 'jingyunliang/swinir',
    version: '660d922d33153019e8c263a3bba265de882e7f4f70396546b6c9c8f9d47a021a',
    apiKey: process.env.REPLICATE_API_KEY
  }
};

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

// Endpoint de health check específico para enhance
app.get('/api/enhance-health', (req, res) => {
  const hasReplicateKey = !!API_CONFIG.replicateUpscale.apiKey;
  
  res.json({
    status: 'ok',
    service: 'image-enhancement',
    apis: {
      replicate: hasReplicateKey,
      model: API_CONFIG.replicateUpscale.model
    },
    timestamp: new Date().toISOString()
  });
});

// Exportar para Vercel
export default app;
