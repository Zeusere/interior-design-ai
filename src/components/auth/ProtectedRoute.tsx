import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSubscription } from '../../contexts/SubscriptionContext'
import AuthModal from './AuthModal'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireSubscription?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback,
  requireSubscription = false 
}) => {
  const { user, loading } = useAuth()
  const { subscriptionStatus, isLoading: subscriptionLoading } = useSubscription()

  // Mostrar loading mientras se verifica la autenticación
  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Si no hay usuario, mostrar modal de login directamente
  if (!user) {
    if (fallback) {
      return <>{fallback}</>
    }

    // Mostrar directamente el modal de login sin pantalla intermedia
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
        {/* Modal de login siempre abierto */}
        <AuthModal 
          isOpen={true}
          onClose={() => {
            // Redirigir a la página principal si cierra el modal
            window.location.href = '/'
          }}
          defaultMode="signin"
        />
      </div>
    )
  }

  // Si se requiere suscripción y el usuario no la tiene
  if (requireSubscription && subscriptionStatus && !subscriptionStatus.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Suscripción Requerida</h2>
            <p className="text-gray-600 mb-4">
              {subscriptionStatus.plan === 'free' 
                ? `Te quedan ${subscriptionStatus.maxUsage - subscriptionStatus.usageCount} generaciones gratuitas`
                : 'Necesitas una suscripción activa para acceder a esta funcionalidad'
              }
            </p>
          </div>
          
          <button
            onClick={() => {/* TODO: Navigate to pricing */}}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Ver Planes
          </button>
        </div>
      </div>
    )
  }

  // Usuario autenticado y con permisos - mostrar contenido
  return <>{children}</>
}

export default ProtectedRoute
