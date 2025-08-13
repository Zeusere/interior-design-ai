import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon, Loader2, Wand2, Plus, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProcessingStatus from './ProcessingStatus'

export interface UploadedImageInfo {
  id: string
  url: string
  roomType: string
  file?: File
}

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  uploadedImage: string | null
  isProcessing: boolean
  onProcessImage: () => void
  onMultipleImagesUpload?: (images: UploadedImageInfo[]) => void
  onImageEnhance?: (imageUrl: string) => void
  uploadedImages?: UploadedImageInfo[]
}

const ImageUpload = ({ 
  onImageUpload, 
  uploadedImage, 
  isProcessing, 
  onProcessImage,
  onMultipleImagesUpload,
  onImageEnhance
}: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false)
  const [multiMode, setMultiMode] = useState(false)
  const [localImages, setLocalImages] = useState<UploadedImageInfo[]>([])

  const roomTypes = [
    { value: 'living-room', label: 'Sala de Estar' },
    { value: 'bedroom', label: 'Dormitorio' },
    { value: 'kitchen', label: 'Cocina' },
    { value: 'dining-room', label: 'Comedor' },
    { value: 'bathroom', label: 'Baño' },
    { value: 'office', label: 'Oficina' }
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (multiMode) {
      // Modo múltiple: máximo 7 imágenes
      const newImages: UploadedImageInfo[] = []
      const filesToProcess = acceptedFiles.slice(0, 7 - localImages.length)
      
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
            setLocalImages(prev => [...prev, ...newImages])
          }
        }
        reader.readAsDataURL(file)
      })
    } else {
      // Modo single
      const file = acceptedFiles[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          onImageUpload(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }, [onImageUpload, multiMode, localImages])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: multiMode ? 7 : 1,
    multiple: multiMode,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  })

  const updateRoomType = (imageId: string, roomType: string) => {
    setLocalImages(prev => 
      prev.map(img => img.id === imageId ? { ...img, roomType } : img)
    )
  }

  const removeImage = (imageId: string) => {
    setLocalImages(prev => prev.filter(img => img.id !== imageId))
  }

  const handleProcessMultiple = () => {
    if (onMultipleImagesUpload) {
      onMultipleImagesUpload(localImages)
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
        {/* Header con toggle de modo */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-purple-600" />
            {multiMode ? 'Subir múltiples imágenes' : 'Sube tu imagen'}
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMultiMode(false)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                !multiMode 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Una imagen
            </button>
            <button
              onClick={() => setMultiMode(true)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                multiMode 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Múltiples (máx. 7)
            </button>
          </div>
        </div>

        {/* Modo simple */}
        {!multiMode && (
          <>
            {!uploadedImage ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                {...getRootProps() as any}
                className={`
                  dropzone border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
                  ${isDragActive || dragActive 
                    ? 'border-purple-500 bg-purple-50 shadow-lg' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                  }
                `}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-700 mb-2">
                      {isDragActive ? 'Suelta la imagen aquí' : 'Arrastra tu imagen aquí'}
                    </p>
                    <p className="text-gray-500">
                      o <span className="text-purple-600 font-medium">haz clic para seleccionar</span>
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Formatos: JPG, PNG, WEBP (máx. 10MB)
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden">
                  <img 
                    src={uploadedImage} 
                    alt="Imagen subida" 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => onImageUpload('')}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cambiar imagen
                  </button>
                  
                  <button
                    onClick={() => handleEnhanceImage(uploadedImage)}
                    className="py-3 px-4 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2"
                    disabled={isProcessing}
                  >
                    <Sparkles className="w-4 h-4" />
                    Mejorar calidad
                  </button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onProcessImage}
                    disabled={isProcessing}
                    className="flex-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Generar Diseño
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modo múltiple */}
        {multiMode && (
          <div className="space-y-6">
            {/* Dropzone para múltiples imágenes */}
            {localImages.length < 7 && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                {...getRootProps() as any}
                className={`
                  dropzone border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300
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
                      {isDragActive ? 'Suelta las imágenes aquí' : 'Agrega más imágenes'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {localImages.length}/7 imágenes subidas
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
                  className="border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex gap-4">
                    <img 
                      src={image.url} 
                      alt={`Imagen ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-700">Imagen {index + 1}</h4>
                        <button
                          onClick={() => removeImage(image.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
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
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Botones de acción para modo múltiple */}
            {localImages.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={() => setLocalImages([])}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Limpiar todo
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleProcessMultiple}
                  disabled={isProcessing}
                  className="flex-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando {localImages.length} imágenes...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generar {localImages.length} Diseños
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>

      <ProcessingStatus 
        isProcessing={isProcessing}
        currentStep={multiMode ? "Generando múltiples diseños con IA especializada" : "Generando diseño con IA especializada"}
        estimatedTime={multiMode ? localImages.length * 15 : 15}
        provider="Replicate AI (Interior Design)"
      />
    </div>
  )
}

export default ImageUpload