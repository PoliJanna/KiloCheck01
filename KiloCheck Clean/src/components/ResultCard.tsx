'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { UnitPriceResult, ExtractedData } from '@/types'
import { UnitPriceCalculator } from '@/lib/UnitPriceCalculator'
import { InteractiveButton, InteractiveCard, useDeviceType } from './FeedbackSystem'

interface ResultCardProps {
  result: UnitPriceResult
  productInfo: ExtractedData['product']
  onReset: () => void
  isVisible: boolean
}

interface AnimationConfig {
  initial: { opacity: number; y: number; scale: number }
  animate: { opacity: number; y: number; scale: number }
  transition: { duration: number; ease: string }
}

const cardAnimation: AnimationConfig = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
}

const priceAnimation = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6, ease: "easeOut", delay: 0.2 }
}

const detailsAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut", delay: 0.4 }
}

export default function ResultCard({
  result,
  productInfo,
  onReset,
  isVisible
}: ResultCardProps) {
  // Use enhanced device detection
  const deviceType = useDeviceType()

  const formattedUnitPrice = UnitPriceCalculator.formatUnitPrice(result)
  const formattedOriginalPrice = UnitPriceCalculator.formatPrice(
    result.originalPrice, 
    result.currency
  )
  const formattedWeight = UnitPriceCalculator.formatWeight(
    result.originalWeight.originalValue,
    result.originalWeight.originalUnit
  )
  const formattedNormalizedWeight = UnitPriceCalculator.formatWeight(
    result.originalWeight.value,
    result.unit
  )

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="w-full max-w-sm sm:max-w-md mx-auto"
          {...cardAnimation}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
        >
          <div className="card-premium relative overflow-hidden p-4 sm:p-6 lg:p-8">
            {/* Background gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500" />
            
            {/* Main content */}
            <div className="relative z-10">
              {/* Header with product info */}
              <motion.div
                className="text-center mb-4 sm:mb-6"
                {...detailsAnimation}
              >
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800 mb-1">
                  {productInfo.name}
                </h3>
                {productInfo.brand && (
                  <p className="text-xs sm:text-sm text-slate-500">
                    {productInfo.brand}
                  </p>
                )}
              </motion.div>

              {/* Main unit price display - most prominent element */}
              <motion.div
                className="text-center mb-6 sm:mb-8"
                {...priceAnimation}
              >
                <div className="relative">
                  {/* Price value with premium styling */}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-2">
                    {formattedUnitPrice}
                  </h1>
                  
                  {/* Subtle accent line */}
                  <motion.div
                    className="w-16 h-1 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full mx-auto"
                    initial={{ width: 0 }}
                    animate={{ width: 64 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  />
                </div>
                
                <p className="text-xs sm:text-sm text-slate-500 mt-3">
                  Precio por {result.unit === 'kg' ? 'kilogramo' : 'litro'}
                </p>
              </motion.div>

              {/* Secondary information */}
              <motion.div
                className="space-y-4 mb-4 sm:mb-6"
                {...detailsAnimation}
              >
                {/* Original price and weight */}
                <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-slate-600">Precio original:</span>
                    <span className="font-medium text-slate-800">
                      {formattedOriginalPrice}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs sm:text-sm mt-2">
                    <span className="text-slate-600">Peso/Volumen:</span>
                    <span className="font-medium text-slate-800">
                      {formattedWeight}
                      {result.originalWeight.originalUnit !== result.unit && (
                        <span className="text-slate-500 ml-1">
                          ({formattedNormalizedWeight})
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Calculation breakdown */}
                <div className="text-center text-xs text-slate-400">
                  {formattedOriginalPrice} ÷ {formattedNormalizedWeight} = {formattedUnitPrice}
                </div>
              </motion.div>

              {/* Action button */}
              <InteractiveButton
                onClick={onReset}
                variant="secondary"
                size="lg"
                className="w-full"
                ariaLabel="Analizar otra imagen"
              >
                Analizar otra imagen
              </InteractiveButton>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 opacity-10">
              <svg
                className="w-8 h-8 text-primary-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Compact version for comparison views
export function CompactResultCard({
  result,
  productInfo,
  className = ''
}: {
  result: UnitPriceResult
  productInfo: ExtractedData['product']
  className?: string
}) {
  const formattedUnitPrice = UnitPriceCalculator.formatUnitPrice(result)

  return (
    <InteractiveCard
      className={className}
      variant="default"
      hoverable={true}
    >
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium text-slate-800 text-sm">
            {productInfo.name}
          </h4>
          {productInfo.brand && (
            <p className="text-xs text-slate-500">{productInfo.brand}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary-600">
            {formattedUnitPrice}
          </p>
          <p className="text-xs text-slate-500">
            {UnitPriceCalculator.formatPrice(result.originalPrice, result.currency)}
          </p>
        </div>
      </div>
    </InteractiveCard>
  )
}