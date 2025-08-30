export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      const API_KEY = process.env.GEMINI_API_KEY;
      if (!API_KEY) {
        return res.status(500).json({ error: 'Falta GEMINI_API_KEY en variables de entorno' });
      }
  
      const baseUrl =
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent';
  
      console.log('🤖 Gemini API request recibida en Vercel');
      console.log('📊 Payload size:', JSON.stringify(req.body).length, 'bytes');
  
      // Clonar el body para no mutar directamente req.body
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : { ...req.body };
  
      // Forzar herramientas y tipo de salida de imagen
      body.tools = body.tools ?? [{ image_generation: {} }];
      body.generationConfig = {
        response_mime_type: 'image/png',
        ...(body.generationConfig || {}),
      };
  
      // Reenviar la petición a Gemini con la API key del servidor
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY,
        },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
  
      console.log('🤖 Gemini API response status:', response.status);
      console.log('📊 Response data size:', JSON.stringify(data).length, 'bytes');
  
      return res.status(response.status).json(data);
    } catch (error) {
      console.error('💥 Error en endpoint Gemini de Vercel:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message,
      });
    }
  }
  