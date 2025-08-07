import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  canonical?: string
}

function SEO({ 
  title = "Interior AI - Diseño de Interiores con Inteligencia Artificial",
  description = "Transforma tu hogar con diseños profesionales generados por IA. Sube una foto y obtén múltiples propuestas de diseño de interiores en segundos. Gratis y fácil de usar.",
  keywords = "diseño de interiores, inteligencia artificial, IA, decoración, hogar, diseño automático, rediseño, arquitectura interior",
  ogImage = "https://interior-ai.com/og-image.jpg",
  canonical = "https://interior-ai.com"
}: SEOProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords)
    }
    
    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', title)
    }
    
    // Update Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', description)
    }
    
    // Update Open Graph image
    const ogImageMeta = document.querySelector('meta[property="og:image"]')
    if (ogImageMeta) {
      ogImageMeta.setAttribute('content', ogImage)
    }
    
    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]')
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonical)
    }
    
    // Update Twitter card title
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) {
      twitterTitle.setAttribute('content', title)
    }
    
    // Update Twitter card description
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (twitterDescription) {
      twitterDescription.setAttribute('content', description)
    }
    
    // Update Twitter card image
    const twitterImage = document.querySelector('meta[name="twitter:image"]')
    if (twitterImage) {
      twitterImage.setAttribute('content', ogImage)
    }
    
  }, [title, description, keywords, ogImage, canonical])

  return null // Este componente no renderiza nada visible
}

export default SEO
