import { useState } from 'react'
import ImageUpload from '../components/ImageUpload.tsx'
import EditingOptions from '../components/EditingOptions.tsx'
import ResultsGallery from '../components/ResultsGallery.tsx'
import SEO from '../components/SEO'
import { motion } from 'framer-motion'
import { aiService } from '../services/aiService.ts'

export interface DesignOptions {
  style: string
  architecture: string
  lighting: string
  colorScheme: string
  roomType: string
}

export interface ProcessedImage {
  id: string
  originalUrl: string
  processedUrl: string
  options: DesignOptions
  timestamp: Date
}

function DesignApp() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [designOptions, setDesignOptions] = useState<DesignOptions>({
    style: 'modern',
    architecture: 'contemporary',
    lighting: 'natural',
    colorScheme: 'neutral',
    roomType: 'living-room'
  })
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl)
  }

  const handleProcessImage = async () => {
    if (!uploadedImage) return

    setIsProcessing(true)
    
    try {
      // Generar diseño con IA
      const processedImageUrl = await aiService.generateDesign(uploadedImage, designOptions)
      
      const newProcessedImage: ProcessedImage = {
        id: Date.now().toString(),
        originalUrl: uploadedImage,
        processedUrl: processedImageUrl,
        options: { ...designOptions },
        timestamp: new Date()
      }
      
      setProcessedImages(prev => [newProcessedImage, ...prev])
    } catch (error) {
      console.error('Error al procesar la imagen:', error)
      // En caso de error, mostrar mensaje al usuario
      // Por ahora, usamos la imagen original como fallback
      const newProcessedImage: ProcessedImage = {
        id: Date.now().toString(),
        originalUrl: uploadedImage,
        processedUrl: uploadedImage,
        options: { ...designOptions },
        timestamp: new Date()
      }
      
      setProcessedImages(prev => [newProcessedImage, ...prev])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <SEO 
        title="Interior AI - Crear Diseños | Aplicación de IA"
        description="Crea diseños profesionales de interiores con nuestra IA. Sube tu foto, personaliza opciones y obtén resultados instantáneos. Herramienta gratuita de diseño."
        keywords="crear diseño interiores, aplicación IA, herramienta diseño, editor interiores, generador espacios"
        canonical="https://interior-ai.com/app"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Diseño de Interiores con
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> IA</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Transforma tus espacios con diseños profesionales generados por inteligencia artificial. 
          Sube una foto de tu habitación y obtén múltiples propuestas de diseño en segundos.
        </p>
      </motion.div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
        {/* Panel de opciones - TERCERO/ÚLTIMO en móvil, izquierda en desktop */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-1 order-3 lg:order-1"
        >
          <EditingOptions 
            options={designOptions}
            onChange={setDesignOptions}
            disabled={!uploadedImage || isProcessing}
          />
        </motion.div>

        {/* Área principal - PRIMERO upload, SEGUNDO resultados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-3 order-1 lg:order-2"
        >
          <div className="space-y-8">
            {/* Upload de imagen - PRIMERO en móvil */}
            <ImageUpload 
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              isProcessing={isProcessing}
              onProcessImage={handleProcessImage}
            />

            {/* Resultados - SEGUNDO en móvil, justo debajo del upload en desktop */}
            {processedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="order-2"
              >
                <ResultsGallery images={processedImages} />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  )
}

export default DesignApp
