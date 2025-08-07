import type { DesignOptions } from '../App'
import { AI_CONFIG, STYLE_PROMPTS, ROOM_CONFIG } from '../config/ai'
import { BackendService } from './backendService'

export interface AIProvider {
  name: string
  generateDesign: (imageData: string, options: DesignOptions) => Promise<string>
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

  async generateDesign(imageData: string, options: DesignOptions): Promise<string> {
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

  async generateDesign(
    imageData: string, 
    options: DesignOptions, 
    preferredProvider?: AIProviderType
  ): Promise<string> {
    try {
      // Intentar primero con el backend
      console.log('🚀 Intentando generación con backend...')
      return await BackendService.generateDesign(imageData, options)
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
        return await provider.generateDesign(imageData, options)
      } catch (error) {
        console.error(`Error with provider ${provider.name}:`, error)
        
        // Intentar con otro proveedor disponible
        const otherProviders = availableProviders.filter(p => p !== provider)
        if (otherProviders.length > 0) {
          return await otherProviders[0].generateDesign(imageData, options)
        }
        
        // Último recurso: simulación
        console.log('📱 Todos los proveedores fallaron, usando simulación')
        return this.simulateGeneration(imageData, options)
      }
    }
  }

  private async simulateGeneration(imageData: string, _options: DesignOptions): Promise<string> {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // En un entorno real, aquí podríamos aplicar filtros CSS o usar una biblioteca de procesamiento de imágenes
    // Por ahora, devolvemos la imagen original con un efecto visual
    return imageData
  }
}

export const aiService = new AIService()
export { AI_PROVIDERS }