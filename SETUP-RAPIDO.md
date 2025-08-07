# 🚀 Setup Rápido - 5 Minutos para Diseños Reales

## ✅ Paso 1: Obtener Token GRATUITO de Replicate

1. **Ir a Replicate:**
   - Abrir: https://replicate.com/
   - Hacer clic en "Sign up" (esquina superior derecha)

2. **Registrarse:**
   - Email + contraseña (o GitHub/Google)
   - ¡Es 100% GRATIS!

3. **Obtener API Token:**
   - Una vez logueado, ir a: **Account Settings** (tu avatar en esquina superior derecha)
   - Clic en: **"API tokens"**
   - Clic en: **"Create token"**
   - Copiar el token (empezará con `r8_...`)

## ✅ Paso 2: Configurar la Aplicación

```bash
# 1. Copiar configuración
cp env.example .env.local

# 2. Editar .env.local (abrir con cualquier editor)
# Pegar tu token en esta línea:
VITE_REPLICATE_API_KEY=r8_tu_token_aquí
```

## ✅ Paso 3: Iniciar Todo

```bash
# Abrir 2 terminales:

# Terminal 1 - Backend:
npm run server

# Terminal 2 - Frontend:
npm run dev
```

## ✅ Paso 4: ¡Probar!

1. Ir a: http://localhost:3000
2. Subir una foto de una habitación
3. Seleccionar estilo (moderno, clásico, etc.)
4. ¡Clic en "Generar Diseño"!

---

## 💰 **Costos (Muy Baratos):**

- ✅ **Gratis**: ~$10 en créditos al registrarte
- ✅ **Después**: Solo $0.0055 por imagen
- ✅ **Ejemplo**: $10 = ~1,800 diseños

## 🔧 **Solución de Problemas:**

### Error: "Backend no disponible"
```bash
# Verificar que el servidor esté corriendo:
npm run server
```

### Error: "API key inválida"
- Verificar que copiaste el token completo de Replicate
- Asegúrate que empiece con `r8_`

### Error: "CORS" o "Failed to fetch"
- Asegúrate de que AMBOS servidores estén corriendo
- Frontend: http://localhost:3000 
- Backend: http://localhost:3001

---

## 🎉 **¡Eso es todo!**

Con esto ya tienes diseños de interiores **REALES** con IA.

**¿Necesitas ayuda?** Revisa la consola del navegador (F12) para errores específicos.