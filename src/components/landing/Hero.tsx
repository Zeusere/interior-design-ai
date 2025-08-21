import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Play } from 'lucide-react'

function Hero() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000" />

      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center mb-6"
          >
            <div className="flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Advanced AI
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Transforma tu hogar con
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
              Inteligencia Artificial
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Sube una foto de tu espacio y obtén diseños profesionales en segundos. 
            Sin arquitectos costosos, sin largas esperas. Solo resultados increibles.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link
              to="/app"
              className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center"
            >
              Empieza Gratis Ahora
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button className="group flex items-center text-gray-700 font-semibold text-lg hover:text-purple-600 transition-colors">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg mr-3 group-hover:shadow-xl transition-shadow">
                <Play className="w-5 h-5 text-purple-600 ml-1" />
              </div>
              Ver Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">10K+</div>
              <div className="text-gray-600">Espacios transformados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">30s</div>
              <div className="text-gray-600">Tiempo promedio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">4.9★</div>
              <div className="text-gray-600">Valoración media</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
