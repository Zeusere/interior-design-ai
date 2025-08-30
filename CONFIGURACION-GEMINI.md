# Configuración de Gemini AI para Interior Design

## Resumen de Mejoras Implementadas

### 1. ✅ Activación de Herramienta de Imagen
- **Antes**: Payload básico sin especificar herramientas
- **Ahora**: `tools: [{ image_generation: {} }]` para activar generación de imágenes
- **Resultado**: El modelo ahora sabe que debe generar imágenes en lugar de texto

### 2. ✅ Configuración de Formato de Salida
- **Antes**: Sin especificar formato de respuesta
- **Ahora**: `generationConfig.response_mime_type = 'image/png'`
- **Resultado**: Respuesta consistente en formato PNG

### 3. ✅ Cabeceras HTTP Correctas
- **Antes**: `User-Agent` personalizado y API key en query string
- **Ahora**: `x-goog-api-key` en cabecera (formato oficial)
- **Resultado**: Mayor seguridad y compatibilidad con la API

### 4. ✅ Manejo Mejorado de Errores
- **Antes**: Logs básicos de respuesta
- **Ahora**: Detección de bloqueos de safety, análisis de `finishReason`, `safetyRatings` y `promptFeedback`
- **Resultado**: Diagnóstico claro cuando las imágenes no se generan

### 5. ✅ Reintentos Exponenciales
- **Antes**: Sin reintentos
- **Ahora**: Reintentos automáticos para errores 500/503 con delays exponenciales
- **Resultado**: Mayor robustez ante fallos temporales del servidor

### 6. ✅ Prompt Mejorado
- **Antes**: Prompt simple y genérico
- **Ahora**: Prompt específico para "clothes swap" con instrucciones claras
- **Resultado**: Mejor calidad de imagen y menor probabilidad de bloqueos

## Estructura del Payload

```typescript
const payload = {
  contents: [{
    role: 'user',
    parts: [
      { text: prompt },
      { inline_data: { mime_type: request.personImage.type, data: personImageBase64 } },
      ...(clothingImageBase64 ? [{
        inline_data: { mime_type: request.clothingImage!.type, data: clothingImageBase64 }
      }] : [])
    ]
  }],
  tools: [{ image_generation: {} }],
  generationConfig: {
    response_mime_type: 'image/png',
    // temperature: 0.7, // opcional
  }
};
```

## Configuración de Variables de Entorno

### Para Desarrollo Local
```bash
# .env.local
VITE_GEMINI_API_KEY=tu_api_key_de_gemini_aqui
```

### Para Producción (Vercel)
```bash
# Variables de entorno en Vercel
GEMINI_API_KEY=tu_api_key_de_gemini_aqui
```

## Uso del Servicio

### Opción 1: Llamada Directa (Solo desarrollo)
```typescript
import geminiService from '@/services/geminiService'

const result = await geminiService.generateClotheSwap({
  personImage: personFile,
  clothingImage: clothingFile,
  prompt: 'Custom prompt here'
})
```

### Opción 2: Endpoint Serverless (Recomendado para producción)
```typescript
import geminiServiceServerless from '@/services/geminiServiceServerless'

const result = await geminiServiceServerless.generateClotheSwap({
  personImage: personFile,
  clothingImage: clothingFile,
  prompt: 'Custom prompt here'
})
```

## Diagnóstico de Problemas

### Respuesta Vacía (0 parts)
Cuando `parts.length === 0`, revisa en consola:

```typescript
console.warn('finishReason:', cand?.finishReason);
console.warn('safetyRatings:', cand?.safetyRatings);
console.warn('promptFeedback:', data?.promptFeedback);
```

#### Posibles Causas:
1. **SAFETY**: Bloqueado por políticas de contenido
2. **RECITATION**: Respuesta repetitiva
3. **MAX_TOKENS**: Límite de tokens alcanzado
4. **OTHER**: Otros motivos

### Errores HTTP
- **400**: Payload malformado
- **401**: API key inválida
- **403**: Cuota excedida o API key bloqueada
- **500/503**: Error del servidor (se reintenta automáticamente)

## Prompt Recomendado

```typescript
private generateImagePrompt(clothingUrl?: string): string {
  return [
    'Edit the input photo: keep the person and pose, replace only the outfit.',
    'Use realistic lighting, consistent body geometry, and natural fabric folds.',
    'Return a single photorealistic image.',
    clothingUrl ? `Use this clothing reference/style: ${clothingUrl}` : '',
    'This is an adult model. Do not create sensitive or explicit content.'
  ].join(' ');
}
```

## Seguridad

### ❌ NO Hacer (Desarrollo)
```typescript
// Exponer API key en el frontend
VITE_GEMINI_API_KEY=sk-...
```

### ✅ Hacer (Producción)
```typescript
// Usar endpoint serverless
const response = await fetch('/api/gemini', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

## Migración a Producción

1. **Crear endpoint serverless** en `/api/gemini.ts`
2. **Configurar variable** `GEMINI_API_KEY` en Vercel
3. **Cambiar import** de `geminiService` a `geminiServiceServerless`
4. **Eliminar** `VITE_GEMINI_API_KEY` del frontend

## Testing

### Verificar Configuración
```typescript
console.log('Payload structure:', {
  hasTools: !!payload.tools,
  hasGenerationConfig: !!payload.generationConfig,
  responseMimeType: payload.generationConfig.response_mime_type
})
```

### Verificar Respuesta
```typescript
console.log('Response structure:', {
  hasCandidates: !!data.candidates,
  candidatesLength: data.candidates?.length || 0,
  firstCandidateParts: data.candidates?.[0]?.content?.parts?.length || 0
})
```

## Troubleshooting

### "No se generó imagen"
1. Verifica que `tools: [{ image_generation: {} }]` esté presente
2. Revisa `finishReason` en consola
3. Ajusta el prompt si es bloqueado por safety

### "Error 401"
1. Verifica que la API key sea válida
2. Asegúrate de usar `x-goog-api-key` en cabecera
3. No uses query string para la API key

### "Error 500/503"
1. Se reintenta automáticamente
2. Si persiste, verifica el estado de la API de Gemini
3. Revisa logs del servidor para más detalles
