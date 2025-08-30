// Configuración de Gemini AI
// Cambia esta variable para alternar entre servicios
import { getGeminiUrl } from './environment'

export const GEMINI_CONFIG = {
  // Cambia a 'direct' para desarrollo local o 'serverless' para producción
  SERVICE_TYPE: 'serverless' as 'direct' | 'serverless',
  
  // Configuración del modelo
  MODEL: 'gemini-2.5-flash-image-preview',
  
  // Configuración de generación
  GENERATION_CONFIG: {
    response_mime_type: 'image/png' as const,
    temperature: 0.7, // opcional: controla la creatividad (0.0 = muy conservador, 1.0 = muy creativo)
  },
  
  // Límites de archivos
  FILE_LIMITS: {
    maxSize: 5 * 1024 * 1024, // 5MB
    supportedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  },
  
  // Configuración de reintentos
  RETRY_CONFIG: {
    maxTries: 3,
    baseDelay: 1000, // 1 segundo
  },
  
  // Endpoints
  ENDPOINTS: {
    direct: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent',
    serverless: getGeminiUrl(), // Usar configuración de entorno
  },
  
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
    ],
    
    interiorDesign: [
      'Transform this room design: maintain the basic structure and layout.',
      'Apply modern interior design principles with improved aesthetics.',
      'Use harmonious color schemes, proper lighting, and stylish furniture.',
      'Return a single photorealistic image.',
      'Create a welcoming and functional living space.'
    ]
  }
}

// Función helper para obtener el prompt apropiado
export function getGeminiPrompt(type: keyof typeof GEMINI_CONFIG.PROMPTS, clothingUrl?: string): string {
  const basePrompt = GEMINI_CONFIG.PROMPTS[type];
  
  if (clothingUrl && type === 'withClothing') {
    return [...basePrompt.slice(0, -1), `Use this clothing reference/style: ${clothingUrl}`, basePrompt[basePrompt.length - 1]].join(' ');
  }
  
  return basePrompt.join(' ');
}

// Función helper para validar configuración
export function validateGeminiConfig(): string[] {
  const errors: string[] = [];
  
  if (!GEMINI_CONFIG.SERVICE_TYPE || !['direct', 'serverless'].includes(GEMINI_CONFIG.SERVICE_TYPE)) {
    errors.push('SERVICE_TYPE debe ser "direct" o "serverless"');
  }
  
  if (!GEMINI_CONFIG.MODEL) {
    errors.push('MODEL no puede estar vacío');
  }
  
  if (GEMINI_CONFIG.FILE_LIMITS.maxSize <= 0) {
    errors.push('maxSize debe ser mayor que 0');
  }
  
  if (GEMINI_CONFIG.RETRY_CONFIG.maxTries <= 0) {
    errors.push('maxTries debe ser mayor que 0');
  }
  
  return errors;
}

// Función helper para obtener el endpoint correcto
export function getGeminiEndpoint(): string {
  return GEMINI_CONFIG.ENDPOINTS[GEMINI_CONFIG.SERVICE_TYPE];
}

// Función helper para verificar si estamos en modo serverless
export function isServerlessMode(): boolean {
  return GEMINI_CONFIG.SERVICE_TYPE === 'serverless';
}

// Función helper para verificar si estamos en modo directo
export function isDirectMode(): boolean {
  return GEMINI_CONFIG.SERVICE_TYPE === 'direct';
}
