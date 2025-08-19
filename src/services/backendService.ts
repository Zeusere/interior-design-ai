import type { DesignOptions } from '../types'

// URL del backend - dinámica según el entorno
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
                   (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin)

// Función para construir URL del backend sin dobles barras
function getBackendUrl(path: string): string {
  const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

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
  static async generateDesign(imageData: string, options: DesignOptions, userId?: string): Promise<string> {
    try {
      console.log('🎨 Iniciando generación con backend...')
      console.log('📋 Backend URL:', BACKEND_URL)
      console.log('📋 Options:', options)
      console.log('📋 UserId:', userId)
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
      const apiUrl = getBackendUrl('/api/generate-design')
      console.log('📤 URL completa:', apiUrl)
      
      // Preparar headers
      const headers: Record<string, string> = {}
      if (userId) {
        headers['x-user-id'] = userId
      }
      
      // Hacer llamada al backend
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
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

  static async enhanceImage(imageData: string): Promise<string> {
    try {
      console.log('✨ Iniciando mejora de imagen con backend...')
      
      // Crear FormData para enviar la imagen
      const formData = new FormData()
      
      // Convertir data URL a File
      const imageFile = dataURLtoFile(imageData, 'image-to-enhance.jpg')
      formData.append('image', imageFile)

      const apiUrl = getBackendUrl('/api/enhance-image')
      
      // Hacer llamada al backend
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error del servidor:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }

      const result: BackendResponse = await response.json()
      
      if (!result.success || !result.imageUrl) {
        throw new Error(result.error || 'No se pudo mejorar la imagen')
      }

      console.log('✅ Imagen mejorada exitosamente')
      return result.imageUrl

    } catch (error) {
      console.error('❌ Error en mejora de imagen:', error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('❌ No se puede conectar al servidor backend para mejora de imagen')
      }
      
      throw error
    }
  }

  static async checkHealth(): Promise<{ apis: { replicate: boolean, openai: boolean } }> {
    try {
      const response = await fetch(getBackendUrl('/api/health'))
      
      if (!response.ok) {
        throw new Error('Backend no disponible')
      }
      
      return await response.json()
    } catch (error) {
      console.error('❌ Error verificando health del backend:', error)
      throw new Error('No se puede conectar al servidor backend')
    }
  }

  static async saveProject(data: {
    projectName: string
    originalImageUrl: string
    processedImageUrls: string[]
    designOptions: DesignOptions
  }, accessToken: string): Promise<any> {
    try {
      console.log('💾 Guardando proyecto:', data.projectName)
      
      const apiUrl = getBackendUrl('/api/save-project')
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Proyecto guardado:', result.project.name)
      
      return result
    } catch (error) {
      console.error('❌ Error guardando proyecto:', error)
      throw error
    }
  }
}

export default BackendService