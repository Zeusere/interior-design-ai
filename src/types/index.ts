export interface DesignOptions {
  style: string
  architecture: string
  lighting: string
  colorScheme: string
  roomType: string
}

export interface ProcessedImage {
  id: string
  originalUrl: string
  processedUrl: string
  options: DesignOptions
  timestamp: Date
  status: 'processing' | 'completed' | 'error'
  error?: string
}
