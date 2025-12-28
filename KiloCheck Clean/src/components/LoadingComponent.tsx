'use client'

import { motion } from 'framer-motion'
import { ProcessingPipeline, ProcessingSteps } from '@/types'
import { useDeviceType } from './FeedbackSystem'

interface LoadingComponentProps {
  pipeline?: ProcessingPipeline
  message?: string
  showProgress?: boolean
}

const STEP_LABELS: Record<ProcessingSteps, string> = {
  [ProcessingSteps.IMAGE_VALIDATION]: 'Validando imagen...',
  [ProcessingSteps.AI_EXTRACTION]: 'Analizando con IA...',
  [ProcessingSteps.DATA_VALIDATION]: 'Validando datos...',
  [ProcessingSteps.UNIT_NORMALIZATION]: 'Normalizando unidades...',
  [ProcessingSteps.PRICE_CALCULATION]: 'Calculando precio unitario...'
}

export default function LoadingComponent({
  pipeline,
  message = 'Procesando imagen...',
  showProgress = true
}: LoadingComponentProps) {
  // Use enhanced device detection
  const deviceType = useDeviceType()

  const progress = pipeline 
    ? (pipeline.currentStep / pipeline.totalSteps) * 100 
    : 0

  const currentStepLabel = pipeline?.steps[pipeline.currentStep]?.name
    ? STEP_LABELS[pipeline.steps[pipeline.currentStep].name as ProcessingSteps]
    : message

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="card-premium text-center p-4 sm:p-6 lg:p-8"
      >
        {/* Animated loading spinner */}
        <motion.div
          className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 mx-auto mb-4 sm:mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 border-4 border-slate-200 rounded-full"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Spinning inner ring */}
          <motion.div
            className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Center dot */}
          <motion.div
            className="absolute inset-4 bg-blue-600 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1, 0.8, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Loading message */}
        <motion.h3
          className="text-sm sm:text-base lg:text-lg font-semibold text-slate-700 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {currentStepLabel}
        </motion.h3>

        {/* Progress bar */}
        {showProgress && pipeline && (
          <motion.div
            className="w-full bg-slate-200 rounded-full h-1.5 sm:h-2 mb-4"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <motion.div
              className="bg-blue-600 rounded-full h-1.5 sm:h-2"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </motion.div>
        )}

        {/* Processing steps indicator */}
        {pipeline && (
          <motion.div
            className="flex justify-center space-x-2 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {pipeline.steps.map((step, index) => (
              <motion.div
                key={step.name}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  step.status === 'completed' 
                    ? 'bg-green-500' 
                    : step.status === 'processing'
                    ? 'bg-blue-500'
                    : step.status === 'error'
                    ? 'bg-red-500'
                    : 'bg-slate-300'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              />
            ))}
          </motion.div>
        )}

        {/* Subtle pulsing animation for feedback */}
        <motion.p
          className="text-xs sm:text-sm text-slate-500 mt-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Esto puede tomar unos segundos...
        </motion.p>
      </motion.div>
    </div>
  )
}

// Simplified loading spinner for inline use
export function LoadingSpinner({ size = 'md', className = '' }: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <div className="w-full h-full border-2 border-transparent border-t-current rounded-full" />
    </motion.div>
  )
}