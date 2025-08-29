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
        }],
        generationConfig: {
          responseMimeType: "image/png",
          responseGenerationType: "IMAGE"
        }
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
      console.log('=== DEBUG GEMINI REQUEST ===')
      console.log('URL:', this.baseUrl)
      console.log('API Key (primeros 10 chars):', this.apiKey?.substring(0, 10) + '...')
      console.log('Prompt:', prompt)
      console.log('Person Image Size:', request.personImage.size, 'bytes')
      console.log('Clothing Image Size:', request.clothingImage?.size || 'N/A', 'bytes')
      console.log('Person Image Type:', request.personImage.type)
      console.log('Clothing Image Type:', request.clothingImage?.type || 'N/A')
      console.log('Payload keys:', Object.keys(payload.contents[0].parts))
      console.log('============================')
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ClotheSwap-App/1.0',
        },
        body: JSON.stringify(payload)
      })
      
      console.log('=== DEBUG GEMINI RESPONSE ===')
      console.log('Status:', response.status)
      console.log('Status Text:', response.statusText)
      console.log('Headers:', Object.fromEntries(response.headers.entries()))
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
          }
        } catch (parseError) {
          console.error('No se pudo parsear el error:', parseError)
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      console.log('=== DEBUG GEMINI DATA ===')
      console.log('Response structure:', {
        hasCandidates: !!data.candidates,
        candidatesLength: data.candidates?.length || 0,
        firstCandidateParts: data.candidates?.[0]?.content?.parts?.length || 0
      })
      
      // Log detallado de cada parte de la respuesta
      if (data.candidates?.[0]?.content?.parts) {
        data.candidates[0].content.parts.forEach((part: any, index: number) => {
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
    let prompt = `Create a new image showing this person wearing different clothing. 
    
    IMPORTANT: You must generate and return an IMAGE, not text.
    
    Instructions:
    - Keep the person's face, body type, and pose exactly the same
    - Replace their current clothing with stylish, modern fashion
    - Maintain the same lighting, background, and composition
    - Make the clothing fit naturally and look realistic
    - Generate a photorealistic image as output
    
    Output format: Generate an image file (PNG/JPG) showing the person in new clothing.`
    
    if (clothingUrl) {
      prompt += `\n\nStyle inspiration: ${clothingUrl}`
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
