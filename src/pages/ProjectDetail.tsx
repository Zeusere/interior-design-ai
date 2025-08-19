import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Trash2, 
  Edit3,
  Calendar,
  Home,
  Palette,
  ImageIcon,
  ZoomIn,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'

interface Project {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  images: ProjectImage[]
}

interface ProjectImage {
  id: string
  original_url: string
  processed_url: string
  image_type: 'original' | 'processed' | 'enhanced'
  room_type: string
  style_applied: string
  created_at: string
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null)

  useEffect(() => {
    if (id && user) {
      loadProject()
    }
  }, [id, user])

  const loadProject = async () => {
    if (!id || !user) return

    try {
      setLoading(true)
      setError(null)

      // Obtener proyecto
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (projectError) {
        throw projectError
      }

      if (!projectData) {
        throw new Error('Proyecto no encontrado')
      }

      // Obtener imágenes del proyecto
      const { data: imagesData, error: imagesError } = await supabase
        .from('project_images')
        .select(`
          image_id,
          image_type,
          display_order,
          images (
            id,
            original_url,
            processed_url,
            room_type,
            style_applied,
            created_at
          )
        `)
        .eq('project_id', id)
        .order('display_order', { ascending: true })

      if (imagesError) {
        throw imagesError
      }

      const images = (imagesData || []).map((item: any) => ({
        id: item.images?.id,
        original_url: item.images?.original_url,
        processed_url: item.images?.processed_url,
        image_type: item.image_type as 'original' | 'processed' | 'enhanced',
        room_type: item.images?.room_type,
        style_applied: item.images?.style_applied,
        created_at: item.images?.created_at
      })).filter(img => img.id)

      setProject({
        ...projectData,
        images
      })
    } catch (err) {
      console.error('Error cargando proyecto:', err)
      setError(err instanceof Error ? err.message : 'Error cargando proyecto')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getStyleLabel = (style: string) => {
    const labels: Record<string, string> = {
      modern: 'Moderno',
      classic: 'Clásico',
      industrial: 'Industrial',
      bohemian: 'Bohemio',
      scandinavian: 'Escandinavo',
      luxury: 'Lujo'
    }
    return labels[style] || style
  }

  const getRoomTypeLabel = (roomType: string) => {
    const labels: Record<string, string> = {
      'living-room': 'Salón',
      'bedroom': 'Dormitorio',
      'kitchen': 'Cocina',
      'bathroom': 'Baño',
      'office': 'Oficina',
      'dining-room': 'Comedor'
    }
    return labels[roomType] || roomType
  }

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Proyecto no encontrado</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  const originalImages = project.images.filter(img => img.image_type === 'original')
  const processedImages = project.images.filter(img => img.image_type === 'processed')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <SEO 
        title={`${project.name} | Interior AI - Proyecto de Diseño`}
        description={`Ve todos los diseños del proyecto ${project.name}. Descarga, comparte y gestiona tus creaciones de diseño de interiores con IA.`}
        keywords="proyecto, diseño de interiores, IA, gestión, portfolio, descargas"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/dashboard"
              className="p-2 hover:bg-white/80 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {project.name}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Creado el {formatDate(project.created_at)}
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  {project.images.filter(img => img.image_type === 'processed').length} diseños
                </div>
              </div>
            </div>
            
            {/* Acciones */}
            <div className="flex gap-2">
              <button className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                <Edit3 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-red-600">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Secciones de imágenes */}
        <div className="space-y-12">
          {/* Imágenes originales */}
          {originalImages.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Imágenes Originales ({originalImages.length})
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {originalImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={image.original_url}
                        alt={`Original - ${getRoomTypeLabel(image.room_type)}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Overlay con acciones */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button
                          onClick={() => setSelectedImage(image)}
                          className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <ZoomIn className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={() => downloadImage(image.original_url, `original-${image.id}.jpg`)}
                          className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <Download className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <p className="font-medium text-gray-800 mb-2">
                        {getRoomTypeLabel(image.room_type)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(image.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Diseños generados */}
          {processedImages.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Palette className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Diseños Generados ({processedImages.length})
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={image.processed_url}
                        alt={`${getStyleLabel(image.style_applied)} - ${getRoomTypeLabel(image.room_type)}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Overlay con acciones */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button
                          onClick={() => setSelectedImage(image)}
                          className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <ZoomIn className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={() => downloadImage(image.processed_url, `design-${image.id}.jpg`)}
                          className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <Download className="w-5 h-5 text-gray-700" />
                        </button>
                        <button className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors">
                          <Share2 className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-800">
                          {getRoomTypeLabel(image.room_type)}
                        </p>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                          {getStyleLabel(image.style_applied)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(image.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {/* Modal de imagen ampliada */}
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <img
                src={selectedImage.image_type === 'original' ? selectedImage.original_url : selectedImage.processed_url}
                alt={`${getStyleLabel(selectedImage.style_applied)} - ${getRoomTypeLabel(selectedImage.room_type)}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      {getRoomTypeLabel(selectedImage.room_type)} - {getStyleLabel(selectedImage.style_applied)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedImage.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadImage(
                        selectedImage.image_type === 'original' ? selectedImage.original_url : selectedImage.processed_url,
                        `${selectedImage.image_type}-${selectedImage.id}.jpg`
                      )}
                      className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
