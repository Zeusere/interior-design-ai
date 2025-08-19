import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  HelpCircle, 
  Zap, 
  Palette, 
  Image, 
  FolderOpen, 
  Star, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Download,
  Eye,
  Save,
  Plus,
  Lightbulb,
  Settings,
  Camera
} from 'lucide-react'
import SEO from '../components/SEO'

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "¿Qué tipos de espacios puedo diseñar?",
    answer: "Puedes diseñar cualquier tipo de habitación: salones, dormitorios, cocinas, baños, oficinas, comedores y más. Nuestra IA está entrenada para trabajar con todo tipo de espacios interiores."
  },
  {
    question: "¿Cuánto tiempo tarda en generar un diseño?",
    answer: "Los diseños se generan en aproximadamente 30-60 segundos. El tiempo puede variar ligeramente según la complejidad de la imagen y la carga del servidor."
  },
  {
    question: "¿Puedo descargar las imágenes generadas?",
    answer: "Sí, todas las imágenes generadas se pueden descargar en alta calidad. También puedes guardarlas en proyectos para organizarlas mejor."
  },
  {
    question: "¿Qué resolución tienen las imágenes generadas?",
    answer: "Las imágenes se generan en alta definición, típicamente en resoluciones de 1024x1024 píxeles o superiores, perfectas para presentaciones profesionales."
  },
  {
    question: "¿Cuántos créditos consume cada diseño?",
    answer: "Cada generación de diseño consume 1 crédito. La mejora de calidad (upscaling) consume 1 crédito adicional. Los usuarios premium reciben créditos ilimitados."
  },
  {
    question: "¿Puedo editar un diseño después de generarlo?",
    answer: "Aunque no puedes editar directamente un diseño, puedes generar nuevas variaciones usando la misma imagen original con diferentes estilos y configuraciones."
  },
  {
    question: "¿Qué formatos de imagen acepta la aplicación?",
    answer: "Aceptamos los formatos más comunes: JPG, PNG, JPEG y WEBP. El tamaño máximo recomendado es de 10MB por imagen."
  },
  {
    question: "¿Los proyectos se guardan automáticamente?",
    answer: "No, debes hacer clic en 'Guardar Proyecto' para que tus diseños se guarden permanentemente. Sin guardar, las imágenes se eliminan automáticamente después de 30 días."
  },
  {
    question: "¿Puedo compartir mis proyectos?",
    answer: "Actualmente puedes descargar las imágenes para compartirlas. Próximamente añadiremos funciones de compartir directo y colaboración."
  },
  {
    question: "¿Hay límite en el número de proyectos?",
    answer: "No hay límite en el número de proyectos que puedes crear. Solo estás limitado por tus créditos disponibles para generar nuevos diseños."
  }
]

const styles = [
  { 
    name: 'Moderno', 
    description: 'Líneas limpias, colores neutros y espacios abiertos',
    features: ['Minimalismo', 'Colores neutros', 'Líneas rectas', 'Espacios abiertos']
  },
  { 
    name: 'Clásico', 
    description: 'Elegancia atemporal con muebles tradicionales',
    features: ['Maderas nobles', 'Colores cálidos', 'Detalles ornamentales', 'Muebles tradicionales']
  },
  { 
    name: 'Industrial', 
    description: 'Materiales en bruto como metal y hormigón',
    features: ['Metal expuesto', 'Ladrillos', 'Tuberías vistas', 'Colores oscuros']
  },
  { 
    name: 'Bohemio', 
    description: 'Colores vibrantes y texturas variadas',
    features: ['Patrones étnicos', 'Colores tierra', 'Textiles variados', 'Plantas abundantes']
  },
  { 
    name: 'Escandinavo', 
    description: 'Simplicidad, funcionalidad y tonos claros',
    features: ['Maderas claras', 'Blancos y grises', 'Funcionalidad', 'Hygge']
  },
  { 
    name: 'Lujo', 
    description: 'Materiales premium y acabados sofisticados',
    features: ['Materiales premium', 'Dorados y mármol', 'Detalles lujosos', 'Elegancia máxima']
  }
]

export default function Help() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <SEO 
        title="Ayuda y Guía | Interior AI - Cómo usar la aplicación"
        description="Aprende a usar Interior AI al máximo. Guía completa de estilos, opciones de diseño, gestión de proyectos y preguntas frecuentes."
        keywords="ayuda, guía, tutorial, estilos de diseño, FAQ, soporte, Interior AI"
      />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Centro de Ayuda
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Todo lo que necesitas saber para crear diseños de interiores increíbles con IA
          </p>
        </motion.div>

        {/* Sección: Cómo funciona la App */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">¿Cómo funciona Interior AI?</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Proceso paso a paso</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-medium text-gray-800">Sube tu imagen</h4>
                    <p className="text-gray-600 text-sm">Carga una foto de la habitación que quieres rediseñar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-medium text-gray-800">Elige tu estilo</h4>
                    <p className="text-gray-600 text-sm">Selecciona entre 6 estilos diferentes de diseño</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-medium text-gray-800">Configura opciones</h4>
                    <p className="text-gray-600 text-sm">Ajusta arquitectura, iluminación y colores</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-medium text-gray-800">¡Magia de IA!</h4>
                    <p className="text-gray-600 text-sm">Nuestra IA genera tu diseño en segundos</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Funciones principales</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Image className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Generación de diseños con IA</span>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                  <span className="text-gray-700">Mejora de calidad de imagen</span>
                </div>
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Descarga en alta calidad</span>
                </div>
                <div className="flex items-center gap-3">
                  <Save className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Guardado en proyectos</span>
                </div>
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700">Vista previa y zoom</span>
                </div>
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-700">Gestión de proyectos</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Sección: Estilos disponibles */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Palette className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Estilos de Diseño</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {styles.map((style, index) => (
              <motion.div
                key={style.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{style.name}</h3>
                <p className="text-gray-600 mb-4">{style.description}</p>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Características:</h4>
                  <ul className="space-y-1">
                    {style.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Sección: Ejemplo Antes/Después */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-green-100 rounded-lg">
              <Camera className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Ejemplos de Transformación</h2>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Antes */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  Antes
                </h3>
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src="/src/assets/images/before-room.png" 
                    alt="Habitación antes del diseño"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium">
                      Imagen Original
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mt-3 text-sm">
                  Habitación básica sin decorar, con muebles simples y colores neutros.
                </p>
              </div>

              {/* Después */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Después
                </h3>
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src="/src/assets/images/after-room.png" 
                    alt="Habitación después del diseño"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center pb-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ✨ Diseño IA - Estilo Moderno
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mt-3 text-sm">
                  Transformación completa con estilo moderno: nuevos colores, muebles elegantes y mejor distribución.
                </p>
              </div>
            </div>

            {/* Flecha de transformación */}
            <div className="flex justify-center mt-6">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Transformación con IA</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Sección: Cómo funcionan los Proyectos */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FolderOpen className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Gestión de Proyectos</h2>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">¿Qué son los Proyectos?</h3>
                <p className="text-gray-600 mb-6">
                  Los proyectos te permiten organizar y guardar permanentemente tus diseños. 
                  Cada proyecto puede representar una propiedad, un cliente, o simplemente 
                  una colección de diseños relacionados.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Plus className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Crear Proyecto</h4>
                      <p className="text-gray-600 text-sm">Haz clic en "Guardar Proyecto" después de generar diseños</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Save className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Guardado Permanente</h4>
                      <p className="text-gray-600 text-sm">Los proyectos guardados no se eliminan automáticamente</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-800">Gestión Completa</h4>
                      <p className="text-gray-600 text-sm">Edita nombres, añade más imágenes, o elimina proyectos</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Ventajas de usar Proyectos</h3>
                <div className="space-y-3">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-1">🏠 Organización por Propiedades</h4>
                    <p className="text-green-700 text-sm">Agrupa diseños por casa, apartamento, o local comercial</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-1">👥 Gestión de Clientes</h4>
                    <p className="text-blue-700 text-sm">Mantén separados los proyectos de diferentes clientes</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-1">📊 Historial Completo</h4>
                    <p className="text-purple-700 text-sm">Accede a todos tus diseños anteriores cuando quieras</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-1">⬇️ Descarga Fácil</h4>
                    <p className="text-orange-700 text-sm">Descarga todas las imágenes de un proyecto de una vez</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Sección: Mejora de Calidad */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Mejora de Calidad</h2>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Upscaling con IA</h3>
                <p className="text-gray-600 text-sm">
                  Mejora la resolución y nitidez de cualquier imagen usando algoritmos avanzados de IA
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Mayor Detalle</h3>
                <p className="text-gray-600 text-sm">
                  Recupera detalles perdidos y mejora la claridad general de la imagen
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Calidad Premium</h3>
                <p className="text-gray-600 text-sm">
                  Perfecta para presentaciones profesionales y impresiones de alta calidad
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Sección: FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Lightbulb className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-800 pr-4">{faq.question}</h3>
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                
                {openFAQ === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Final */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">¿Listo para crear diseños increíbles?</h2>
            <p className="text-lg mb-6">Comienza a transformar tus espacios con la magia de la IA</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/app"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Empezar Ahora
              </Link>
              <Link 
                to="/"
                className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
              >
                Ver Ejemplos
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
