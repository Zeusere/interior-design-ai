import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔍 AuthCallback: Procesando...')
        console.log('🔍 URL completa:', window.location.href)
        console.log('🔍 Hash fragment:', window.location.hash)
        
        // Intentar procesar los tokens del hash primero
        const fullHash = window.location.hash
        // Buscar la parte que contiene los tokens (después del segundo #)
        const tokenPart = fullHash.includes('#access_token') ? 
          fullHash.split('#access_token')[1] : 
          (fullHash.includes('&access_token') ? fullHash.split('&access_token')[1] : '')
        
        const hashParams = new URLSearchParams('access_token' + tokenPart)
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        console.log('🔍 Tokens encontrados:', { accessToken: !!accessToken, refreshToken: !!refreshToken })
        
        if (accessToken && refreshToken) {
          console.log('🔄 Estableciendo sesión con tokens...')
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
            console.log('✅ Login exitoso:', authData.session.user.email)
            navigate('/dashboard')
            return
          }
        }
        
        // Fallback: verificar sesión existente
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

    // Dar tiempo para que la página cargue completamente
    setTimeout(handleAuthCallback, 500)
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
