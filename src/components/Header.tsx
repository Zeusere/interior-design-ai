import { Palette, Sparkles, User, LogOut, Settings, CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './auth/AuthModal'

const Header = () => {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'
  const { user, profile, signOut, subscriptionInfo } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

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
                {user ? (
                  <Link 
                    to="/app" 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Ir a la App
                  </Link>
                ) : (
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Empezar Gratis
                  </button>
                )}
              </>
            ) : (
              <>
                <Link to="/" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Inicio
                </Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Dashboard
                </Link>
                <a href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Ayuda
                </a>
                
                {user ? (
                  <div className="relative">
                    {/* Credits Display */}
                    {subscriptionInfo.isActive && subscriptionInfo.creditsRemaining !== undefined && (
                      <div className="mr-4 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                        {subscriptionInfo.creditsRemaining} créditos
                      </div>
                    )}
                    
                    {/* User Menu */}
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition-colors"
                    >
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Avatar" 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                      <span className="text-sm font-medium">{profile?.full_name || 'Usuario'}</span>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                        <Link 
                          to="/dashboard" 
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link 
                          to="/settings" 
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Configuración
                        </Link>
                        <Link 
                          to="/billing" 
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <CreditCard className="w-4 h-4" />
                          Facturación
                        </Link>
                        <hr className="my-2" />
                        <button 
                          onClick={() => {
                            signOut()
                            setShowUserMenu(false)
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Iniciar Sesión
                  </button>
                )}
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
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </motion.header>
  )
}

export default Header