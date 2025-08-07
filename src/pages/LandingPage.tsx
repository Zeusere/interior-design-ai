import Hero from '../components/landing/Hero'
import BeforeAfter from '../components/landing/BeforeAfter'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import Footer from '../components/landing/Footer'
import SEO from '../components/SEO'

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Interior AI - Diseño de Interiores con Inteligencia Artificial"
        description="Transforma tu hogar con diseños profesionales generados por IA. Sube una foto y obtén múltiples propuestas de diseño de interiores en segundos. Gratis y fácil de usar."
        keywords="diseño de interiores, inteligencia artificial, IA, decoración, hogar, diseño automático, rediseño, arquitectura interior, landing page"
        canonical="https://interior-ai.com"
      />
      <Hero />
      <BeforeAfter />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  )
}

export default LandingPage
