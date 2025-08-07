🏠 Interior AI - Diseño de Interiores con IA
Una aplicación moderna para transformar espacios interiores usando inteligencia artificial.

✨ Características
🎨 Diseño moderno y responsivo - Interfaz intuitiva con animaciones fluidas
🖼️ Carga de imágenes - Sistema drag & drop para subir fotos
🎭 Múltiples estilos - Moderno, clásico, industrial, bohemio, escandinavo, lujo
🏛️ Estilos arquitectónicos - Contemporáneo, mediterráneo, rústico, mid-century, art déco
💡 Control de iluminación - Natural, cálida, fría, dramática, ambiental
🎨 Esquemas de color - Neutro, monocromático, tierras, vibrante, pastel, joya
🏠 Tipos de habitación - Sala, dormitorio, cocina, comedor, baño, oficina
🤖 Integración con múltiples APIs de IA - Replicate, OpenAI, Stability AI, RunwayML
📱 Responsive - Funciona perfectamente en móviles y escritorio
🚀 Instalación
Clonar el repositorio

git clone <repository-url>
cd interior-design
Instalar dependencias

npm install
Configurar variables de entorno

cp env.example .env
Edita el archivo .env y añade al menos una API key:

# Replicate (Recomendado)
VITE_REPLICATE_API_KEY=r8_your_api_key_here

# OpenAI (Alternativa)
VITE_OPENAI_API_KEY=sk-your_api_key_here
Iniciar la aplicación

npm run dev
🔑 Configuración de APIs
Replicate (Recomendado)
Registro: https://replicate.com/
Pros: Especializado en modelos de imagen, excelente calidad para diseño de interiores
Pricing: Pay-per-use, muy competitivo
OpenAI DALL-E 3
Registro: https://platform.openai.com/
Pros: Muy fácil de usar, resultados consistentes
Nota: No soporta edición de imágenes directamente, genera nuevas imágenes
Stability AI
Registro: https://platform.stability.ai/
Pros: Control detallado, modelos especializados
RunwayML
Registro: https://runwayml.com/
Pros: Excelente para video y transformaciones complejas
🛠️ Tecnologías Utilizadas
React 18 - Framework principal
TypeScript - Tipado estático
Vite - Build tool rápido
Tailwind CSS - Estilos utilitarios
Framer Motion - Animaciones
React Dropzone - Carga de archivos
Lucide React - Iconos modernos
Axios - Cliente HTTP
📁 Estructura del Proyecto
src/
├── components/          # Componentes React
│   ├── Header.tsx      # Barra de navegación
│   ├── ImageUpload.tsx # Carga de imágenes
│   ├── EditingOptions.tsx # Panel de opciones
│   ├── ResultsGallery.tsx # Galería de resultados
│   └── ErrorBoundary.tsx  # Manejo de errores
├── services/           # Servicios de API
│   └── aiService.ts   # Integración con APIs de IA
├── App.tsx            # Componente principal
├── main.tsx          # Punto de entrada
└── index.css         # Estilos globales
🎯 Próximas Funcionalidades
 Sistema de autenticación de usuarios
 Planes de suscripción y pagos
 Historial de diseños por usuario
 Compartir diseños en redes sociales
 Exportar en diferentes formatos
 Comparación antes/después
 Generación de múltiples variantes
 Integración con realidad aumentada
 API REST para terceros
 Aplicación móvil nativa
🔧 Desarrollo
Scripts disponibles
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Linter
npm run type-check   # Verificar tipos TypeScript
Agregar un nuevo proveedor de IA
Implementa la interfaz AIProvider en src/services/aiService.ts
Añade la configuración en API_CONFIG
Registra el proveedor en el constructor de AIService
Añade las variables de entorno necesarias
📄 Licencia
MIT License - Ver archivo LICENSE para más detalles.

🤝 Contribuir
¡Las contribuciones son bienvenidas! Por favor:

Fork el proyecto
Crea una rama para tu feature (git checkout -b feature/AmazingFeature)
Commit tus cambios (git commit -m 'Add some AmazingFeature')
Push a la rama (git push origin feature/AmazingFeature)
Abre un Pull Request
📞 Soporte
Si tienes problemas o preguntas:

Revisa la documentación
Busca en los issues existentes
Crea un nuevo issue con detalles del problema
Incluye capturas de pantalla si es relevante
Hecho con ❤️ para transformar espacios con IA
