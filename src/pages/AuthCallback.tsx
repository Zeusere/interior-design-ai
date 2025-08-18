import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔍 AuthCallback: Procesando...')
        
        // Dejar que Supabase maneje el callback automáticamente
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error:', error)
          navigate('/?error=auth_failed')
          return
        }

        if (data.session) {
          console.log('✅ Login exitoso:', data.session.user.email)
          navigate('/dashboard')
        } else {
          console.log('⚠️ No hay sesión, redirigiendo...')
          navigate('/')
        }
      } catch (error) {
        console.error('💥 Error:', error)
        navigate('/?error=auth_failed')
      }
    }

    // Pequeño delay para que Supabase procese
    setTimeout(handleAuthCallback, 100)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completando autenticación...</p>
      </div>
    </div>
  )
}

export default AuthCallback
