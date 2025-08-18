import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error in auth callback:', error)
          navigate('/?error=auth_failed')
          return
        }

        if (data.session) {
          // Usuario autenticado exitosamente
          navigate('/dashboard')
        } else {
          // No hay sesión
          navigate('/')
        }
      } catch (error) {
        console.error('Error handling auth callback:', error)
        navigate('/?error=auth_failed')
      }
    }

    handleAuthCallback()
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
