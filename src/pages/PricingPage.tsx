import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Crown, Zap, Star, Shield, Users, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription, useIsProUser, useUsageInfo } from '../contexts/SubscriptionContext'
import SEO from '../components/SEO'

const PricingPage = () => {
  const { user } = useAuth()
  const { handleUpgrade } = useSubscription()
  const isProUser = useIsProUser()
  const { current, max } = useUsageInfo()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')

  const plans = {
    free: {
      name: 'Gratis',
      price: 0,
      period: 'Para siempre',
      description: 'Perfecto para probar la herramienta',
      badge: null,
      features: [
        '5 generaciones gratuitas',
        'Todas las opciones de diseño',
        'Calidad HD',
        'Soporte por email'
      ],
      limitations: [
        'Máximo 5 generaciones',
        'No guardar proyectos'
      ]
    },
    monthly: {
      name: 'Pro Mensual',
      price: 19,
      period: 'por mes',
      description: 'Para diseñadores que necesitan flexibilidad',
      badge: null,
      features: [
        'Generaciones ilimitadas',
        'Guardar proyectos ilimitados',
        'Sin marca de agua',
        'Soporte prioritario',
        'Nuevas funciones primero',
        'Exportar en alta resolución'
      ]
    },
    yearly: {
      name: 'Pro Anual',
      price: 149,
      originalPrice: 228,
      period: 'por año',
      description: 'El favorito de los profesionales',
      savings: '34% de descuento',
      badge: 'Más Popular',
      features: [
        'Generaciones ilimitadas',
        'Guardar proyectos ilimitados',
        'Sin marca de agua',
        'Soporte prioritario',
        'Nuevas funciones primero',
        'Exportar en alta resolución',
        '2 meses gratis incluidos',
        'Acceso a funciones beta'
      ]
    }
  }

  const testimonials = [
    {
      name: "María González",
      role: "Arquitecta de Interiores",
      content: "Interior AI ha revolucionado mi flujo de trabajo. Puedo mostrar a mis clientes múltiples opciones en minutos.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Carlos Ruiz",
      role: "Desarrollador Inmobiliario",
      content: "Genero presentaciones de toda una promoción en una tarde. Mis ventas han aumentado un 40%.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
    },
    {
      name: "Ana López",
      role: "Diseñadora Freelance",
      content: "El plan anual es perfecto. La calidad de los diseños es impresionante y mis clientes quedan fascinados.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face"
    }
  ]

  const stats = [
    { icon: Users, value: "10,000+", label: "Diseñadores activos" },
    { icon: TrendingUp, value: "500,000+", label: "Diseños generados" },
    { icon: Star, value: "4.9/5", label: "Rating promedio" },
    { icon: Zap, value: "15 seg", label: "Tiempo promedio" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
      <SEO 
        title="Precios de Interior AI - Planes Pro"
        description="Planes flexibles para diseñadores. Desde gratis hasta Pro ilimitado. Descuento del 34% en plan anual."
        keywords="precios interior ai, plan pro, suscripción diseño, pricing"
      />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Diseña sin 
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Límites</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Elige el plan perfecto para tus necesidades. Comienza gratis y escala cuando estés listo.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Current Usage */}
          {user && !isProUser && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-amber-50 border border-amber-200 rounded-xl p-6 max-w-md mx-auto mb-8"
            >
              <h3 className="font-semibold text-amber-800 mb-2">Tu uso actual</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-amber-700">Generaciones usadas</span>
                <span className="font-bold text-amber-800">{current}/{max}</span>
              </div>
              <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${(current / max) * 100}%` }}
                />
              </div>
              {current >= max && (
                <p className="text-sm text-amber-700 mt-2">
                  🚀 ¡Has usado tus {max} generaciones gratuitas! Upgrade para continuar diseñando.
                </p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Toggle anual/mensual */}
        <div className="flex items-center justify-center gap-4 p-1 bg-white rounded-xl w-fit mx-auto mb-12 shadow-lg">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`px-6 py-3 rounded-lg transition-all ${
              selectedPlan === 'monthly'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`px-6 py-3 rounded-lg transition-all relative ${
              selectedPlan === 'yearly'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Anual
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              -34%
            </span>
          </button>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Plan Gratis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-lg relative"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{plans.free.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-800">€0</span>
                <span className="text-gray-500 ml-2">{plans.free.period}</span>
              </div>
              <p className="text-gray-600">{plans.free.description}</p>
            </div>

            <div className="space-y-3 mb-8">
              {plans.free.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                </div>
              ))}
              {plans.free.limitations.map((limitation, index) => (
                <div key={index} className="flex items-center gap-3 opacity-60">
                  <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                    <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  </div>
                  <span className="text-gray-500 text-sm">{limitation}</span>
                </div>
              ))}
            </div>

            <button
              disabled
              className="w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
            >
              {user ? 'Plan Actual' : 'Empezar Gratis'}
            </button>
          </motion.div>

          {/* Plan Mensual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`bg-white rounded-2xl p-8 shadow-lg relative ${
              selectedPlan === 'monthly' ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{plans.monthly.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-800">€{plans.monthly.price}</span>
                <span className="text-gray-500 ml-2">{plans.monthly.period}</span>
              </div>
              <p className="text-gray-600">{plans.monthly.description}</p>
            </div>

            <div className="space-y-3 mb-8">
              {plans.monthly.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleUpgrade('monthly')}
              disabled={!user || isProUser}
              className={`w-full py-3 px-4 rounded-lg transition-all font-medium ${
                selectedPlan === 'monthly'
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'border border-purple-600 text-purple-600 hover:bg-purple-50'
              } ${(!user || isProUser) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {!user ? 'Regístrate Primero' : isProUser ? 'Ya eres Pro' : 'Seleccionar Plan'}
            </button>
          </motion.div>

          {/* Plan Anual */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`bg-white rounded-2xl p-8 shadow-lg relative ${
              selectedPlan === 'yearly' ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            {plans.yearly.badge && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {plans.yearly.badge}
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{plans.yearly.name}</h3>
              <div className="mb-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg text-gray-400 line-through">€{plans.yearly.originalPrice}</span>
                  <span className="text-4xl font-bold text-gray-800">€{plans.yearly.price}</span>
                </div>
                <span className="text-gray-500">{plans.yearly.period}</span>
                <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mt-2">
                  {plans.yearly.savings}
                </div>
              </div>
              <p className="text-gray-600">{plans.yearly.description}</p>
            </div>

            <div className="space-y-3 mb-8">
              {plans.yearly.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleUpgrade('yearly')}
              disabled={!user || isProUser}
              className={`w-full py-3 px-4 rounded-lg transition-all font-medium ${
                selectedPlan === 'yearly'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                  : 'border border-purple-600 text-purple-600 hover:bg-purple-50'
              } ${(!user || isProUser) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {!user ? 'Regístrate Primero' : isProUser ? 'Ya eres Pro' : (
                <div className="flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4" />
                  Seleccionar Plan
                </div>
              )}
            </button>
          </motion.div>
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Lo que dicen nuestros usuarios
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-white rounded-2xl p-8 text-center shadow-lg"
        >
          <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Pago 100% Seguro</h3>
          <p className="text-gray-600 mb-4">
            Procesamos los pagos con Stripe, la plataforma más segura del mundo. 
            Puedes cancelar tu suscripción en cualquier momento.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>🔒 SSL Encriptado</span>
            <span>💳 Stripe Payments</span>
            <span>↩️ Cancelación Fácil</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PricingPage
