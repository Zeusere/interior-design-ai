// Servicio para la API de Gemini usando endpoint serverless
// Esta versión es más segura para producción ya que no expone la API key
import { GEMINI_CONFIG, getGeminiPrompt } from '../config/gemini'

interface GeminiRequest {
  personImage: File
  clothingImage?: File
  clothingUrl?: string
  prompt?: string
}

interface GeminiResponse {
  success: boolean
  imageUrl?: string
  error?: string
}

class GeminiServiceServerless {
  private apiEndpoint = GEMINI_CONFIG.ENDPOINTS.serverless

  async generateClotheSwap(request: GeminiRequest): Promise<GeminiResponse> {
    // Validar que las imágenes no sean demasiado grandes
    if (request.personImage.size > 5 * 1024 * 1024) { // 5MB
      return {
        success: false,
        error: 'La imagen de la persona es demasiado grande. Máximo 5MB.'
      }
    }

    if (request.clothingImage && request.clothingImage.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'La imagen de la ropa es demasiado grande. Máximo 5MB.'
      }
    }

    try {
      // Convertir imágenes a base64
      const personImageBase64 = await this.fileToBase64(request.personImage)
      let clothingImageBase64 = null
      
      if (request.clothingImage) {
        clothingImageBase64 = await this.fileToBase64(request.clothingImage)
      }

      // Preparar el prompt para generación de imagen
      const prompt = request.prompt || this.generateImagePrompt(request.clothingUrl)

      // Construir el payload para Gemini con imagen de entrada
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
          // opcional:
          // temperature: 0.7,
        }
      }

      // Llamada al endpoint serverless local
      console.log('=== DEBUG GEMINI SERVERLESS REQUEST ===')
      console.log('Endpoint:', this.apiEndpoint)
      console.log('Prompt:', prompt)
      console.log('Person Image Size:', request.personImage.size, 'bytes')
      console.log('Clothing Image Size:', request.clothingImage?.size || 'N/A', 'bytes')
      console.log('Person Image Type:', request.personImage.type)
      console.log('Clothing Image Type:', request.clothingImage?.type || 'N/A')
      console.log('Payload structure:', {
        hasTools: !!payload.tools,
        hasGenerationConfig: !!payload.generationConfig,
        responseMimeType: payload.generationConfig.response_mime_type
      })
      console.log('============================')
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      console.log('=== DEBUG GEMINI SERVERLESS RESPONSE ===')
      console.log('Status:', response.status)
      console.log('Status Text:', response.statusText)
      console.log('============================')

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`
        
        try {
          const errorData = await response.json()
          console.error('Error completo de Gemini:', errorData)
          
          if (errorData.error?.message) {
            errorMessage = `Error de Gemini: ${errorData.error.message}`
          } else if (errorData.error?.details) {
            errorMessage = `Error de Gemini: ${JSON.stringify(errorData.error.details)}`
          } else if (errorData.error) {
            errorMessage = `Error de Gemini: ${errorData.error}`
          }
        } catch (parseError) {
          console.error('No se pudo parsear el error:', parseError)
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      console.log('=== DEBUG GEMINI SERVERLESS DATA ===')
      console.log('Response structure:', {
        hasCandidates: !!data.candidates,
        candidatesLength: data.candidates?.length || 0,
        firstCandidateParts: data.candidates?.[0]?.content?.parts?.length || 0
      })
      
      // Verificar si la respuesta está vacía y analizar el motivo
      const cand = data?.candidates?.[0];
      const parts = cand?.content?.parts ?? [];
      
      if (!parts.length) {
        console.warn('finishReason:', cand?.finishReason);
        console.warn('safetyRatings:', cand?.safetyRatings);
        console.warn('promptFeedback:', data?.promptFeedback);
        throw new Error(
          cand?.finishReason === 'SAFETY'
            ? 'La solicitud fue bloqueada por políticas (safety). Ajusta el prompt o las imágenes.'
            : 'No se generó imagen (respuesta vacía del modelo).'
        );
      }
      
      // Log detallado de cada parte de la respuesta
      if (parts.length > 0) {
        parts.forEach((part: any, index: number) => {
          console.log(`Part ${index}:`, {
            type: part.text ? 'text' : 'inline_data',
            hasText: !!part.text,
            hasInlineData: !!part.inline_data,
            mimeType: part.inline_data?.mime_type,
            dataLength: part.inline_data?.data?.length || 0
          })
        })
      }
      
      console.log('Full response data:', data)
      console.log('========================')
      
      // Buscar la imagen generada en la respuesta
      const generatedImagePart = parts.find(
        (part: any) => part.inline_data && part.inline_data.mime_type?.startsWith('image/')
      )
      
      if (generatedImagePart && generatedImagePart.inline_data) {
        // Convertir la imagen base64 a URL para mostrarla
        const imageData = generatedImagePart.inline_data.data
        const mimeType = generatedImagePart.inline_data.mime_type || 'image/png'
        const imageUrl = `data:${mimeType};base64,${imageData}`
        
        return {
          success: true,
          imageUrl: imageUrl
        }
      } else {
        // Si no se generó imagen, buscar texto de respuesta
        const generatedText = parts.find(
          (part: any) => part.text
        )?.text
        
        if (generatedText) {
          console.log('Respuesta de texto de Gemini:', generatedText)
        }
        
        throw new Error('No se pudo generar la imagen. Gemini devolvió solo texto.')
      }

    } catch (error) {
      console.error('Error en Gemini API Serverless:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al comunicarse con Gemini'
      }
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remover el prefijo "data:image/jpeg;base64," para obtener solo el base64
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        } else {
          reject(new Error('Error al convertir archivo a base64'))
        }
      }
      reader.onerror = error => reject(error)
    })
  }

  private generateImagePrompt(clothingUrl?: string): string {
    return getGeminiPrompt(clothingUrl ? 'withClothing' : 'default', clothingUrl);
  }

  async validateImage(image: File): Promise<boolean> {
    // Validar que la imagen sea válida
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    if (!validTypes.includes(image.type)) {
      return false
    }
    
    if (image.size > maxSize) {
      return false
    }
    
    return true
  }

  async processImage(image: File): Promise<string> {
    // Procesar la imagen antes de enviarla a Gemini
    // Aquí podrías hacer resize, compresión, etc.
    return URL.createObjectURL(image)
  }
}

export default new GeminiServiceServerless()
export type { GeminiRequest, GeminiResponse }
