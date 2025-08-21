import { useState } from 'react'
import ImageUpload, { type UploadedImageInfo } from '../components/ImageUpload.tsx'
import EditingOptions from '../components/EditingOptions.tsx'
import ResultsGallery from '../components/ResultsGallery.tsx'
import SaveProjectModal from '../components/SaveProjectModal.tsx'
import PricingModal from '../components/PricingModal.tsx'
import SEO from '../components/SEO'
import { motion } from 'framer-motion'
import { aiService } from '../services/aiService.ts'
import { BackendService } from '../services/backendService.ts'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { supabase } from '../lib/supabase'
import type { DesignOptions, ProcessedImage } from '../types'

function DesignApp() {
  const { user } = useAuth()
  const { 
    subscriptionStatus, 
    incrementUsage, 
    upgradeToProModal, 
    setUpgradeToProModal, 
    handleUpgrade 
  } = useSubscription()
  
  const [designOptions, setDesignOptions] = useState<DesignOptions>({
    style: 'modern',
    architecture: 'contemporary',
    lighting: 'natural',
    colorScheme: 'neutral',
    roomType: 'living-room'
  })
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<UploadedImageInfo[]>([])
  const [processedImageIds, setProcessedImageIds] = useState<Set<string>>(new Set())
  
  // Estado para guardar proyecto
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleMultipleImagesUpload = async (images: UploadedImageInfo[]) => {
    setIsProcessing(true)
    setErrorMessage(null)
    
    try {
      // Procesar cada imagen con su tipo de habitación específico
      for (const image of images) {
        // Verificar límite de uso antes de procesar cada imagen
        const canUse = await incrementUsage()
        if (!canUse) {
          setErrorMessage('Has alcanzado el límite de 5 generaciones gratuitas. Upgrade a Pro para continuar.')
          break
        }

        const imageDesignOptions = { ...designOptions, roomType: image.roomType }
        
        try {
          // Pasar el userId al servicio de IA
          const processedImageUrl = await aiService.generateDesign(image.url, imageDesignOptions, undefined, user?.id)
          
          const newProcessedImage: ProcessedImage = {
            id: Date.now().toString() + Math.random().toString(),
            originalUrl: image.url,
            processedUrl: processedImageUrl,
            options: imageDesignOptions,
            timestamp: new Date(),
            status: 'completed'
          }
          
          setProcessedImages(prev => [newProcessedImage, ...prev])
          setProcessedImageIds(prev => new Set([...prev, image.id]))
        } catch (error) {
          console.error('Error al procesar imagen múltiple:', error)
          const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
          
          const newProcessedImage: ProcessedImage = {
            id: Date.now().toString() + Math.random().toString(),
            originalUrl: image.url,
            processedUrl: image.url,
            options: imageDesignOptions,
            timestamp: new Date(),
            status: 'error',
            error: errorMsg
          }
          
          setProcessedImages(prev => [newProcessedImage, ...prev])
        }
      }
    } catch (error) {
      console.error('Error general al procesar múltiples imágenes:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSingleImageProcess = async (image: UploadedImageInfo) => {
    setIsProcessing(true)
    setErrorMessage(null)
    
    try {
      // Verificar límite de uso antes de procesar
      const canUse = await incrementUsage()
      if (!canUse) {
        setErrorMessage('Has alcanzado el límite de 5 generaciones gratuitas. Upgrade a Pro para continuar.')
        return
      }

      const imageDesignOptions = { ...designOptions, roomType: image.roomType }
      // Pasar el userId al servicio de IA
      const processedImageUrl = await aiService.generateDesign(image.url, imageDesignOptions, undefined, user?.id)
      
      const newProcessedImage: ProcessedImage = {
        id: Date.now().toString() + Math.random().toString(),
        originalUrl: image.url,
        processedUrl: processedImageUrl,
        options: imageDesignOptions,
        timestamp: new Date(),
        status: 'completed'
      }
      
      setProcessedImages(prev => [newProcessedImage, ...prev])
      setProcessedImageIds(prev => new Set([...prev, image.id]))
    } catch (error) {
      console.error('Error al procesar imagen individual:', error)
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      setErrorMessage(`Error al procesar la imagen: ${errorMsg}`)
      
      const newProcessedImage: ProcessedImage = {
        id: Date.now().toString() + Math.random().toString(),
        originalUrl: image.url,
        processedUrl: image.url,
        options: { ...designOptions, roomType: image.roomType },
        timestamp: new Date(),
        status: 'error',
        error: errorMsg
      }
      
      setProcessedImages(prev => [newProcessedImage, ...prev])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImageEnhance = async (imageUrl: string) => {
    setIsProcessing(true)
    setErrorMessage(null)
    
    try {
      // Llamar al servicio de mejora de calidad
      const enhancedImageUrl = await aiService.enhanceImage(imageUrl)
      
      const newProcessedImage: ProcessedImage = {
        id: Date.now().toString(),
        originalUrl: imageUrl,
        processedUrl: enhancedImageUrl,
        options: { ...designOptions, isEnhanced: true },
        timestamp: new Date(),
        status: 'completed',
        isEnhanced: true
      }
      
      setProcessedImages(prev => [newProcessedImage, ...prev])
    } catch (error) {
      console.error('Error al mejorar la imagen:', error)
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      setErrorMessage(`Error al mejorar la calidad: ${errorMsg}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveProject = () => {
    if (!user) {
      alert('Debes estar logueado para guardar proyectos')
      return
    }
    setShowSaveModal(true)
  }

  const handleConfirmSave = async (projectName: string) => {
    if (!user || uploadedImages.length === 0) return
    
    setIsSaving(true)
    try {
      // Obtener el token de acceso actual
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No se pudo obtener el token de acceso')
      }

      const processedUrls = processedImages.map(img => img.processedUrl)
      const originalUrls = uploadedImages.map(img => img.url)
      
      await BackendService.saveProject({
        projectName,
        originalImageUrl: originalUrls[0], // Por compatibilidad, usar la primera imagen
        processedImageUrls: processedUrls,
        designOptions
      }, session.access_token)
      
    } catch (error) {
      console.error('Error guardando proyecto:', error)
      alert('Error al guardar el proyecto. Inténtalo de nuevo.')
      throw error // Para que el modal maneje el error
    } finally {
      setIsSaving(false)
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
            disabled={isProcessing}
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
               onMultipleImagesUpload={handleMultipleImagesUpload}
               onSingleImageProcess={handleSingleImageProcess}
               isProcessing={isProcessing}
               onImageEnhance={handleImageEnhance}
               processedImageIds={processedImageIds}
               onImagesUploaded={setUploadedImages}
             />

            {/* Mensaje de error */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 text-red-800">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <h4 className="font-semibold">Error al procesar la imagen</h4>
                    <p className="text-sm text-red-600">{errorMessage}</p>
                    <p className="text-xs text-red-500 mt-1">
                      La aplicación está usando un modo de demostración. En producción, esto se conectaría a un servicio de IA real.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Resultados - SEGUNDO en móvil, justo debajo del upload en desktop */}
            {processedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="order-2"
              >
                <ResultsGallery 
                  images={processedImages} 
                  onSaveProject={handleSaveProject}
                  canSave={!!user && uploadedImages.length > 0}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal para guardar proyecto */}
      <SaveProjectModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleConfirmSave}
        isLoading={isSaving}
      />

      {/* Modal de upgrade a Pro */}
      <PricingModal
        isOpen={upgradeToProModal}
        onClose={() => setUpgradeToProModal(false)}
        onSelectPlan={handleUpgrade}
        currentUsage={subscriptionStatus?.usageCount || 0}
        maxFreeUsage={subscriptionStatus?.maxUsage || 5}
      />
    </main>
  )
}

export default DesignApp
