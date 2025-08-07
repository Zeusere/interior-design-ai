import { motion } from 'framer-motion'
import { 
  Brain, 
  Clock, 
  Palette, 
  Shield, 
  Users, 
  TrendingUp,
  Camera,
  Download,
  Layers
} from 'lucide-react'

function Features() {
  const features = [
    {
      icon: Brain,
      title: "IA Avanzada",
      description: "Algoritmos de última generación que entienden el espacio, la luz y el estilo para crear diseños únicos.",
      color: "purple"
    },
    {
      icon: Clock,
      title: "Resultados Instantáneos",
      description: "Obtén múltiples propuestas de diseño en menos de 30 segundos. Sin esperas, sin demoras.",
      color: "blue"
    },
    {
      icon: Palette,
      title: "Estilos Personalizados",
      description: "Desde moderno minimalista hasta clásico elegante. Encuentra el estilo perfecto para ti.",
      color: "green"
    },
    {
      icon: Camera,
      title: "Solo una Foto",
      description: "Sube una simple foto desde tu teléfono y deja que la IA haga el resto del trabajo.",
      color: "orange"
    },
    {
      icon: Layers,
      title: "Múltiples Variaciones",
      description: "Explora diferentes opciones para el mismo espacio con distintos enfoques y paletas.",
      color: "pink"
    },
    {
      icon: Download,
      title: "Descarga en HD",
      description: "Exporta tus diseños favoritos en alta resolución para compartir o imprimir.",
      color: "indigo"
    },
    {
      icon: Shield,
      title: "Privacidad Total",
      description: "Tus imágenes y diseños están completamente seguros. No compartimos ni almacenamos sin permiso.",
      color: "emerald"
    },
    {
      icon: TrendingUp,
      title: "Mejora Continua",
      description: "Nuestra IA aprende constantemente para ofrecerte mejores resultados cada día.",
      color: "violet"
    },
    {
      icon: Users,
      title: "Comunidad Activa",
      description: "Únete a miles de usuarios que ya están transformando sus hogares con nuestra plataforma.",
      color: "cyan"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string, text: string, icon: string } } = {
      purple: { bg: "bg-purple-100", text: "text-purple-600", icon: "text-purple-600" },
      blue: { bg: "bg-blue-100", text: "text-blue-600", icon: "text-blue-600" },
      green: { bg: "bg-green-100", text: "text-green-600", icon: "text-green-600" },
      orange: { bg: "bg-orange-100", text: "text-orange-600", icon: "text-orange-600" },
      pink: { bg: "bg-pink-100", text: "text-pink-600", icon: "text-pink-600" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-600", icon: "text-indigo-600" },
      emerald: { bg: "bg-emerald-100", text: "text-emerald-600", icon: "text-emerald-600" },
      violet: { bg: "bg-violet-100", text: "text-violet-600", icon: "text-violet-600" },
      cyan: { bg: "bg-cyan-100", text: "text-cyan-600", icon: "text-cyan-600" }
    }
    return colors[color] || colors.purple
  }

  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            ¿Por qué elegir
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> nuestra IA?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Combinamos tecnología de vanguardia con diseño intuitivo para ofrecerte 
            la mejor experiencia de rediseño de interiores.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const colorClasses = getColorClasses(feature.color)
            const Icon = feature.icon
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 ${colorClasses.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${colorClasses.icon}`} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 lg:p-16 text-white"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">
              Números que hablan por sí solos
            </h3>
            <p className="text-xl text-purple-100">
              Miles de usuarios confían en nuestra tecnología
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">12K+</div>
              <div className="text-purple-200">Espacios rediseñados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">98%</div>
              <div className="text-purple-200">Satisfacción del cliente</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">24/7</div>
              <div className="text-purple-200">Disponibilidad</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">15s</div>
              <div className="text-purple-200">Tiempo promedio</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
