import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header.tsx'
import LandingPage from './pages/LandingPage.tsx'
import DesignApp from './pages/DesignApp.tsx'
import AuthCallback from './pages/AuthCallback'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
          <Header />
          
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route 
              path="/app" 
              element={
                <ProtectedRoute>
                  <DesignApp />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  {/* TODO: Create Dashboard component */}
                  <div className="min-h-screen flex items-center justify-center">
                    <h1 className="text-2xl">Dashboard - Coming Soon</h1>
                  </div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App