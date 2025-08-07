import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon, Loader2, Wand2 } from 'lucide-react'
import { motion } from 'framer-motion'
import ProcessingStatus from './ProcessingStatus'

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  uploadedImage: string | null
  isProcessing: boolean
  onProcessImage: () => void
}

const ImageUpload = ({ onImageUpload, uploadedImage, isProcessing, onProcessImage }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        onImageUpload(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-purple-600" />
          Sube tu imagen
        </h2>

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
            <div className="relative rounded-xl overflow-hidden shadow-lg">
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
      </div>

      <ProcessingStatus 
        isProcessing={isProcessing}
        currentStep="Generando diseño con IA especializada"
        estimatedTime={15}
        provider="Replicate AI (Interior Design)"
      />
    </div>
  )
}

export default ImageUpload