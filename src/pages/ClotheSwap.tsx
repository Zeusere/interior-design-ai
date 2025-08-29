import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, User, Shirt, Sparkles, Download, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import geminiService from '../services/geminiService'

interface UploadedImage {
  file: File
  preview: string
  type: 'person' | 'clothing'
}

const ClotheSwap = () => {
  const [personImage, setPersonImage] = useState<UploadedImage | null>(null)
  const [clothingImage, setClothingImage] = useState<UploadedImage | null>(null)
  const [clothingUrl, setClothingUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onDropPerson = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const preview = URL.createObjectURL(file)
      setPersonImage({ file, preview, type: 'person' })
      setError(null)
    }
  }, [])

  const onDropClothing = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const preview = URL.createObjectURL(file)
      setClothingImage({ file, preview, type: 'clothing' })
      setClothingUrl('')
      setError(null)
    }
  }, [])

  const { getRootProps: getPersonRootProps, getInputProps: getPersonInputProps, isDragActive: isPersonDragActive } = useDropzone({
    onDrop: onDropPerson,
    accept: { 'image/*': [] },
    maxFiles: 1
  })

  const { getRootProps: getClothingRootProps, getInputProps: getClothingInputProps, isDragActive: isClothingDragActive } = useDropzone({
    onDrop: onDropClothing,
    accept: { 'image/*': [] },
    maxFiles: 1
  })

  const handleGenerate = async () => {
    if (!personImage) {
      setError('Por favor, sube una foto tuya')
      return
    }

    if (!clothingImage && !clothingUrl) {
      setError('Por favor, sube una foto de ropa o proporciona un enlace')
      return
    }

    setIsGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      // Validar imágenes antes de enviar
      const isPersonImageValid = await geminiService.validateImage(personImage.file)
      if (!isPersonImageValid) {
        setError('La imagen personal no es válida. Asegúrate de que sea JPG, PNG o WEBP y menor a 10MB')
        return
      }

      if (clothingImage) {
        const isClothingImageValid = await geminiService.validateImage(clothingImage.file)
        if (!isClothingImageValid) {
          setError('La imagen de ropa no es válida. Asegúrate de que sea JPG, PNG o WEBP y menor a 10MB')
          return
        }
      }

      // Llamada real a la API de Gemini
      const result = await geminiService.generateClotheSwap({
        personImage: personImage.file,
        clothingImage: clothingImage?.file,
        clothingUrl: clothingUrl || undefined
      })

             if (result.success && result.imageUrl) {
         setGeneratedImage(result.imageUrl)
         setSuccess('¡Imagen generada exitosamente con Gemini!')
       } else {
         setError(result.error || 'Error al generar la imagen')
       }
    } catch (err) {
      console.error('Error en generación:', err)
      setError('Error al comunicarse con Gemini. Verifica tu conexión e inténtalo de nuevo.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = 'clotheswap-generated.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleReset = () => {
    setPersonImage(null)
    setClothingImage(null)
    setClothingUrl('')
    setGeneratedImage(null)
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shirt className="w-12 h-12 text-purple-600" />
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            ClotheSwap
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Prueba ropa virtualmente con Gemini AI. Sube tu foto y la ropa que quieras probar, 
            y nuestra inteligencia artificial generará una imagen realista de cómo te quedaría con la nueva ropa.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Panel Izquierdo - Subida de Imágenes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Foto de la Persona */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Tu Foto
              </h3>
              <div
                {...getPersonRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isPersonDragActive
                    ? 'border-purple-500 bg-purple-50'
                    : personImage
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                }`}
              >
                <input {...getPersonInputProps()} />
                {personImage ? (
                  <div className="space-y-3">
                    <img
                      src={personImage.preview}
                      alt="Foto de la persona"
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-green-600 font-medium">Foto subida correctamente</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setPersonImage(null)
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Cambiar foto
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-gray-600">
                      {isPersonDragActive
                        ? 'Suelta tu foto aquí'
                        : 'Arrastra tu foto aquí o haz clic para seleccionar'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Formatos: JPG, PNG, WEBP (máx. 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Foto de la Ropa */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shirt className="w-5 h-5 text-blue-600" />
                Ropa a Probar
              </h3>
              
              {/* Opción 1: Subir imagen */}
              <div className="mb-4">
                <div
                  {...getClothingRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isClothingDragActive
                      ? 'border-blue-500 bg-blue-50'
                      : clothingImage
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <input {...getClothingInputProps()} />
                  {clothingImage ? (
                    <div className="space-y-3">
                      <img
                        src={clothingImage.preview}
                        alt="Foto de la ropa"
                        className="w-24 h-24 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-green-600 font-medium">Ropa subida correctamente</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setClothingImage(null)
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Cambiar ropa
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-gray-600 text-sm">
                        {isClothingDragActive
                          ? 'Suelta la foto de ropa aquí'
                          : 'Arrastra la foto de ropa aquí o haz clic'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Opción 2: Enlace de tienda */}
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">O proporciona un enlace de la tienda</p>
                <input
                  type="url"
                  placeholder="https://tienda.com/producto"
                  value={clothingUrl}
                  onChange={(e) => {
                    setClothingUrl(e.target.value)
                    if (clothingImage) setClothingImage(null)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Botón de Generación */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (!personImage || (!clothingImage && !clothingUrl))}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                isGenerating || (!personImage || (!clothingImage && !clothingUrl))
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:scale-105'
              }`}
            >
                             {isGenerating ? (
                 <div className="flex items-center justify-center gap-2">
                   <RefreshCw className="w-5 h-5 animate-spin" />
                   Generando imagen con Gemini...
                 </div>
               ) : (
                 <div className="flex items-center gap-2">
                   <Sparkles className="w-5 h-5" />
                   Generar Imagen con Gemini
                 </div>
               )}
            </button>
          </motion.div>

          {/* Panel Derecho - Resultado */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Estado y Mensajes */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-700">{success}</p>
              </motion.div>
            )}

            {/* Imagen Generada */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Resultado</h3>
              
              {generatedImage ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={generatedImage}
                      alt="Imagen generada con IA"
                      className="w-full h-96 object-cover rounded-xl shadow-lg"
                    />
                                       <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                     Imagen Generada por Gemini
                   </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleDownload}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Nueva Generación
                    </button>
                  </div>
                </div>
              ) : (
                                 <div className="text-center py-16">
                   <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                   <p className="text-gray-500 text-lg">
                     {isGenerating 
                       ? 'Generando imagen con Gemini AI...'
                       : 'Sube tus fotos y obtén una imagen personalizada generada por Gemini'
                     }
                   </p>
                 </div>
              )}
            </div>

            {/* Información Adicional */}
                         <div className="bg-blue-50 rounded-2xl p-6">
               <h4 className="font-semibold text-blue-800 mb-3">¿Cómo funciona?</h4>
               <ul className="text-blue-700 text-sm space-y-2">
                 <li>• Sube una foto clara de tu rostro y cuerpo</li>
                 <li>• Proporciona una imagen de la ropa que quieres probar</li>
                 <li>• Gemini AI genera una imagen realista de cómo te quedaría</li>
                 <li>• Descarga y comparte tu nueva imagen personalizada</li>
               </ul>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ClotheSwap
