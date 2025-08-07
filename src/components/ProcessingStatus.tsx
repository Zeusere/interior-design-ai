import { motion } from 'framer-motion'
import { Loader2, Sparkles, Palette, Wand2, CheckCircle } from 'lucide-react'

interface ProcessingStatusProps {
  isProcessing: boolean
  currentStep?: string
  estimatedTime?: number
  provider?: string
}

const ProcessingStatus = ({ 
  isProcessing, 
  currentStep: _currentStep = "Generando diseño...", 
  estimatedTime = 15,
  provider = "Replicate AI"
}: ProcessingStatusProps) => {
  if (!isProcessing) return null

  const steps = [
    { label: "Analizando imagen", icon: <Palette className="w-4 h-4" />, duration: 3 },
    { label: "Generando diseño con IA", icon: <Sparkles className="w-4 h-4" />, duration: 12 },
    { label: "Aplicando estilos", icon: <Wand2 className="w-4 h-4" />, duration: 5 },
    { label: "Finalizando resultado", icon: <CheckCircle className="w-4 h-4" />, duration: 2 }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100"
    >
      <div className="text-center">
        {/* Logo de IA girando */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4 relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-300"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        {/* Título principal */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          🎨 Creando tu diseño de interiores
        </h3>
        
        {/* Proveedor */}
        <p className="text-sm text-purple-600 font-medium mb-4">
          Powered by {provider}
        </p>

        {/* Progreso animado */}
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: estimatedTime, ease: 'linear' }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-500">
            <span>Tiempo estimado: {estimatedTime}s</span>
            <span>Alta calidad garantizada</span>
          </div>
        </div>

        {/* Pasos del procesamiento */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="text-purple-600">
                {step.icon}
              </div>
              <span className="text-gray-700 font-medium">{step.label}</span>
              <div className="ml-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-4 h-4 text-purple-600" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mensaje motivacional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
        >
          <p className="text-sm text-purple-700">
            <strong>💡 Mientras esperas:</strong> Nuestra IA está analizando cada detalle de tu espacio 
            para crear un diseño personalizado que combine perfectamente con tus preferencias de estilo, 
            iluminación y colores.
          </p>
        </motion.div>

        {/* Consejos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-4 text-xs text-gray-500"
        >
          ✨ Tip: Los mejores resultados se obtienen con fotos bien iluminadas y ángulos frontales
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ProcessingStatus