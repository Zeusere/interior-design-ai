import { Palette, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'

const Header = () => {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <Palette className="w-8 h-8 text-purple-600" />
              <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Interior AI
              </h1>
              <p className="text-sm text-gray-500">Diseño inteligente</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {isLandingPage ? (
              <>
                <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Características
                </a>
                <a href="#how-it-works" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Cómo Funciona
                </a>
                <a href="#examples" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Ejemplos
                </a>
                <Link 
                  to="/app" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Empezar Gratis
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Inicio
                </Link>
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Galería
                </a>
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Ayuda
                </a>
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Cuenta
                </button>
              </>
            )}
          </nav>

          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <div className="w-6 h-6 flex flex-col justify-center">
              <div className="w-full h-0.5 bg-gray-600 mb-1"></div>
              <div className="w-full h-0.5 bg-gray-600 mb-1"></div>
              <div className="w-full h-0.5 bg-gray-600"></div>
            </div>
          </button>
        </div>
      </div>
    </motion.header>
  )
}

export default Header