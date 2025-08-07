# 🏠 Interior AI - Diseño de Interiores con IA

> Transforma tu hogar con diseños profesionales generados por inteligencia artificial

![Interior AI Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.0-blue)

## ✨ Características

- 🤖 **IA Avanzada**: Algoritmos de última generación para transformación de espacios
- ⚡ **Resultados Instantáneos**: Diseños profesionales en menos de 30 segundos
- 🎨 **Múltiples Estilos**: Desde moderno minimalista hasta clásico elegante
- 📱 **Responsive**: Optimizado para móvil, tablet y desktop
- 🔒 **Privacidad Total**: Tus imágenes están completamente seguras
- 💾 **Descarga HD**: Exporta diseños en alta resolución

## 🚀 Demo en Vivo

🌐 **Website**: [interior-ai.com](https://interior-ai.com)
📱 **App**: [interior-ai.com/app](https://interior-ai.com/app)

## 🛠️ Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Configuración Local

1. **Clonar repositorio**:
   ```bash
   git clone https://github.com/Zeusere/interior-design-ai.git
   cd interior-design-ai
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   # Editar .env con tus claves de API
   ```

4. **Ejecutar en desarrollo**:
   ```bash
   npm run dev:full
   ```

5. **Abrir en navegador**: `http://localhost:5173`

### Scripts Disponibles

```bash
npm run dev          # Solo frontend (Vite)
npm run server       # Solo backend (Express)
npm run dev:full     # Frontend + Backend completo
npm run build        # Build para producción
npm run preview      # Preview del build
```

## 🏗️ Arquitectura del Proyecto

```
src/
├── pages/              # Páginas principales
│   ├── LandingPage.tsx # Página de inicio
│   └── DesignApp.tsx   # Aplicación principal
├── components/
│   ├── landing/        # Componentes de landing
│   │   ├── Hero.tsx
│   │   ├── BeforeAfter.tsx
│   │   ├── Features.tsx
│   │   └── Footer.tsx
│   ├── Header.tsx      # Header global
│   └── SEO.tsx         # Componente SEO
├── services/           # Servicios de API
│   ├── aiService.ts
│   └── backendService.ts
└── assets/            # Recursos estáticos
```

## 🔧 Configuración de IA

Para configurar los servicios de IA, consulta la documentación detallada:

📖 **Ver**: [`CONFIGURACION-IA.md`](./CONFIGURACION-IA.md)

## 🌐 SEO y Metadatos

El proyecto incluye SEO optimizado con:

- ✅ Meta tags dinámicos
- ✅ Open Graph para redes sociales
- ✅ Twitter Cards
- ✅ Schema.org structured data
- ✅ Sitemap automático
- ✅ URLs canónicas

## 📱 Tecnologías Utilizadas

### Frontend
- **React 19** - Framework principal
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Styling utility-first
- **Framer Motion** - Animaciones fluidas
- **React Router** - Navegación SPA
- **Lucide Icons** - Iconografía moderna

### Backend
- **Express.js** - Servidor API
- **Multer** - Upload de archivos
- **Sharp** - Procesamiento de imágenes
- **CORS** - Cross-origin requests

### IA & Servicios
- **OpenAI API** - Generación de diseños
- **Supabase** - Base de datos y storage
- **Vercel** - Deployment y hosting

## 🚀 Deployment

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

### Otras plataformas

Compatible con:
- Netlify
- Railway
- Heroku
- AWS
- DigitalOcean

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! 

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Desarrollo**: Interior AI Team
- **Diseño**: UI/UX optimizado para conversión
- **IA**: Integración con modelos de última generación

## 📞 Soporte

- 📧 Email: hello@interior-ai.com
- 🐛 Issues: [GitHub Issues](https://github.com/Zeusere/interior-design-ai/issues)
- 💬 Discusiones: [GitHub Discussions](https://github.com/Zeusere/interior-design-ai/discussions)

---

<div align="center">
  <strong>Hecho con ❤️ para transformar hogares con IA</strong>
</div>