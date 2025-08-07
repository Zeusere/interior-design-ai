// Configuración específica para servicios de IA

export const AI_CONFIG = {
  // Replicate - Especializado en diseño de interiores
  replicate: {
    baseUrl: 'https://api.replicate.com/v1',
    model: 'adirik/interior-design',
    version: '76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38',
    // Configuración optimizada para diseño de interiores
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 8.0,
      prompt_strength: 0.6,
      negative_prompt: "blurry, low quality, distorted, unrealistic, bad architecture, poor lighting, oversaturated, cartoonish, window misplacement, door misaligned"
    },
    pricing: 0.0055, // USD por imagen
    avgTime: 15 // segundos
  },

  // OpenAI DALL-E 3 - Backup option
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'dall-e-3',
    defaultParams: {
      size: '1024x1024',
      quality: 'hd',
      style: 'natural'
    },
    pricing: 0.04,
    avgTime: 10
  },

  // Stability AI - Para control avanzado
  stability: {
    baseUrl: 'https://api.stability.ai/v1',
    model: 'stable-diffusion-xl-1024-v1-0',
    defaultParams: {
      cfg_scale: 7,
      steps: 30,
      width: 1024,
      height: 1024
    },
    pricing: 0.04,
    avgTime: 8
  }
}

// Prompts optimizados para cada estilo
export const STYLE_PROMPTS = {
  modern: {
    keywords: ['minimalist', 'clean lines', 'neutral colors', 'contemporary furniture'],
    description: 'modern minimalist interior design with clean lines and contemporary elements'
  },
  classic: {
    keywords: ['elegant', 'traditional', 'timeless', 'sophisticated'],
    description: 'classic elegant interior design with traditional elements and timeless sophistication'
  },
  industrial: {
    keywords: ['raw materials', 'exposed brick', 'metal', 'urban'],
    description: 'industrial style interior with raw materials, exposed brick, and urban elements'
  },
  bohemian: {
    keywords: ['eclectic', 'colorful textiles', 'plants', 'vintage'],
    description: 'bohemian eclectic interior design with colorful textiles and vintage elements'
  },
  scandinavian: {
    keywords: ['functional', 'simple', 'natural wood', 'hygge'],
    description: 'scandinavian style interior with simple functional design and natural elements'
  },
  luxury: {
    keywords: ['sophisticated', 'premium materials', 'high-end', 'opulent'],
    description: 'luxury sophisticated interior design with premium materials and opulent details'
  }
}

// Configuración de tipos de habitación
export const ROOM_CONFIG = {
  'living-room': {
    keywords: ['sofa', 'coffee table', 'entertainment center', 'seating area'],
    focus: 'comfort and social interaction'
  },
  'bedroom': {
    keywords: ['bed', 'nightstands', 'wardrobe', 'peaceful atmosphere'],
    focus: 'rest and relaxation'
  },
  'kitchen': {
    keywords: ['cabinets', 'countertops', 'appliances', 'island'],
    focus: 'functionality and efficiency'
  },
  'dining-room': {
    keywords: ['dining table', 'chairs', 'lighting fixture', 'storage'],
    focus: 'dining and entertainment'
  },
  'bathroom': {
    keywords: ['vanity', 'shower', 'tiles', 'fixtures'],
    focus: 'cleanliness and luxury'
  },
  'office': {
    keywords: ['desk', 'chair', 'storage', 'productivity'],
    focus: 'work and productivity'
  }
}

export default AI_CONFIG