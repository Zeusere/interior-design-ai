import { Download, Heart, Share2, Eye, Calendar, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ProcessedImage } from '../types'

interface ResultsGalleryProps {
  images: ProcessedImage[]
}

const ResultsGallery = ({ images }: ResultsGalleryProps) => {
  // Función temporal para convertir data URI a blob URL (como ayer)
  const convertDataUriToBlobUrl = (dataUri: string): string => {
    try {
      if (dataUri.startsWith('http')) {
        return dataUri;
      }
      
      if (dataUri.startsWith('data:')) {
        const [header, data] = dataUri.split(',');
        const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/png';
        const byteCharacters = atob(data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        return URL.createObjectURL(blob);
      }
      
      return dataUri;
    } catch (error) {
      console.error('Error convirtiendo data URI:', error);
      return dataUri;
    }
  };

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageUrl.startsWith('data:') ? imageUrl : convertDataUriToBlobUrl(imageUrl)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStyleLabel = (options: ProcessedImage['options']) => {
    const labels: Record<string, string> = {
      modern: 'Moderno',
      classic: 'Clásico',
      industrial: 'Industrial',
      bohemian: 'Bohemio',
      scandinavian: 'Escandinavo',
      luxury: 'Lujo'
    }
    return labels[options.style] || options.style
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Eye className="w-6 h-6 text-purple-600" />
        Resultados Generados ({images.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative bg-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {/* Imagen */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={convertDataUriToBlobUrl(image.processedUrl)}
                alt={`Diseño ${getStyleLabel(image.options)}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  console.error('Error cargando imagen:', image.processedUrl);
                  console.error('Imagen completa:', image);
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', 
                    '<div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">Error al cargar imagen</div>'
                  );
                }}
                onLoad={() => {
                  console.log('✅ Imagen cargada correctamente');
                  console.log('🔍 URL original:', image.processedUrl.substring(0, 50) + '...');
                }}
              />
              
              {/* Overlay con información */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-semibold text-lg mb-1">
                    Estilo {getStyleLabel(image.options)}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {image.options.architecture} • {image.options.lighting}
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Share2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Información detallada */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {formatDate(image.timestamp)}
                </div>
                <div className="flex gap-1">
                  {Object.entries(image.options).slice(0, 3).map(([key, value]) => (
                    <span
                      key={key}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
                    >
                      {String(value)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownload(image.processedUrl, `diseno-${image.id}.jpg`)}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Descargar</span>
                </button>

                <button className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">Ver más</span>
                </button>
              </div>
            </div>

            {/* Badges de calidad */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                IA Premium
              </span>
              {image.isEnhanced && (
                <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Mejorada
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mensaje si no hay resultados */}
      {images.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Eye className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No hay resultados aún
          </h3>
          <p className="text-gray-500">
            Sube una imagen y genera tu primer diseño para ver los resultados aquí.
          </p>
        </div>
      )}

      {/* Estadísticas */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{images.length}</div>
              <div className="text-sm text-purple-700">Diseños creados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">HD</div>
              <div className="text-sm text-blue-700">Calidad</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-green-700">Descarga libre</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ResultsGallery