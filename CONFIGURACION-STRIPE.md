# 🚀 Configuración del Sistema de Suscripciones con Stripe

## 📋 Resumen del Sistema

Has implementado un sistema completo de suscripciones que incluye:

- ✅ **Plan Gratuito**: 1 generación única
- ✅ **Plan Pro Mensual**: $19/mes - Generaciones ilimitadas  
- ✅ **Plan Pro Anual**: $149/año (34% descuento) - Generaciones ilimitadas
- ✅ **Modal de upgrade automático** cuando se alcanza el límite
- ✅ **Verificación de límites** antes de cada generación
- ✅ **Procesamiento individual y por lotes** con control de límites

## ⚙️ Configuración de Stripe (Paso a Paso)

### 1. Crear Cuenta en Stripe
```bash
1. Ve a https://dashboard.stripe.com/register
2. Completa el registro
3. Verifica tu email
4. Completa el onboarding básico
```

### 2. Configurar Productos y Precios
```bash
# En el Dashboard de Stripe:
1. Ir a "Products" > "Add product"

# Producto 1: Interior AI Pro Mensual
- Nombre: Interior AI Pro
- Descripción: Generaciones ilimitadas de diseños con IA
- Precio: $19.00 USD
- Billing period: Monthly
- Guardar el Price ID (ej: price_1ABC123...)

# Producto 2: Interior AI Pro Anual  
- Nombre: Interior AI Pro
- Descripción: Generaciones ilimitadas de diseños con IA
- Precio: $149.00 USD  
- Billing period: Yearly
- Guardar el Price ID (ej: price_1DEF456...)
```

### 3. Configurar Webhooks
```bash
# En el Dashboard de Stripe:
1. Ir a "Developers" > "Webhooks"
2. Click "Add endpoint"
3. Endpoint URL: https://tudominio.com/api/stripe-webhook
4. Eventos a escuchar:
   - customer.subscription.created
   - customer.subscription.updated  
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
5. Guardar el Webhook Secret (whsec_...)
```

### 4. Obtener Claves API
```bash
# En "Developers" > "API keys":
- Publishable key (pk_test_...) - Para el frontend
- Secret key (sk_test_...) - Para el backend
```

## 🔧 Configuración del Proyecto

### 1. Variables de Entorno
Crea un archivo `.env` basado en `env.example`:

```env
# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_test_tu_clave_publica_aqui
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui
STRIPE_MONTHLY_PRICE_ID=price_tu_price_id_mensual_aqui
STRIPE_YEARLY_PRICE_ID=price_tu_price_id_anual_aqui

# Supabase (necesario para el service role)
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key_aqui

# API URL
VITE_API_URL=https://tudominio.com
```

### 2. Configurar Base de Datos
Ejecuta el script SQL en Supabase:

```sql
-- Ejecutar el contenido de supabase-subscription-schema.sql
-- en el SQL Editor de Supabase
```

### 3. Desplegar API Routes
Las siguientes rutas deben estar disponibles en tu backend:

```
/api/stripe-checkout     - Crear sesión de checkout
/api/stripe-webhook      - Manejar webhooks de Stripe  
/api/subscription-status - Obtener estado de suscripción
/api/update-usage       - Incrementar contador de uso
```

## 🎯 Flujo de Usuario Completo

### Usuario Nuevo (Gratuito)
1. Se registra → Obtiene 1 generación gratuita
2. Usa su generación → Se muestra progreso (1/1)
3. Intenta generar otra → Modal de upgrade automático
4. Selecciona plan → Redirect a Stripe Checkout
5. Completa pago → Se convierte en Pro con generaciones ilimitadas

### Usuario Pro
1. Puede generar ilimitadamente
2. Contador de uso no se incrementa
3. Acceso a todas las funciones premium

## 🔄 Testing del Sistema

### Configuración de Testing
```bash
# Usar las claves de test de Stripe (pk_test_, sk_test_)
# URLs de webhook de test

# Tarjetas de prueba:
4242 4242 4242 4242 - Visa exitosa
4000 0000 0000 0002 - Tarjeta declinada
4000 0000 0000 9995 - Fondos insuficientes
```

### Flujo de Pruebas
1. **Crear usuario gratuito** → Verificar límite de 1 uso
2. **Intentar segunda generación** → Debe mostrar modal de upgrade
3. **Completar compra con tarjeta de prueba** → Verificar que se activa Pro
4. **Generar múltiples diseños** → Verificar uso ilimitado
5. **Webhook testing** → Usar Stripe CLI o herramientas de testing

## 📊 Métricas Recomendadas

### KPIs a Monitorear
- **Conversion Rate**: Usuarios gratuitos → Pro
- **Churn Rate**: Cancelaciones mensuales
- **CAC**: Costo de adquisición de cliente
- **LTV**: Valor de vida del cliente
- **Usage Patterns**: Frecuencia de uso post-upgrade

### Dashboard de Stripe
Configurar métricas importantes:
- Nuevas suscripciones por día/semana
- Revenue mensual recurrente (MRR)
- Cancelaciones y reactivaciones
- Geografía de pagos

## 🚨 Consideraciones de Producción

### Seguridad
- ✅ Claves de API como variables de entorno
- ✅ Validación de webhooks con signature
- ✅ Row Level Security en Supabase
- ✅ Rate limiting en endpoints sensibles

### Escalabilidad
- ✅ Base de datos optimizada con índices
- ✅ Caching de estado de suscripción
- ✅ Separación de lógica de pagos
- ✅ Manejo robusto de errores

### UX/UI Optimizada para Conversión
- ✅ Modal de upgrade no intrusivo
- ✅ Descuento anual visible (34% off)
- ✅ Progress bar de uso gratuito
- ✅ Pricing transparente
- ✅ Checkout nativo en el dominio

## 🎉 ¡Sistema Listo!

Tu sistema de suscripciones está completamente implementado y listo para generar ingresos recurrentes. El flujo está optimizado para conversión máxima con una experiencia de usuario premium.

### Próximos Pasos
1. Configurar las variables de entorno de producción
2. Ejecutar el script de base de datos en Supabase
3. Desplegar las API routes
4. Configurar los productos en Stripe
5. ¡Empezar a recibir suscripciones! 🚀
