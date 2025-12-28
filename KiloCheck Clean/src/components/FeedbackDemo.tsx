'use client'

import { useState } from 'react'
import { 
  InteractiveButton, 
  InteractiveCard, 
  FeedbackToast, 
  LoadingFeedback, 
  InteractiveInput,
  useDeviceType 
} from './FeedbackSystem'

export default function FeedbackDemo() {
  const [showToast, setShowToast] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'warning' | 'error' | 'info'>('success')
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState('')
  
  const deviceType = useDeviceType()

  const handleShowToast = (type: typeof toastType) => {
    setToastType(type)
    setShowToast(true)
  }

  const handleLoadingDemo = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 3000)
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    if (value.length < 3 && value.length > 0) {
      setInputError('Mínimo 3 caracteres')
    } else {
      setInputError('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-4">
          Sistema de Feedback Interactivo
        </h1>
        <p className="text-slate-600">
          Dispositivo detectado: <span className="font-semibold capitalize">{deviceType}</span>
        </p>
      </div>

      {/* Button Demos */}
      <InteractiveCard variant="premium">
        <h2 className="text-xl font-semibold mb-4">Botones Interactivos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InteractiveButton 
            variant="primary" 
            onClick={() => handleShowToast('success')}
          >
            Botón Primario
          </InteractiveButton>
          <InteractiveButton 
            variant="secondary"
            onClick={() => handleShowToast('info')}
          >
            Botón Secundario
          </InteractiveButton>
          <InteractiveButton 
            variant="ghost"
            onClick={() => handleShowToast('warning')}
          >
            Botón Ghost
          </InteractiveButton>
        </div>
        
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InteractiveButton 
            variant="primary" 
            size="sm"
            onClick={() => handleLoadingDemo()}
          >
            Pequeño
          </InteractiveButton>
          <InteractiveButton 
            variant="primary" 
            size="md"
            loading={isLoading}
            onClick={() => handleLoadingDemo()}
          >
            {isLoading ? 'Cargando...' : 'Mediano'}
          </InteractiveButton>
          <InteractiveButton 
            variant="primary" 
            size="lg"
            disabled
          >
            Grande (Deshabilitado)
          </InteractiveButton>
        </div>
      </InteractiveCard>

      {/* Card Demos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InteractiveCard 
          variant="default"
          onClick={() => handleShowToast('success')}
          ariaLabel="Tarjeta interactiva estándar"
        >
          <h3 className="text-lg font-semibold mb-2">Tarjeta Estándar</h3>
          <p className="text-slate-600">
            Esta tarjeta tiene efectos de hover y feedback táctil. 
            {deviceType === 'desktop' && ' Pasa el mouse por encima para ver el efecto.'}
            {deviceType === 'mobile' && ' Toca para ver el feedback táctil.'}
          </p>
        </InteractiveCard>

        <InteractiveCard 
          variant="premium"
          onClick={() => handleShowToast('info')}
          ariaLabel="Tarjeta interactiva premium"
        >
          <h3 className="text-lg font-semibold mb-2">Tarjeta Premium</h3>
          <p className="text-slate-600">
            Esta tarjeta tiene efectos más pronunciados y sombras premium.
            Perfecta para elementos destacados.
          </p>
        </InteractiveCard>
      </div>

      {/* Input Demo */}
      <InteractiveCard variant="default">
        <h2 className="text-xl font-semibold mb-4">Campo de Entrada Interactivo</h2>
        <div className="space-y-4">
          <InteractiveInput
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Escribe algo aquí..."
            error={inputError}
            ariaLabel="Campo de demostración"
          />
          <InteractiveInput
            value="Campo con éxito"
            onChange={() => {}}
            success="¡Validación exitosa!"
            ariaLabel="Campo con estado de éxito"
          />
          <InteractiveInput
            value=""
            onChange={() => {}}
            placeholder="Campo deshabilitado"
            disabled
            ariaLabel="Campo deshabilitado"
          />
        </div>
      </InteractiveCard>

      {/* Loading Demo */}
      <InteractiveCard variant="default">
        <h2 className="text-xl font-semibold mb-4">Estados de Carga</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Carga pequeña:</span>
            <LoadingFeedback isLoading={true} size="sm" message="Cargando..." />
          </div>
          <div className="flex items-center justify-between">
            <span>Carga mediana:</span>
            <LoadingFeedback isLoading={true} size="md" message="Procesando..." />
          </div>
          <div className="flex items-center justify-between">
            <span>Carga grande:</span>
            <LoadingFeedback isLoading={true} size="lg" message="Analizando..." />
          </div>
        </div>
      </InteractiveCard>

      {/* Toast Demo */}
      <InteractiveCard variant="default">
        <h2 className="text-xl font-semibold mb-4">Notificaciones Toast</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InteractiveButton 
            variant="secondary" 
            size="sm"
            onClick={() => handleShowToast('success')}
          >
            Éxito
          </InteractiveButton>
          <InteractiveButton 
            variant="secondary" 
            size="sm"
            onClick={() => handleShowToast('warning')}
          >
            Advertencia
          </InteractiveButton>
          <InteractiveButton 
            variant="secondary" 
            size="sm"
            onClick={() => handleShowToast('error')}
          >
            Error
          </InteractiveButton>
          <InteractiveButton 
            variant="secondary" 
            size="sm"
            onClick={() => handleShowToast('info')}
          >
            Información
          </InteractiveButton>
        </div>
      </InteractiveCard>

      {/* Device-specific features */}
      <InteractiveCard variant="premium">
        <h2 className="text-xl font-semibold mb-4">Características Específicas del Dispositivo</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Tipo de dispositivo:</span>
            <span className="font-semibold capitalize">{deviceType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Efectos de hover:</span>
            <span className={deviceType === 'desktop' ? 'text-success-600' : 'text-slate-400'}>
              {deviceType === 'desktop' ? 'Activos' : 'Deshabilitados'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Feedback táctil:</span>
            <span className={deviceType === 'mobile' ? 'text-success-600' : 'text-slate-400'}>
              {deviceType === 'mobile' ? 'Optimizado' : 'Estándar'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Targets de toque:</span>
            <span className="text-success-600">44px mínimo</span>
          </div>
        </div>
      </InteractiveCard>

      {/* Toast Component */}
      <FeedbackToast
        message={
          toastType === 'success' ? '¡Operación exitosa!' :
          toastType === 'warning' ? 'Advertencia: Revisa los datos' :
          toastType === 'error' ? 'Error: Algo salió mal' :
          'Información importante'
        }
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}