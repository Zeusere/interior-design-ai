// Servicio para la API de Gemini
// Implementación real usando gemini-2.5-flash-image-preview para generación de imágenes

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

class GeminiService {
  private apiKey: string | null = null
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent'

  constructor() {
    // En Vite, las variables de entorno empiezan con VITE_
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || null
  }

  async generateClotheSwap(request: GeminiRequest): Promise<GeminiResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'API key de Gemini no configurada. Configura VITE_GEMINI_API_KEY en tu archivo .env'
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
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: request.personImage.type,
                data: personImageBase64
              }
            }
          ]
        }]
      }

      // Si hay imagen de ropa, agregarla al payload
      if (clothingImageBase64) {
        payload.contents[0].parts.push({
          inline_data: {
            mime_type: request.clothingImage!.type,
            data: clothingImageBase64
          }
        })
      }

      // Llamada a la API de Gemini para generar imagen
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Error de Gemini: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      
      // Buscar la imagen generada en la respuesta
      const generatedImagePart = data.candidates?.[0]?.content?.parts?.find(
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
        const generatedText = data.candidates?.[0]?.content?.parts?.find(
          (part: any) => part.text
        )?.text
        
        if (generatedText) {
          console.log('Respuesta de texto de Gemini:', generatedText)
        }
        
        throw new Error('No se pudo generar la imagen. Gemini devolvió solo texto.')
      }

    } catch (error) {
      console.error('Error en Gemini API:', error)
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
    let prompt = `Generate a realistic image showing how this person would look wearing new clothing. 
    
    Instructions:
    1. Keep the person's face, body type, and pose exactly the same
    2. Replace their current clothing with stylish, modern fashion
    3. Make the clothing fit naturally and look realistic
    4. Use complementary colors and styles that suit the person
    5. Maintain the same lighting and background
    6. Ensure the final image looks like a professional fashion photo
    
    Style: Modern, fashionable, realistic, high-quality photography
    Output: A single, high-resolution image showing the person in new clothing`
    
    if (clothingUrl) {
      prompt += `\n\nNote: The user also provided a store link: ${clothingUrl}. Use this as inspiration for the clothing style.`
    }
    
    return prompt
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

export default new GeminiService()
export type { GeminiRequest, GeminiResponse }
