import { motion } from 'framer-motion'
import { Upload, Wand2, Download, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Sube tu foto",
      description: "Toma una foto de tu habitación con tu teléfono o cámara. No necesita ser perfecta, nuestra IA se encarga del resto.",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHJlY3QgeD0iNTAiIHk9IjUwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2U1ZTdlYiIgcng9IjEwIi8+PHBhdGggZD0iTTEyNSA5MHYyMG0tMTAtMTBIMTM1IiBzdHJva2U9IiM2YjcyODAiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTM1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlN1YmlyIGZvdG88L3RleHQ+PC9zdmc+"
    },
    {
      number: "02",
      icon: Wand2,
      title: "IA trabaja su magia",
      description: "Nuestra inteligencia artificial analiza tu espacio, entiende la arquitectura y genera múltiples opciones de diseño personalizadas.",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM4YjVjZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzYjgyZjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIiBvcGFjaXR5PSIwLjEiLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjOGI1Y2Y2IiBvcGFjaXR5PSIwLjMiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9InIiIHZhbHVlcz0iMzA7NDA7MzAiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PC9jaXJjbGU+PHRleHQgeD0iMTUwIiB5PSIxNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SUEgcHJvY2VzYW5kby4uLjwvdGV4dD48L3N2Zz4="
    },
    {
      number: "03",
      icon: Download,
      title: "Descarga y disfruta",
      description: "Recibe múltiples opciones de diseño en alta calidad. Descarga, comparte o usa como guía para tu proyecto real.",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHJlY3QgeD0iNTAiIHk9IjQwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzEwYjk4MSIgcng9IjEwIiBvcGFjaXR5PSIwLjIiLz48cGF0aCBkPSJNMTQwIDkwbDEwIDEwIDEwLTEwIiBzdHJva2U9IiMxMGI5ODEiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIvPjxsaW5lIHgxPSIxNTAiIHkxPSI3MCIgeDI9IjE1MCIgeTI9IjEwMCIgc3Ryb2tlPSIjMTBiOTgxIiBzdHJva2Utd2lkdGg9IjMiLz48dGV4dCB4PSIxNTAiIHk9IjE0NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNmI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EZXNjYXJnYSBsaXN0YTwvdGV4dD48L3N2Zz4="
    }
  ]

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Así de
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> fácil es</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            En solo 3 simples pasos tendrás diseños profesionales para tu hogar. 
            No se necesita experiencia técnica.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isEven = index % 2 === 0
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20 mb-20 lg:mb-32 last:mb-0`}
              >
                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-6">
                    <div className="relative">
                      <span className="text-6xl lg:text-8xl font-bold text-gray-100">
                        {step.number}
                      </span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                    {step.title}
                  </h3>
                  
                  <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                    {step.description}
                  </p>

                  {index === steps.length - 1 && (
                    <Link
                      to="/app"
                      className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Empezar Ahora
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  )}
                </div>

                {/* Visual */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 shadow-xl">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-48 object-cover rounded-2xl"
                      />
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-purple-500 rounded-full opacity-60" />
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full opacity-60" />
                  </div>
                </div>

                {/* Connector arrow for desktop */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
                    viewport={{ once: true }}
                    className="hidden lg:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <ArrowRight className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gray-50 rounded-3xl p-8 lg:p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              ¿Listo para transformar tu hogar?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Únete a miles de usuarios que ya están creando espacios increíbles
            </p>
            <Link
              to="/app"
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-5 rounded-xl font-semibold text-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Comenzar Gratis
              <ArrowRight className="ml-3 w-6 h-6" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks
