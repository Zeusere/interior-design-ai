import { Settings, Palette, Home, Sun, Lightbulb } from 'lucide-react'
import { motion } from 'framer-motion'
import type { DesignOptions } from '../types'

interface EditingOptionsProps {
  options: DesignOptions
  onChange: (options: DesignOptions) => void
  disabled?: boolean
  multiMode?: boolean
}

const EditingOptions = ({ options, onChange, disabled, multiMode }: EditingOptionsProps) => {
  const handleOptionChange = (key: keyof DesignOptions, value: string) => {
    onChange({ ...options, [key]: value })
  }

  const optionGroups = [
    {
      title: 'Estilo de Diseño',
      icon: <Palette className="w-5 h-5" />,
      key: 'style' as keyof DesignOptions,
      options: [
        { value: 'modern', label: 'Moderno', description: 'Líneas limpias y minimalista' },
        { value: 'classic', label: 'Clásico', description: 'Elegante y tradicional' },
        { value: 'industrial', label: 'Industrial', description: 'Materiales crudos y urbano' },
        { value: 'bohemian', label: 'Bohemio', description: 'Colorido y ecléctico' },
        { value: 'scandinavian', label: 'Escandinavo', description: 'Simple y funcional' },
        { value: 'luxury', label: 'Lujo', description: 'Sofisticado y premium' }
      ]
    },
    {
      title: 'Arquitectura',
      icon: <Home className="w-5 h-5" />,
      key: 'architecture' as keyof DesignOptions,
      options: [
        { value: 'contemporary', label: 'Contemporáneo', description: 'Actual y versátil' },
        { value: 'mediterranean', label: 'Mediterráneo', description: 'Cálido y acogedor' },
        { value: 'farmhouse', label: 'Rústico', description: 'Natural y campestre' },
        { value: 'mid-century', label: 'Mediados de Siglo', description: 'Retro y funcional' },
        { value: 'art-deco', label: 'Art Déco', description: 'Glamoroso y geométrico' }
      ]
    },
    {
      title: 'Iluminación',
      icon: <Lightbulb className="w-5 h-5" />,
      key: 'lighting' as keyof DesignOptions,
      options: [
        { value: 'natural', label: 'Natural', description: 'Luz del día' },
        { value: 'warm', label: 'Cálida', description: 'Acogedora y suave' },
        { value: 'cool', label: 'Fría', description: 'Moderna y brillante' },
        { value: 'dramatic', label: 'Dramática', description: 'Contrastes marcados' },
        { value: 'ambient', label: 'Ambiental', description: 'Suave y envolvente' }
      ]
    },
    {
      title: 'Esquema de Colores',
      icon: <Sun className="w-5 h-5" />,
      key: 'colorScheme' as keyof DesignOptions,
      options: [
        { value: 'neutral', label: 'Neutro', description: 'Beiges y grises' },
        { value: 'monochrome', label: 'Monocromático', description: 'Blancos y negros' },
        { value: 'earth', label: 'Tierras', description: 'Marrones y ocres' },
        { value: 'vibrant', label: 'Vibrante', description: 'Colores intensos' },
        { value: 'pastel', label: 'Pastel', description: 'Suaves y delicados' },
        { value: 'jewel', label: 'Joya', description: 'Ricos y profundos' }
      ]
    },
    {
      title: 'Tipo de Habitación',
      icon: <Home className="w-5 h-5" />,
      key: 'roomType' as keyof DesignOptions,
      options: [
        { value: 'living-room', label: 'Sala de Estar', description: 'Área principal' },
        { value: 'bedroom', label: 'Dormitorio', description: 'Espacio de descanso' },
        { value: 'kitchen', label: 'Cocina', description: 'Área culinaria' },
        { value: 'dining-room', label: 'Comedor', description: 'Zona de comidas' },
        { value: 'bathroom', label: 'Baño', description: 'Espacio de aseo' },
        { value: 'office', label: 'Oficina', description: 'Área de trabajo' }
      ]
    }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 h-fit sticky top-4">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-purple-600" />
        Opciones de Diseño
      </h2>

      <div className="space-y-6">
        {optionGroups.map((group, groupIndex) => (
          <motion.div
            key={String(group.key)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                {group.icon}
                {group.title}
              </h3>
              {multiMode && group.key === 'roomType' && (
                <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                  Se configura por imagen
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {group.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionChange(group.key, option.value)}
                  disabled={disabled || (multiMode && group.key === 'roomType')}
                  className={`
                    p-3 rounded-lg text-left transition-all duration-200 border-2
                    ${options[group.key] === option.value
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }
                    ${(disabled || (multiMode && group.key === 'roomType')) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="font-medium text-gray-800">{option.label}</div>
                  <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
      >
        <h4 className="font-semibold text-purple-800 mb-2">💡 Consejo Pro</h4>
        <p className="text-sm text-purple-700">
          Experimenta con diferentes combinaciones. Los estilos modernos funcionan bien con 
          iluminación natural y esquemas neutros, mientras que los diseños bohemios brillan 
          con colores vibrantes.
        </p>
      </motion.div>
    </div>
  )
}

export default EditingOptions