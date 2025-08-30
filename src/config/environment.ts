// Configuración de entorno para diferentes ambientes
export const ENV_CONFIG = {
  // Detectar si estamos en desarrollo o producción
  isDevelopment: import.meta.env.DEV || import.meta.env.MODE === 'development',
  isProduction: import.meta.env.PROD || import.meta.env.MODE === 'production',
  
  // URLs base según el ambiente
  API_BASE_URL: (import.meta.env.DEV || import.meta.env.MODE === 'development')
    ? 'http://localhost:3001'  // Desarrollo: servidor Express local
    : '/api',                  // Producción: endpoints relativos (para Vercel)
  
  // Configuración específica por ambiente
  development: {
    geminiEndpoint: 'http://localhost:3001/api/gemini',
    healthCheck: 'http://localhost:3001/api/health',
  },
  
  production: {
    geminiEndpoint: '/api/gemini',
    healthCheck: '/api/health',
  }
};

// Función helper para obtener la URL correcta según el ambiente
export function getApiUrl(endpoint: string): string {
  const baseUrl = ENV_CONFIG.API_BASE_URL;
  return `${baseUrl}${endpoint}`;
}

// Función helper para obtener la URL de Gemini
export function getGeminiUrl(): string {
  const url = ENV_CONFIG.isDevelopment 
    ? ENV_CONFIG.development.geminiEndpoint
    : ENV_CONFIG.production.geminiEndpoint;
  
  console.log('🔧 Configuración de entorno detectada:');
  console.log('  - import.meta.env.DEV:', import.meta.env.DEV);
  console.log('  - import.meta.env.MODE:', import.meta.env.MODE);
  console.log('  - isDevelopment:', ENV_CONFIG.isDevelopment);
  console.log('  - isProduction:', ENV_CONFIG.isProduction);
  console.log('  - URL seleccionada:', url);
  
  return url;
}

// Función helper para obtener la URL de health check
export function getHealthCheckUrl(): string {
  return ENV_CONFIG.isDevelopment 
    ? ENV_CONFIG.development.healthCheck
    : ENV_CONFIG.production.healthCheck;
}

// Función helper para verificar si estamos en desarrollo
export function isDevelopment(): boolean {
  return ENV_CONFIG.isDevelopment;
}

// Función helper para verificar si estamos en producción
export function isProduction(): boolean {
  return ENV_CONFIG.isProduction;
}
