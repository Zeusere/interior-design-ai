import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Home, 
  Calendar, 
  Eye, 
  Download, 
  Trash2, 
  Edit3,
  Sparkles,
  ImageIcon,
  FolderOpen,
  ArrowRight,
  Palette
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
  total_images: number
  cover_image_url?: string
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

export default function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadProjects()
    }
  }, [user])

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener proyectos del usuario
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          created_at,
          updated_at,
          total_images
        `)
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })

      if (projectsError) {
        throw projectsError
      }

      // Para cada proyecto, obtener sus imágenes
      const projectsWithImages = await Promise.all(
        (projectsData || []).map(async (project) => {
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
            .eq('project_id', project.id)
            .order('display_order', { ascending: true })

          if (imagesError) {
            console.error('Error cargando imágenes del proyecto:', imagesError)
            return { ...project, images: [] }
          }

          const images = (imagesData || []).map((item: any) => ({
            id: item.images?.id,
            original_url: item.images?.original_url,
            processed_url: item.images?.processed_url,
            image_type: item.image_type as 'original' | 'processed' | 'enhanced',
            room_type: item.images?.room_type,
            style_applied: item.images?.style_applied,
            created_at: item.images?.created_at
          })).filter(img => img.id) // Filtrar items sin imagen válida

          // Usar la primera imagen procesada como cover
          const coverImage = images.find(img => img.image_type === 'processed')
          
          return {
            ...project,
            images,
            cover_image_url: coverImage?.processed_url || images[0]?.original_url
          }
        })
      )

      setProjects(projectsWithImages)
    } catch (err) {
      console.error('Error cargando proyectos:', err)
      setError(err instanceof Error ? err.message : 'Error cargando proyectos')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
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

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando tus proyectos...</p>
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
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error al cargar</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadProjects}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Dashboard principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <SEO 
        title="Interior AI - Mi Dashboard | Proyectos de Diseño"
        description="Gestiona todos tus proyectos de diseño de interiores con IA. Ve, edita y descarga tus creaciones."
        keywords="dashboard, proyectos, diseño de interiores, IA, gestión, portfolio"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header del Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Mi Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Gestiona tus proyectos de diseño de interiores
              </p>
            </div>
            
            <Link to="/app">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                <Plus className="w-5 h-5" />
                Crear Nuevo Diseño
              </motion.button>
            </Link>
          </div>

          {/* Estadísticas rápidas */}
          {projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FolderOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{projects.length}</p>
                    <p className="text-gray-600">Proyectos</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <ImageIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {projects.reduce((total, project) => total + project.images.length, 0)}
                    </p>
                    <p className="text-gray-600">Diseños Creados</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Sparkles className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">IA Premium</p>
                    <p className="text-gray-600">Calidad</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Contenido principal */}
        {projects.length === 0 ? (
          // Estado vacío - Primera vez
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-3xl p-12 shadow-xl">
              {/* Ilustración/mockup de proyectos */}
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 opacity-30">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-xl p-4">
                      <div className="bg-gray-200 rounded-lg h-32 mb-3 flex items-center justify-center">
                        <Home className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Palette className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  ¡Bienvenido a tu espacio creativo!
                </h2>
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  Aquí aparecerán todos tus proyectos de diseño. <br />
                  <span className="font-semibold text-purple-600">
                    Te ayudaremos a ahorrar horas de trabajo con diseños excepcionales.
                  </span>
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Link to="/app">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-2xl hover:shadow-2xl transition-all duration-300"
                  >
                    <Plus className="w-6 h-6" />
                    Crear mi primer diseño
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </motion.div>

              <div className="mt-8 text-sm text-gray-500">
                <p>🎨 Diseños profesionales • 🚀 Resultados en segundos • ✨ Calidad HD</p>
              </div>
            </div>
          </motion.div>
        ) : (
          // Grid de proyectos
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Imagen de preview */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  {project.cover_image_url ? (
                    <img
                      src={project.cover_image_url}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors">
                      <Eye className="w-5 h-5 text-gray-700" />
                    </button>
                    <button className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors">
                      <Download className="w-5 h-5 text-gray-700" />
                    </button>
                    <button className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors">
                      <Edit3 className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  {/* Badge de cantidad de imágenes */}
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    {project.images.length} diseños
                  </div>
                </div>

                {/* Información del proyecto */}
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
                    {project.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4" />
                    {formatDate(project.created_at)}
                  </div>

                  {/* Tags de estilos */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[...new Set(project.images.map(img => img.style_applied))].slice(0, 2).map((style) => (
                      <span
                        key={style}
                        className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
                      >
                        {getStyleLabel(style)}
                      </span>
                    ))}
                    {[...new Set(project.images.map(img => img.room_type))].slice(0, 1).map((roomType) => (
                      <span
                        key={roomType}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                      >
                        {getRoomTypeLabel(roomType)}
                      </span>
                    ))}
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Link 
                      to={`/project/${project.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Proyecto
                    </Link>
                    <button className="p-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
