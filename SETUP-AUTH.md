# 🔐 Setup de Autenticación y Base de Datos

## 📋 **Pasos para configurar Supabase**

### **1. Crear proyecto en Supabase**

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Guarda la URL del proyecto y la API Key (anon, public)

### **2. Configurar autenticación**

1. Ve a **Authentication > Settings** en tu dashboard de Supabase
2. Configura:
   - **Site URL**: `https://tu-dominio.vercel.app` (o `http://localhost:5173` para desarrollo)
   - **Redirect URLs**: `https://tu-dominio.vercel.app/auth/callback`

### **3. Configurar Google OAuth (Opcional)**

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto nuevo o usa uno existente
3. Habilita la API de Google+
4. Ve a **Credentials > Create Credentials > OAuth 2.0 Client IDs**
5. Configura:
   - **Application type**: Web application
   - **Authorized redirect URIs**: `https://tu-proyecto.supabase.co/auth/v1/callback`
6. Copia el Client ID y Client Secret
7. En Supabase: **Authentication > Providers > Google**
   - Habilita Google
   - Pega el Client ID y Client Secret

### **4. Ejecutar el esquema de base de datos**

1. Ve a **SQL Editor** en tu dashboard de Supabase
2. Copia y pega el contenido de `supabase-schema.sql`
3. Ejecuta el script
4. Verifica que se crearon las tablas: `profiles`, `projects`, `images`, `billing_history`, `credit_usage`

### **5. Configurar Storage Buckets**

1. Ve a **Storage** en tu dashboard de Supabase
2. Crea dos buckets:
   - `user-images` (privado)
   - `project-images` (privado)
3. Configura las políticas de Storage (incluidas en el schema SQL)

### **6. Variables de entorno**

Crea un archivo `.env` basado en `env.example` y configura:

```bash
# Supabase Frontend (VITE_ prefix para Vite)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Supabase Backend (para las funciones de servidor)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## 🚀 **Funcionalidades implementadas**

### **✅ Autenticación**
- ✅ Registro con email/contraseña
- ✅ Login con email/contraseña  
- ✅ Login con Google OAuth
- ✅ Reset de contraseña
- ✅ Logout
- ✅ Contexto de autenticación global

### **✅ Gestión de usuarios**
- ✅ Perfiles de usuario automáticos
- ✅ Row Level Security (RLS)
- ✅ Sistema de suscripciones/trial
- ✅ Tracking de créditos

### **✅ Base de datos**
- ✅ Esquema completo de tablas
- ✅ Triggers automáticos
- ✅ Índices optimizados
- ✅ Políticas de seguridad

### **✅ Frontend**
- ✅ Modal de autenticación
- ✅ Protección de rutas
- ✅ Header con estado de usuario
- ✅ Callbacks para OAuth

## 📚 **Próximos pasos**

### **🔄 Pendientes por implementar:**

1. **Dashboard de usuario**
   - Vista de proyectos
   - Estadísticas de uso
   - Gestión de perfil

2. **Gestión de proyectos**
   - Crear/editar/eliminar proyectos
   - Asignar imágenes a proyectos
   - Gestión de metadatos

3. **Sistema de pagos**
   - Integración con Stripe
   - Planes de suscripción
   - Webhooks de billing

4. **Almacenamiento de imágenes**
   - Subida directa a Supabase Storage
   - Organización por usuario/proyecto
   - Limpieza automática (30 días)

5. **Analytics y monitoring**
   - Tracking de uso
   - Métricas de rendimiento
   - Logs de errores

## 🔧 **Comandos útiles**

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Lint del código
npm run lint
```

## 📝 **Notas importantes**

1. **Seguridad**: Todas las tablas tienen RLS habilitado
2. **Performance**: Índices optimizados para consultas frecuentes
3. **Limpieza**: Sistema automático de borrado de imágenes temporales
4. **Escalabilidad**: Diseño preparado para múltiples usuarios y proyectos

## 🆘 **Troubleshooting**

### **Error: "Missing Supabase environment variables"**
- Verifica que las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén en tu `.env`

### **Error de CORS en Google OAuth**
- Verifica que la redirect URI en Google Console coincida exactamente

### **Error: "Row Level Security policy violation"**
- Verifica que las políticas RLS estén configuradas correctamente
- Asegúrate de que el usuario esté autenticado

### **Imágenes no se suben**
- Verifica los buckets de Storage en Supabase
- Revisa las políticas de Storage
- Confirma que las variables de entorno del backend estén configuradas
