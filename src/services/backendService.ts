import type { DesignOptions } from '../types'

const BACKEND_URL = 'http://localhost:3001'

export interface BackendResponse {
  success: boolean
  imageUrl?: string
  prompt?: string
  processingTime?: number
  error?: string
  details?: string
}

// Función para convertir data URL a File
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new File([u8arr], filename, { type: mime })
}

export class BackendService {
  static async generateDesign(imageData: string, options: DesignOptions): Promise<string> {
    try {
      console.log('🎨 Iniciando generación con backend...')
      console.log('📋 Backend URL:', BACKEND_URL)
      console.log('📋 Options:', options)
      console.log('📋 ImageData length:', imageData.length)
      console.log('📋 ImageData start:', imageData.substring(0, 50))
      
      // Crear FormData para enviar la imagen
      const formData = new FormData()
      
      // Convertir data URL a File
      const imageFile = dataURLtoFile(imageData, 'room.jpg')
      console.log('📋 ImageFile created:', imageFile.name, imageFile.size, 'bytes')
      formData.append('image', imageFile)
      formData.append('options', JSON.stringify(options))

      console.log('📤 Enviando solicitud al backend...')
      console.log('📤 URL completa:', `${BACKEND_URL}/api/generate-design`)
      
      // Hacer llamada al backend
      const response = await fetch(`${BACKEND_URL}/api/generate-design`, {
        method: 'POST',
        body: formData
      })

      console.log('📡 Respuesta recibida:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error del servidor:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }

      const result: BackendResponse = await response.json()
      console.log('📋 Resultado completo:', result)
      
      if (!result.success || !result.imageUrl) {
        throw new Error(result.error || 'No se pudo generar el diseño')
      }

      console.log('✅ Diseño generado exitosamente')
      console.log('⏱️ Tiempo de procesamiento:', result.processingTime, 'segundos')
      console.log('🖼️ ImageUrl tipo:', typeof result.imageUrl)
      console.log('🖼️ ImageUrl length:', result.imageUrl.length)
      console.log('🖼️ ImageUrl start:', result.imageUrl.substring(0, 100))
      
      return result.imageUrl

    } catch (error) {
      console.error('❌ Error en BackendService:', error)
      
      // Proporcionar errores más específicos
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('❌ No se puede conectar al servidor backend. Asegúrate de que esté ejecutándose en http://localhost:3001')
      }
      
      throw error
    }
  }

  static async checkHealth(): Promise<{ apis: { replicate: boolean, openai: boolean } }> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`)
      
      if (!response.ok) {
        throw new Error('Backend no disponible')
      }
      
      return await response.json()
    } catch (error) {
      console.error('❌ Error verificando health del backend:', error)
      throw new Error('No se puede conectar al servidor backend')
    }
  }
}

export default BackendService