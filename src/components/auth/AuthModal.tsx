import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, Chrome } from 'lucide-react'
import { signUp, signIn, signInWithGoogle, resetPassword } from '../../lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'signin' | 'signup'
}

type AuthMode = 'signin' | 'signup' | 'forgot'

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'signin' }) => {
  const [mode, setMode] = useState<AuthMode>(defaultMode)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        // Validar que las contraseñas coincidan
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Las contraseñas no coinciden')
        }

        if (formData.password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres')
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName)
        if (error) throw error

        setMessage('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.')
        
        // Cerrar modal después de un registro exitoso
        setTimeout(() => {
          onClose()
        }, 2000)

      } else if (mode === 'signin') {
        const { error } = await signIn(formData.email, formData.password)
        if (error) throw error

        // El contexto de auth manejará el estado del usuario
        onClose()

      } else if (mode === 'forgot') {
        const { error } = await resetPassword(formData.email)
        if (error) throw error

        setMessage('Te hemos enviado un enlace para restablecer tu contraseña')
      }
    } catch (err: any) {
      setError(err.message || 'Ha ocurrido un error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)

    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
      
      // El redirect se manejará automáticamente
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google')
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      confirmPassword: ''
    })
    setError(null)
    setMessage(null)
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-white hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold mb-2">
              {mode === 'signin' && 'Iniciar Sesión'}
              {mode === 'signup' && 'Crear Cuenta'}
              {mode === 'forgot' && 'Recuperar Contraseña'}
            </h2>
            <p className="text-purple-100">
              {mode === 'signin' && 'Bienvenido de vuelta'}
              {mode === 'signup' && 'Únete a nuestra plataforma'}
              {mode === 'forgot' && 'Te ayudamos a recuperar tu cuenta'}
            </p>
          </div>

          <div className="p-6">
            {/* Google Sign In */}
            {mode !== 'forgot' && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full mb-4 flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Chrome className="w-5 h-5" />
                <span>Continuar con Google</span>
              </button>
            )}

            {mode !== 'forgot' && (
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name - Solo en signup */}
              {mode === 'signup' && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Password - No mostrar en forgot */}
              {mode !== 'forgot' && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              )}

              {/* Confirm Password - Solo en signup */}
              {mode === 'signup' && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirmar contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Procesando...' : (
                  mode === 'signin' ? 'Iniciar Sesión' :
                  mode === 'signup' ? 'Crear Cuenta' :
                  'Enviar Enlace'
                )}
              </button>
            </form>

            {/* Mode Switcher */}
            <div className="mt-6 text-center text-sm text-gray-600">
              {mode === 'signin' && (
                <>
                  <p>
                    ¿No tienes cuenta?{' '}
                    <button
                      onClick={() => switchMode('signup')}
                      className="text-purple-600 hover:text-purple-700 font-semibold"
                    >
                      Regístrate
                    </button>
                  </p>
                  <button
                    onClick={() => switchMode('forgot')}
                    className="text-purple-600 hover:text-purple-700 mt-2 block mx-auto"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </>
              )}
              
              {mode === 'signup' && (
                <p>
                  ¿Ya tienes cuenta?{' '}
                  <button
                    onClick={() => switchMode('signin')}
                    className="text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    Inicia sesión
                  </button>
                </p>
              )}
              
              {mode === 'forgot' && (
                <p>
                  ¿Recordaste tu contraseña?{' '}
                  <button
                    onClick={() => switchMode('signin')}
                    className="text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    Inicia sesión
                  </button>
                </p>
              )}
            </div>

            {/* Trial Info para signup */}
            {mode === 'signup' && (
              <div className="mt-4 bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700 text-center">
                  🎉 <strong>Prueba gratuita de 7 días</strong><br/>
                  10 créditos incluidos para probar la plataforma
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AuthModal
