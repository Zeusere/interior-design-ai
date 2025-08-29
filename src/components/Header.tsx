import { Palette, Sparkles, User, LogOut, Settings, CreditCard, Menu, X, LayoutDashboard, HelpCircle, Zap, Crown, Star, ChevronDown, Shirt } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription, useIsProUser, useUsageInfo } from '../contexts/SubscriptionContext'
import AuthModal from './auth/AuthModal'

const Header = () => {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'
  const { user, profile, signOut } = useAuth()
  const { setUpgradeToProModal } = useSubscription()
  const isProUser = useIsProUser()
  const { current, max, percentage } = useUsageInfo()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showAppsDropdown, setShowAppsDropdown] = useState(false)

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setShowMobileMenu(false)
    setShowUserMenu(false)
    setShowAppsDropdown(false)
  }, [location.pathname])

  // Cerrar menú móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setShowMobileMenu(false)
      }
      if (!target.closest('.user-menu') && !target.closest('.user-menu-button')) {
        setShowUserMenu(false)
      }
      if (!target.closest('.apps-dropdown') && !target.closest('.apps-dropdown-button')) {
        setShowAppsDropdown(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <>
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
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

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
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
                  {/* Apps Dropdown */}
                  <div className="relative apps-dropdown">
                    <button 
                      onClick={() => setShowAppsDropdown(!showAppsDropdown)}
                      className={`apps-dropdown-button flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                        location.pathname === '/app' || location.pathname === '/clotheswap'
                          ? 'bg-purple-100 text-purple-700' 
                          : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      Apps
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAppsDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Apps Dropdown Menu */}
                    <AnimatePresence>
                      {showAppsDropdown && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50"
                        >
                          <Link 
                            to="/app" 
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                            onClick={() => setShowAppsDropdown(false)}
                          >
                            <Palette className="w-4 h-4 text-purple-600" />
                            <div>
                              <div className="font-medium">Diseño de Interiores</div>
                              <div className="text-sm text-gray-500">Transforma espacios con IA</div>
                            </div>
                          </Link>
                          
                          <Link 
                            to="/clotheswap" 
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors"
                            onClick={() => setShowAppsDropdown(false)}
                          >
                            <Shirt className="w-4 h-4 text-blue-600" />
                            <div>
                              <div className="font-medium">ClotheSwap</div>
                              <div className="text-sm text-gray-500">Prueba ropa virtualmente</div>
                            </div>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <Link 
                    to="/dashboard" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                      location.pathname === '/dashboard' || location.pathname.startsWith('/project')
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  
                  <Link 
                    to="/help" 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors font-medium"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Ayuda
                  </Link>
                  
                  {user && (
                    <div className="flex items-center gap-4">
                      {/* Progress Bar y Estado de Suscripción */}
                      {!isProUser && max > 0 && (
                        <div className="flex items-center gap-3">
                          {/* Progress Bar */}
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 font-medium">
                              {current}/{max}
                            </span>
                          </div>
                          
                          {/* Upgrade Button */}
                          <button
                            onClick={() => setUpgradeToProModal(true)}
                            className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                          >
                            <Crown className="w-4 h-4" />
                            <span className="hidden sm:inline">Hazte Pro</span>
                          </button>
                        </div>
                      )}
                      
                      {/* Pro Badge */}
                      {isProUser && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-3 py-2 rounded-full text-sm font-medium">
                          <Crown className="w-4 h-4" />
                          <span>Pro</span>
                        </div>
                      )}
                      
                      {/* Pricing Link */}
                      <Link 
                        to="/pricing" 
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors font-medium"
                      >
                        <Star className="w-4 h-4" />
                        Precios
                      </Link>
                      
                      {/* User Menu */}
                      <div className="relative user-menu">
                        <button 
                          onClick={() => setShowUserMenu(!showUserMenu)}
                          className="user-menu-button flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition-colors"
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
                          <span className="text-sm font-medium hidden sm:block">
                            {profile?.full_name || 'Usuario'}
                          </span>
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {showUserMenu && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50"
                            >
                              <Link 
                                to="/dashboard" 
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <LayoutDashboard className="w-4 h-4" />
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
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="mobile-menu-button lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <AnimatePresence mode="wait">
                {showMobileMenu ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-gray-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mobile-menu lg:hidden bg-white border-b border-gray-200 shadow-lg"
          >
            <div className="container mx-auto px-4 py-4">
              {isLandingPage ? (
                <div className="space-y-4">
                  <a 
                    href="#features" 
                    className="block text-gray-600 hover:text-purple-600 transition-colors py-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Características
                  </a>
                  <a 
                    href="#how-it-works" 
                    className="block text-gray-600 hover:text-purple-600 transition-colors py-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Cómo Funciona
                  </a>
                  <a 
                    href="#examples" 
                    className="block text-gray-600 hover:text-purple-600 transition-colors py-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Ejemplos
                  </a>
                  <div className="pt-4 border-t border-gray-200">
                    {user ? (
                      <Link 
                        to="/app" 
                        className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg text-center font-medium"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Ir a la App
                      </Link>
                    ) : (
                      <button 
                        onClick={() => {
                          setShowMobileMenu(false)
                          setShowAuthModal(true)
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg text-center font-medium"
                      >
                        Empezar Gratis
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Apps Section */}
                  <div className="space-y-2">
                    <div className="px-4 py-2">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">APPS</h4>
                    </div>
                    
                    <Link 
                      to="/app" 
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === '/app' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Palette className="w-5 h-5" />
                      <div>
                        <span className="font-medium">Diseño de Interiores</span>
                        <p className="text-sm text-gray-500">Transforma espacios con IA</p>
                      </div>
                    </Link>
                    
                    <Link 
                      to="/clotheswap" 
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === '/clotheswap' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Shirt className="w-5 h-5" />
                      <div>
                        <span className="font-medium">ClotheSwap</span>
                        <p className="text-sm text-gray-500">Prueba ropa virtualmente</p>
                      </div>
                    </Link>
                  </div>
                  
                  <Link 
                    to="/dashboard" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === '/dashboard' || location.pathname.startsWith('/project')
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  
                  <Link 
                    to="/help" 
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span className="font-medium">Ayuda</span>
                  </Link>

                  
                  <Link 
                    to="/pricing" 
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Star className="w-5 h-5" />
                    <span className="font-medium">Precios</span>
                  </Link>

                  {user && (
                    <>
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        {/* Progress y Upgrade para móvil */}
                        {!isProUser && max > 0 && (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Uso gratuito</span>
                              <span className="text-sm text-gray-600">{current}/{max}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <button
                              onClick={() => {
                                setUpgradeToProModal(true)
                                setShowMobileMenu(false)
                              }}
                              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium"
                            >
                              <Crown className="w-4 h-4" />
                              Hazte Pro
                            </button>
                          </div>
                        )}

                        {/* User Info */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg mb-3">
                          {profile?.avatar_url ? (
                            <img 
                              src={profile.avatar_url} 
                              alt="Avatar" 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {profile?.full_name || 'Usuario'}
                            </p>
                            {isProUser ? (
                              <p className="text-sm text-purple-600 flex items-center gap-1">
                                <Crown className="w-3 h-3" />
                                Usuario Pro
                              </p>
                            ) : (
                              <p className="text-sm text-gray-600">Usuario Gratuito</p>
                            )}
                          </div>
                        </div>

                        {/* User Menu Options */}
                        <div className="space-y-1">
                          <Link 
                            to="/settings" 
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowMobileMenu(false)}
                          >
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">Configuración</span>
                          </Link>
                          
                          <Link 
                            to="/billing" 
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowMobileMenu(false)}
                          >
                            <CreditCard className="w-5 h-5" />
                            <span className="font-medium">Facturación</span>
                          </Link>
                          
                          <button 
                            onClick={() => {
                              signOut()
                              setShowMobileMenu(false)
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                          >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Cerrar Sesión</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}

export default Header