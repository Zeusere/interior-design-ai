// Configuración específica para Vercel
// Esta configuración evita problemas con import.meta.env en producción

export const VERCEL_CONFIG = {
  // Endpoints de Vercel
  GEMINI_ENDPOINT: '/api/gemini',
  HEALTH_CHECK: '/api/health',
  
  // Configuración de Gemini
  GEMINI_MODEL: 'gemini-2.5-flash-image-preview',
  GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent',
  
  // Configuración de archivos
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  
  // Configuración de generación
  RESPONSE_MIME_TYPE: 'image/png' as const,
  TEMPERATURE: 0.7,
  
  // Prompts predefinidos
  PROMPTS: {
    default: [
      'Edit the input photo: keep the person and pose, replace only the outfit.',
      'Use realistic lighting, consistent body geometry, and natural fabric folds.',
      'Return a single photorealistic image.',
      'This is an adult model. Do not create sensitive or explicit content.'
    ],
    
    withClothing: [
      'Edit the input photo: keep the person and pose, replace only the outfit.',
      'Use realistic lighting, consistent body geometry, and natural fabric folds.',
      'Return a single photorealistic image.',
      'Use the provided clothing reference for style and design.',
      'This is an adult model. Do not create sensitive or explicit content.'
    ]
  }
};

// Función helper para obtener el prompt apropiado
export function getVercelGeminiPrompt(type: keyof typeof VERCEL_CONFIG.PROMPTS, clothingUrl?: string): string {
  const basePrompt = VERCEL_CONFIG.PROMPTS[type];
  
  if (clothingUrl && type === 'withClothing') {
    return [...basePrompt.slice(0, -1), `Use this clothing reference/style: ${clothingUrl}`, basePrompt[basePrompt.length - 1]].join(' ');
  }
  
  return basePrompt.join(' ');
}

// Función helper para verificar si estamos en Vercel
export function isVercel(): boolean {
  return typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
}

// Función helper para obtener la URL base de la API
export function getVercelApiUrl(): string {
  if (isVercel()) {
    return ''; // URL relativa en Vercel
  }
  return 'http://localhost:3001'; // Desarrollo local
}
