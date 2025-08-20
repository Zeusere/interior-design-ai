import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Crown, Zap, Shield, Star } from 'lucide-react'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan: (planType: 'monthly' | 'yearly') => void
  currentUsage?: number
  maxFreeUsage?: number
}

const PricingModal = ({ 
  isOpen, 
  onClose, 
  onSelectPlan,
  currentUsage = 1,
  maxFreeUsage = 1
}: PricingModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')

  const plans = {
    free: {
      name: 'Gratis',
      price: 0,
      period: 'Para siempre',
      description: 'Perfecto para probar la herramienta',
      features: [
        '1 generación única',
        'Todas las opciones de diseño',
        'Calidad HD',
        'Soporte por email'
      ],
      limitations: [
        'Solo 1 uso total',
        'No guardar proyectos'
      ]
    },
    monthly: {
      name: 'Pro Mensual',
      price: 19,
      period: 'por mes',
      description: 'Para diseñadores que necesitan flexibilidad',
      features: [
        'Generaciones ilimitadas',
        'Guardar proyectos ilimitados',
        'Sin marca de agua',
        'Soporte prioritario',
        'Nuevas funciones primero'
      ],
      popular: false
    },
    yearly: {
      name: 'Pro Anual',
      price: 149,
      originalPrice: 228,
      period: 'por año',
      description: 'El favorito de los profesionales',
      savings: '34% de descuento',
      features: [
        'Generaciones ilimitadas',
        'Guardar proyectos ilimitados',
        'Sin marca de agua',
        'Soporte prioritario',
        'Nuevas funciones primero',
        '2 meses gratis incluidos'
      ],
      popular: true
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-purple-600" />
                  Upgrade a Pro
                </h2>
                <p className="text-gray-600 mt-1">
                  Has usado {currentUsage} de {maxFreeUsage} generaciones gratuitas
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-6 pt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentUsage / maxFreeUsage) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {currentUsage >= maxFreeUsage 
                ? '🚀 ¡Has alcanzado el límite! Upgrade para continuar'
                : `${maxFreeUsage - currentUsage} generaciones restantes`
              }
            </p>
          </div>

          {/* Toggle anual/mensual */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-center gap-4 p-1 bg-gray-100 rounded-lg w-fit mx-auto">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-4 py-2 rounded-md transition-all ${
                  selectedPlan === 'monthly'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-4 py-2 rounded-md transition-all relative ${
                  selectedPlan === 'yearly'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Anual
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  -34%
                </span>
              </button>
            </div>
          </div>

          {/* Plans */}
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Plan Gratis */}
              <div className="border border-gray-200 rounded-xl p-6 relative">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800">{plans.free.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-800">$0</span>
                    <span className="text-gray-500 ml-1">{plans.free.period}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{plans.free.description}</p>
                </div>

                <div className="mt-6 space-y-3">
                  {plans.free.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                  {plans.free.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>

                <button
                  disabled
                  className="w-full mt-6 py-3 px-4 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                >
                  Plan Actual
                </button>
              </div>

              {/* Plan Mensual */}
              <div className={`rounded-xl p-6 relative ${
                selectedPlan === 'monthly'
                  ? 'border-2 border-purple-500 bg-purple-50'
                  : 'border border-gray-200'
              }`}>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800">{plans.monthly.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-800">${plans.monthly.price}</span>
                    <span className="text-gray-500 ml-1">{plans.monthly.period}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{plans.monthly.description}</p>
                </div>

                <div className="mt-6 space-y-3">
                  {plans.monthly.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onSelectPlan('monthly')}
                  className={`w-full mt-6 py-3 px-4 rounded-lg transition-all font-medium ${
                    selectedPlan === 'monthly'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'border border-purple-600 text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {selectedPlan === 'monthly' ? 'Seleccionar Plan' : 'Cambiar a Mensual'}
                </button>
              </div>

              {/* Plan Anual */}
              <div className={`rounded-xl p-6 relative ${
                selectedPlan === 'yearly'
                  ? 'border-2 border-purple-500 bg-purple-50'
                  : 'border border-gray-200'
              }`}>
                {plans.yearly.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Más Popular
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800">{plans.yearly.name}</h3>
                  <div className="mt-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg text-gray-400 line-through">${plans.yearly.originalPrice}</span>
                      <span className="text-3xl font-bold text-gray-800">${plans.yearly.price}</span>
                    </div>
                    <span className="text-gray-500">{plans.yearly.period}</span>
                    <div className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium mt-1">
                      {plans.yearly.savings}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{plans.yearly.description}</p>
                </div>

                <div className="mt-6 space-y-3">
                  {plans.yearly.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onSelectPlan('yearly')}
                  className={`w-full mt-6 py-3 px-4 rounded-lg transition-all font-medium ${
                    selectedPlan === 'yearly'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                      : 'border border-purple-600 text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {selectedPlan === 'yearly' ? (
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" />
                      Seleccionar Plan
                    </div>
                  ) : 'Cambiar a Anual'}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Pago 100% seguro</p>
                  <p>Puedes cancelar tu suscripción en cualquier momento. Sin compromisos.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PricingModal
