import Hero from '../components/landing/Hero'
import BeforeAfter from '../components/landing/BeforeAfter'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import Footer from '../components/landing/Footer'

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <BeforeAfter />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  )
}

export default LandingPage
