import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Image as ImageIcon, Loader2, Wand2, Plus, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProcessingStatus from './ProcessingStatus'

export interface UploadedImageInfo {
  id: string
  url: string
  roomType: string
  file?: File
}

interface ImageUploadProps {
  onMultipleImagesUpload: (images: UploadedImageInfo[]) => void
  onSingleImageProcess?: (image: UploadedImageInfo) => void
  isProcessing: boolean
  onImageEnhance?: (imageUrl: string) => void
  processedImageIds?: Set<string>
  onImagesUploaded?: (images: UploadedImageInfo[]) => void
}

const ImageUpload = ({ 
  onMultipleImagesUpload,
  onSingleImageProcess,
  isProcessing,
  onImageEnhance,
  processedImageIds = new Set(),
  onImagesUploaded
}: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false)
  const [localImages, setLocalImages] = useState<UploadedImageInfo[]>([])

  const roomTypes = [
    { value: 'living-room', label: 'Sala de Estar' },
    { value: 'bedroom', label: 'Dormitorio' },
    { value: 'kitchen', label: 'Cocina' },
    { value: 'dining-room', label: 'Comedor' },
    { value: 'bathroom', label: 'Baño' },
    { value: 'office', label: 'Oficina' },
    { value: 'balcony', label: 'Balcón' },
    { value: 'terrace', label: 'Terraza' },
    { value: 'garden', label: 'Jardín' },
    { value: 'garage', label: 'Garaje' },
    { value: 'hall', label: 'Recibidor' },
    { value: 'laundry', label: 'Lavandería' },
    { value: 'studio', label: 'Estudio' },
    { value: 'playroom', label: 'Sala de Juegos' },
    { value: 'gym', label: 'Gimnasio' }
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Máximo 15 imágenes por proyecto
    const newImages: UploadedImageInfo[] = []
    const filesToProcess = acceptedFiles.slice(0, 15 - localImages.length)
    
    filesToProcess.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = () => {
        const newImage: UploadedImageInfo = {
          id: Date.now().toString() + index,
          url: reader.result as string,
          roomType: 'living-room', // default
          file
        }
        newImages.push(newImage)
        
        if (newImages.length === filesToProcess.length) {
          const updatedImages = [...localImages, ...newImages]
          setLocalImages(updatedImages)
          onImagesUploaded?.(updatedImages)
        }
      }
      reader.readAsDataURL(file)
    })
  }, [localImages])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 15,
    multiple: true,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  })

  const updateRoomType = (imageId: string, roomType: string) => {
    setLocalImages(prev => {
      const updatedImages = prev.map(img => img.id === imageId ? { ...img, roomType } : img)
      onImagesUploaded?.(updatedImages)
      return updatedImages
    })
  }

  const removeImage = (imageId: string) => {
    setLocalImages(prev => {
      const updatedImages = prev.filter(img => img.id !== imageId)
      onImagesUploaded?.(updatedImages)
      return updatedImages
    })
  }

  const handleProcessMultiple = () => {
    const unprocessedImages = localImages.filter(img => !processedImageIds.has(img.id))
    onMultipleImagesUpload(unprocessedImages)
  }

  const handleProcessSingle = (image: UploadedImageInfo) => {
    if (onSingleImageProcess) {
      onSingleImageProcess(image)
    }
  }

  const handleEnhanceImage = (imageUrl: string) => {
    if (onImageEnhance) {
      onImageEnhance(imageUrl)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-purple-600" />
            Subir imágenes del proyecto
          </h2>
          
          <div className="text-sm text-gray-500">
            {localImages.length}/15 imágenes
          </div>
        </div>

        {/* Dropzone para imágenes */}
        {localImages.length < 15 && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            {...getRootProps() as any}
            className={`
              dropzone border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 mb-6
              ${isDragActive || dragActive 
                ? 'border-purple-500 bg-purple-50 shadow-lg' 
                : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-1">
                  {isDragActive ? 'Suelta las imágenes aquí' : localImages.length === 0 ? 'Arrastra tus imágenes aquí' : 'Agregar más imágenes'}
                </p>
                <p className="text-gray-500">
                  o <span className="text-purple-600 font-medium">haz clic para seleccionar</span>
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Formatos: JPG, PNG, WEBP • Máximo 15 imágenes por proyecto
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Lista de imágenes subidas */}
        <AnimatePresence>
          {localImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border border-gray-200 rounded-xl p-4 mb-4"
            >
              <div className="flex gap-4">
                <div className="relative">
                  <img 
                    src={image.url} 
                    alt={`Imagen ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">Imagen {index + 1}</h4>
                    <div className="flex items-center gap-2">
                      {processedImageIds.has(image.id) && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          ✓ Procesada
                        </span>
                      )}
                      {onImageEnhance && (
                        <button
                          onClick={() => handleEnhanceImage(image.url)}
                          className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Mejorar calidad"
                          disabled={isProcessing}
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeImage(image.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar imagen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Tipo de habitación
                    </label>
                    <select
                      value={image.roomType}
                      onChange={(e) => updateRoomType(image.id, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {roomTypes.map(room => (
                        <option key={room.value} value={room.value}>
                          {room.label}
                        </option>
                      ))}
                                          </select>
                    </div>
                    
                    {onSingleImageProcess && (
                      <button
                        onClick={() => handleProcessSingle(image)}
                        disabled={isProcessing || processedImageIds.has(image.id)}
                        className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Procesando...
                          </>
                        ) : processedImageIds.has(image.id) ? (
                          '✓ Ya procesada'
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            Generar Diseño
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Mensaje cuando se alcanza el límite */}
        {localImages.length >= 15 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center"
          >
            <p className="text-amber-800 font-medium">
              Has alcanzado el límite máximo de 15 imágenes por proyecto
            </p>
            <p className="text-sm text-amber-600 mt-1">
              Puedes eliminar algunas imágenes si quieres agregar diferentes
            </p>
          </motion.div>
        )}

        {/* Botones de acción */}
        {localImages.length > 0 && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setLocalImages([])}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Limpiar todo
            </button>
            
            {(() => {
              const unprocessedImages = localImages.filter(img => !processedImageIds.has(img.id))
              const allProcessed = unprocessedImages.length === 0
              
              return (
                <motion.button
                  whileHover={{ scale: allProcessed ? 1 : 1.05 }}
                  whileTap={{ scale: allProcessed ? 1 : 0.95 }}
                  onClick={handleProcessMultiple}
                  disabled={isProcessing || allProcessed}
                  className="flex-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando {unprocessedImages.length} imágenes...
                    </>
                  ) : allProcessed ? (
                    '✓ Todas procesadas'
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generar {unprocessedImages.length} Diseños Restantes
                    </>
                  )}
                </motion.button>
              )
            })()}
          </div>
        )}
      </div>

      <ProcessingStatus 
        isProcessing={isProcessing}
        currentStep="Generando diseños con IA especializada"
        estimatedTime={localImages.length * 15}
        provider="Replicate AI (Interior Design)"
      />
    </div>
  )
}

export default ImageUpload