import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔍 AuthCallback: Iniciando procesamiento...')
        console.log('🔍 URL actual:', window.location.href)
        console.log('🔍 Hash:', window.location.hash)
        console.log('🔍 Search params:', window.location.search)
        
        // Procesar tokens del hash fragment si están presentes
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        console.log('🔍 Access token en hash:', accessToken ? 'Presente' : 'No encontrado')
        console.log('🔍 Refresh token en hash:', refreshToken ? 'Presente' : 'No encontrado')
        
        // Si hay tokens en el hash, procesarlos con Supabase
        if (accessToken && refreshToken) {
          console.log('🔄 Estableciendo sesión con tokens del hash...')
          const { data: authData, error: authError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (authError) {
            console.error('❌ Error estableciendo sesión:', authError)
            navigate('/?error=auth_failed')
            return
          }
          
          if (authData.session) {
            console.log('✅ Sesión establecida exitosamente:', authData.session.user.email)
            navigate('/dashboard')
            return
          }
        }
        
        // Fallback: verificar sesión existente
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log('🔍 Sesión actual:', sessionData)
        console.log('🔍 Error de sesión:', sessionError)
        
        if (sessionError) {
          console.error('❌ Error in auth callback:', sessionError)
          navigate('/?error=auth_failed')
          return
        }

        if (sessionData.session) {
          console.log('✅ Usuario autenticado exitosamente:', sessionData.session.user.email)
          navigate('/dashboard')
        } else {
          console.log('⚠️ No hay sesión activa, redirigiendo a home')
          navigate('/')
        }
      } catch (error) {
        console.error('💥 Error handling auth callback:', error)
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
