import express from 'express';
import cors from 'cors';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';
import sharp from 'sharp';

const app = express();

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
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    console.log('📷 Imagen convertida a base64, tamaño:', base64.length);
    return base64;
  } catch (error) {
    console.error('Error procesando imagen:', error);
    throw new Error('Error al procesar la imagen');
  }
}

// Función para crear prompt
function createPrompt(options) {
  const styleMap = {
    modern: 'modern minimalist interior design with clean lines and contemporary furniture',
    classic: 'elegant classic interior design with traditional furniture and sophisticated decor',
    industrial: 'industrial interior design with exposed brick, metal elements and urban aesthetic',
    bohemian: 'bohemian interior design with eclectic mix of colors, textures and cultural elements',
    scandinavian: 'scandinavian interior design with light woods, neutral colors and functional furniture',
    luxury: 'luxury interior design with premium materials, sophisticated lighting and high-end finishes'
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
    natural: 'natural lighting',
    warm: 'warm lighting',
    cool: 'cool lighting',
    dramatic: 'dramatic lighting',
    ambient: 'ambient lighting'
  };

  const colorMap = {
    neutral: 'neutral color palette',
    monochrome: 'monochromatic color scheme',
    earth: 'earth tone colors',
    vibrant: 'vibrant colors',
    pastel: 'pastel colors',
    jewel: 'jewel tone colors'
  };

  const style = styleMap[options.style] || options.style;
  const room = roomMap[options.roomType] || options.roomType;
  const lighting = lightingMap[options.lighting] || options.lighting;
  const colors = colorMap[options.colorScheme] || options.colorScheme;

  return `Redesign this ${room} into a stunning ${style} featuring ${lighting} and ${colors}. Professional interior design photography, photorealistic, 4K resolution, high-end materials, perfect composition, award-winning interior design, architectural digest style, luxury finishes, impeccable attention to detail.`;
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

    // Procesar imagen
    const imageBase64 = imageToBase64(req.file.path);
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
          image: `data:image/jpeg;base64,${imageBase64}`,
          prompt: prompt,
          negative_prompt: 'low quality, blurry, distorted, ugly, bad anatomy',
          num_inference_steps: 20,
          guidance_scale: 7.5,
          prompt_strength: 0.8,
          seed: Math.floor(Math.random() * 1000000)
        }
      })
    });

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      console.error('❌ Error de Replicate:', errorText);
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ 
        error: 'Error al comunicarse con Replicate',
        details: errorText
      });
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
