import type { DesignOptions } from '../types'
import { AI_CONFIG, STYLE_PROMPTS, ROOM_CONFIG } from '../config/ai'
import { BackendService } from './backendService'

export interface AIProvider {
  name: string
  generateDesign: (imageData: string, options: DesignOptions, userId?: string) => Promise<string>
  isAvailable: () => boolean
}

// Configuración de diferentes proveedores de IA
const AI_PROVIDERS = {
  REPLICATE: 'replicate',
  OPENAI: 'openai',
  STABILITY: 'stability',
  RUNWAY: 'runway'
} as const

type AIProviderType = typeof AI_PROVIDERS[keyof typeof AI_PROVIDERS]

// Configuración de APIs keys
const API_KEYS = {
  replicate: import.meta.env.VITE_REPLICATE_API_KEY,
  openai: import.meta.env.VITE_OPENAI_API_KEY,
  stability: import.meta.env.VITE_STABILITY_API_KEY,
  runway: import.meta.env.VITE_RUNWAY_API_KEY
}

class ReplicateProvider implements AIProvider {
  name = 'Replicate'

  isAvailable(): boolean {
    return !!API_KEYS.replicate
  }

  async generateDesign(imageData: string, options: DesignOptions, userId?: string): Promise<string> { // eslint-disable-line @typescript-eslint/no-unused-vars
    const prompt = this.createPrompt(options)
    
    try {
      const response = await fetch(`${AI_CONFIG.replicate.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${API_KEYS.replicate}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: AI_CONFIG.replicate.version,
          input: {
            image: imageData,
            prompt: prompt,
            negative_prompt: AI_CONFIG.replicate.defaultParams.negative_prompt,
            num_inference_steps: AI_CONFIG.replicate.defaultParams.num_inference_steps,
            guidance_scale: AI_CONFIG.replicate.defaultParams.guidance_scale,
            prompt_strength: AI_CONFIG.replicate.defaultParams.prompt_strength,
            seed: Math.floor(Math.random() * 1000000)
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Replicate API error: ${response.statusText}`)
      }

      const prediction = await response.json()
      
      // Polling para esperar el resultado
      return await this.pollForResult(prediction.id)
    } catch (error) {
      console.error('Error with Replicate:', error)
      throw new Error('Error al generar el diseño con Replicate')
    }
  }

  private async pollForResult(predictionId: string): Promise<string> {
    let attempts = 0
    const maxAttempts = 60 // 5 minutos máximo

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${AI_CONFIG.replicate.baseUrl}/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${API_KEYS.replicate}`,
          }
        })

        const prediction = await response.json()

        if (prediction.status === 'succeeded') {
          return prediction.output[0] // URL de la imagen generada
        }

        if (prediction.status === 'failed') {
          throw new Error('La generación falló')
        }

        // Esperar 5 segundos antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 5000))
        attempts++
      } catch (error) {
        console.error('Error polling result:', error)
        throw error
      }
    }

    throw new Error('Timeout esperando el resultado')
  }

  private createPrompt(options: DesignOptions): string {
    // Obtener configuraciones específicas
    const styleConfig = STYLE_PROMPTS[options.style as keyof typeof STYLE_PROMPTS]
    const roomConfig = ROOM_CONFIG[options.roomType as keyof typeof ROOM_CONFIG]
    
    // Crear prompt optimizado
    const baseDescription = styleConfig?.description || `${options.style} interior design`
    const roomFocus = roomConfig?.focus || 'beautiful living space'
    const roomKeywords = roomConfig?.keywords?.join(', ') || ''
    
    const lightingMap: Record<string, string> = {
      natural: 'abundant natural lighting from large windows',
      warm: 'warm cozy lighting with soft golden tones',
      cool: 'cool bright lighting with crisp white tones',
      dramatic: 'dramatic lighting with strong contrasts and shadows',
      ambient: 'soft ambient lighting creating a relaxing atmosphere'
    }

    const colorMap: Record<string, string> = {
      neutral: 'neutral color palette with sophisticated beiges and grays',
      monochrome: 'elegant monochromatic black and white color scheme',
      earth: 'warm earth tone colors with rich browns and natural ochres',
      vibrant: 'vibrant bold colors creating energy and personality',
      pastel: 'soft pastel colors for a gentle and calming atmosphere',
      jewel: 'rich jewel tone colors with deep emeralds, sapphires, and rubies'
    }

    const architectureMap: Record<string, string> = {
      contemporary: 'contemporary architectural elements with clean lines',
      mediterranean: 'mediterranean architectural features with arches and terracotta',
      farmhouse: 'rustic farmhouse architectural details with natural wood',
      'mid-century': 'mid-century modern architectural elements with geometric shapes',
      'art-deco': 'art deco architectural details with geometric patterns and luxury materials'
    }

    const prompt = [
      `Transform this ${options.roomType.replace('-', ' ')} into a stunning ${baseDescription}`,
      `featuring ${lightingMap[options.lighting] || options.lighting}`,
      `and ${colorMap[options.colorScheme] || options.colorScheme}.`,
      `Incorporate ${architectureMap[options.architecture] || options.architecture}.`,
      roomKeywords && `Include elements like ${roomKeywords}.`,
      `Focus on ${roomFocus}.`,
      'Professional interior design photography, photorealistic, 4K resolution,',
      'high-end materials, perfect composition, award-winning interior design,',
      'architectural digest style, luxury finishes, impeccable attention to detail.'
    ].filter(Boolean).join(' ')

    return prompt
  }
}

class OpenAIProvider implements AIProvider {
  name = 'OpenAI DALL-E'

  isAvailable(): boolean {
    return !!API_KEYS.openai
  }

  async generateDesign(_imageData: string, options: DesignOptions): Promise<string> {
    // Nota: DALL-E 3 no soporta edición de imágenes directamente
    // Se usaría para generar nuevas imágenes basadas en descripción
    const prompt = this.createPrompt(options)
    
    try {
      const response = await fetch(`${AI_CONFIG.openai.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEYS.openai}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: AI_CONFIG.openai.model,
          prompt: prompt,
          n: 1,
          size: AI_CONFIG.openai.defaultParams.size,
          quality: AI_CONFIG.openai.defaultParams.quality,
          style: AI_CONFIG.openai.defaultParams.style
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data[0].url
    } catch (error) {
      console.error('Error with OpenAI:', error)
      throw new Error('Error al generar el diseño con OpenAI')
    }
  }

  private createPrompt(options: DesignOptions): string {
    return `A beautiful ${options.style} ${options.roomType} interior design with ${options.lighting} lighting, ${options.colorScheme} color scheme, and ${options.architecture} architectural elements. Professional interior design photography, high resolution, realistic.`
  }
}

// Servicio principal de IA
class AIService {
  private providers: Map<AIProviderType, AIProvider> = new Map()

  constructor() {
    this.providers.set('replicate', new ReplicateProvider())
    this.providers.set('openai', new OpenAIProvider())
  }

  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.values()).filter(provider => provider.isAvailable())
  }

  async enhanceImage(imageData: string): Promise<string> {
    try {
      // Intentar primero con el backend
      console.log('🚀 Mejorando calidad de imagen con backend...')
      return await BackendService.enhanceImage(imageData)
    } catch (backendError) {
      console.warn('⚠️ Backend no disponible para mejora, usando simulación:', backendError)
      
      // Fallback: simulación de mejora
      return this.simulateImageEnhancement(imageData)
    }
  }

  async generateDesign(
    imageData: string, 
    options: DesignOptions, 
    preferredProvider?: AIProviderType,
    userId?: string
  ): Promise<string> {
    try {
      // Intentar primero con el backend
      console.log('🚀 Intentando generación con backend...')
      return await BackendService.generateDesign(imageData, options, userId)
    } catch (backendError) {
      console.warn('⚠️ Backend no disponible, usando fallback:', backendError)
      
      // Fallback: intentar con proveedores directos (solo funcionará si se resuelven los CORS)
      const availableProviders = this.getAvailableProviders()
      
      if (availableProviders.length === 0) {
        // Último recurso: simulación
        console.log('📱 Usando simulación para demostración')
        return this.simulateGeneration(imageData, options)
      }

      let provider: AIProvider | undefined

      if (preferredProvider && this.providers.has(preferredProvider)) {
        provider = this.providers.get(preferredProvider)
        if (!provider?.isAvailable()) {
          provider = undefined
        }
      }

      if (!provider) {
        provider = availableProviders[0]
      }

      try {
        return await provider.generateDesign(imageData, options, userId)
      } catch (error) {
        console.error(`Error with provider ${provider.name}:`, error)
        
        // Intentar con otro proveedor disponible
        const otherProviders = availableProviders.filter(p => p !== provider)
        if (otherProviders.length > 0) {
          return await otherProviders[0].generateDesign(imageData, options, userId)
        }
        
        // Último recurso: simulación
        console.log('📱 Todos los proveedores fallaron, usando simulación')
        return this.simulateGeneration(imageData, options)
      }
    }
  }

  private async simulateImageEnhancement(imageData: string): Promise<string> {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    try {
      return await this.applyEnhancementEffect(imageData)
    } catch (error) {
      console.warn('No se pudo aplicar efecto de mejora, devolviendo imagen original:', error)
      return imageData
    }
  }

  private async simulateGeneration(imageData: string, options: DesignOptions): Promise<string> {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // En producción, cuando no hay backend disponible, aplicamos un efecto visual básico
    // usando Canvas API para simular un cambio de estilo
    try {
      return await this.applyVisualEffect(imageData, options)
    } catch (error) {
      console.warn('No se pudo aplicar efecto visual, devolviendo imagen original:', error)
      return imageData
    }
  }

  private async applyVisualEffect(imageData: string, options: DesignOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto de canvas'))
          return
        }

        // Configurar canvas
        canvas.width = img.width
        canvas.height = img.height
        
        // Dibujar imagen original
        ctx.drawImage(img, 0, 0)
        
        // Aplicar efectos según las opciones
        this.applyStyleEffects(ctx, canvas.width, canvas.height, options)
        
        // Convertir a data URL
        try {
          const processedImageData = canvas.toDataURL('image/jpeg', 0.9)
          resolve(processedImageData)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
      img.src = imageData
    })
  }

  private applyStyleEffects(ctx: CanvasRenderingContext2D, width: number, height: number, options: DesignOptions) {
    // Aplicar filtros según el estilo seleccionado
    switch (options.style) {
      case 'modern':
        // Aumentar contraste y saturación
        ctx.filter = 'contrast(1.2) saturate(1.1) brightness(1.05)'
        break
      case 'classic':
        // Efecto vintage suave
        ctx.filter = 'sepia(0.3) contrast(1.1) brightness(0.95)'
        break
      case 'industrial':
        // Efecto más oscuro y contrastado
        ctx.filter = 'contrast(1.3) brightness(0.9) saturate(0.8)'
        break
      case 'bohemian':
        // Colores más vibrantes
        ctx.filter = 'saturate(1.4) brightness(1.1) contrast(1.1)'
        break
      case 'scandinavian':
        // Efecto claro y limpio
        ctx.filter = 'brightness(1.15) contrast(1.05) saturate(0.9)'
        break
      case 'luxury':
        // Efecto premium con más contraste
        ctx.filter = 'contrast(1.25) brightness(1.05) saturate(1.2)'
        break
      default:
        // Efecto neutral
        ctx.filter = 'contrast(1.1) brightness(1.02)'
    }

    // Aplicar el filtro redibujando la imagen
    const imageData = ctx.getImageData(0, 0, width, height)
    ctx.putImageData(imageData, 0, 0)
    
    // Aplicar overlay de color según el esquema de colores
    this.applyColorOverlay(ctx, width, height, options.colorScheme)
  }

  private async applyEnhancementEffect(imageData: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto de canvas'))
          return
        }

        // Configurar canvas con mayor resolución para simular upscaling
        const scale = 1.5 // Simular un aumento de resolución
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        
        // Configurar filtros de mejora
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        // Aplicar filtros de mejora de calidad
        ctx.filter = 'contrast(1.15) brightness(1.05) saturate(1.1) sharpen(1.2)'
        
        // Dibujar imagen escalada con interpolación suave
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Aplicar post-procesamiento para mejorar detalles
        this.enhanceImageDetails(ctx, canvas.width, canvas.height)
        
        // Convertir a data URL con alta calidad
        try {
          const enhancedImageData = canvas.toDataURL('image/jpeg', 0.95)
          resolve(enhancedImageData)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
      img.src = imageData
    })
  }

  private enhanceImageDetails(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    
    // Aplicar sharpening básico
    for (let i = 0; i < data.length; i += 4) {
      // Incrementar ligeramente el contraste de cada pixel
      data[i] = Math.min(255, data[i] * 1.1)     // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.1) // Green
      data[i + 2] = Math.min(255, data[i + 2] * 1.1) // Blue
      // Alpha (data[i + 3]) se mantiene igual
    }
    
    ctx.putImageData(imageData, 0, 0)
    
    // Aplicar un subtle glow effect para simular mejor calidad
    ctx.shadowBlur = 1
    ctx.shadowColor = 'rgba(255, 255, 255, 0.3)'
  }

  private applyColorOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, colorScheme: string) {
    const overlayColors: Record<string, { r: number, g: number, b: number, a: number }> = {
      neutral: { r: 245, g: 245, b: 245, a: 0.1 },
      monochrome: { r: 0, g: 0, b: 0, a: 0.05 },
      earth: { r: 139, g: 69, b: 19, a: 0.15 },
      vibrant: { r: 255, g: 20, b: 147, a: 0.1 },
      pastel: { r: 255, g: 182, b: 193, a: 0.2 },
      jewel: { r: 75, g: 0, b: 130, a: 0.15 }
    }

    const color = overlayColors[colorScheme] || overlayColors.neutral
    
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
    ctx.fillRect(0, 0, width, height)
  }
}

export const aiService = new AIService()
export { AI_PROVIDERS }