import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header.tsx'
import LandingPage from './pages/LandingPage.tsx'
import DesignApp from './pages/DesignApp.tsx'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
        <Header />
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<DesignApp />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App