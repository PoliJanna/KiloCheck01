'use client'

import { useState, useCallback, useMemo, useReducer } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ImageUploadInterface from '@/components/ImageUploadInterface'
import LoadingComponent from '@/components/LoadingComponent'
import ResultCard from '@/components/ResultCard'
import { useDataExtractor } from '@/components/DataExtractor'
import { WeightNormalizer } from '@/lib/WeightNormalizer'
import { UnitPriceCalculator } from '@/lib/UnitPriceCalculator'
import { AnimationUtils, MemoryUtils } from '@/lib/performance'
import { 
  navigationReducer, 
  createInitialState, 
  calculateProgress,
  getCurrentStepName 
} from '@/lib/navigationState'
import { 
  ExtractedData, 
  UnitPriceResult, 
  AppError
} from '@/types'
import { useDeviceType } from '@/components/FeedbackSystem'

export default function Home() {
  // Use navigation state reducer for better state management
  const [appState, dispatch] = useReducer(navigationReducer, createInitialState())
  
  // Store extracted data for result display
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)

  // Use enhanced device detection
  const deviceType = useDeviceType()

  // Memoized animation configuration for performance
  const animationConfig = useMemo(() => AnimationUtils.getAnimationConfig(), [])

  // Memoized supported formats to prevent re-renders
  const supportedFormats = useMemo(() => ['image/jpeg', 'image/png', 'image/webp'], [])

  // Memoized processing progress
  const processingProgress = useMemo(() => 
    calculateProgress(appState.processingState), 
    [appState.processingState]
  )

  // Memoized current step name
  const currentStepName = useMemo(() => 
    getCurrentStepName(appState.processingState), 
    [appState.processingState]
  )

  // Initialize processing pipeline
  const initializeProcessingPipeline = useCallback(() => {
    dispatch({ type: 'START_PROCESSING' })
  }, [])

  // Update processing pipeline step
  const updateProcessingStep = useCallback((stepIndex: number, status: 'processing' | 'completed' | 'error', error?: string) => {
    dispatch({ 
      type: 'UPDATE_PROCESSING_STEP', 
      payload: { stepIndex, status, error } 
    })
  }, [])

  // Handle extraction start
  const handleExtractionStart = useCallback(() => {
    initializeProcessingPipeline()
  }, [initializeProcessingPipeline])

  // Handle extraction completion
  const handleExtractionComplete = useCallback((data: ExtractedData) => {
    // Store extracted data for result display
    setExtractedData(data)
    
    // Update AI extraction step
    updateProcessingStep(1, 'completed')
    
    // Start data validation step
    updateProcessingStep(2, 'processing')
    
    setTimeout(() => {
      // Complete data validation
      updateProcessingStep(2, 'completed')
      
      // Start unit normalization
      updateProcessingStep(3, 'processing')
      
      setTimeout(() => {
        try {
          // Normalize weight/volume
          const normalizedWeight = WeightNormalizer.normalize(data.weight)
          updateProcessingStep(3, 'completed')
          
          // Start price calculation
          updateProcessingStep(4, 'processing')
          
          setTimeout(() => {
            try {
              // Calculate unit price
              const unitPriceResult = UnitPriceCalculator.calculate(
                data.price,
                normalizedWeight
              )
              
              // Complete processing
              updateProcessingStep(4, 'completed')
              
              // Show results after a brief delay
              setTimeout(() => {
                dispatch({ 
                  type: 'COMPLETE_PROCESSING', 
                  payload: { result: unitPriceResult } 
                })
              }, 500)
              
            } catch (error) {
              updateProcessingStep(4, 'error', 'Error calculating unit price')
              handleExtractionError(error as AppError)
            }
          }, 800)
          
        } catch (error) {
          updateProcessingStep(3, 'error', 'Error normalizing units')
          handleExtractionError(error as AppError)
        }
      }, 600)
      
    }, 400)
  }, [updateProcessingStep])

  // Handle extraction error
  const handleExtractionError = useCallback((error: AppError) => {
    dispatch({ type: 'SHOW_ERROR', payload: { error } })
  }, [])

  // Initialize data extractor hook
  const { extractData, isExtracting } = useDataExtractor({
    onExtractionStart: handleExtractionStart,
    onExtractionComplete: handleExtractionComplete,
    onExtractionError: handleExtractionError
  })

  // Handle image selection
  const handleImageSelect = useCallback((file: File) => {
    extractData(file)
  }, [extractData])

  // Handle reset to start over
  const handleReset = useCallback(() => {
    // Clean up any object URLs to prevent memory leaks
    if (typeof window !== 'undefined') {
      MemoryUtils.logMemoryUsage()
    }
    
    dispatch({ type: 'RESET' })
    setExtractedData(null)
  }, [])

  // Handle error retry
  const handleRetry = useCallback(() => {
    dispatch({ type: 'RETRY' })
    setExtractedData(null)
  }, [])

  // Memoized history display to prevent unnecessary re-renders
  const historyDisplay = useMemo(() => {
    if (appState.history.length === 0 || appState.currentView !== 'upload') {
      return null
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: animationConfig.duration, delay: 0.3 }}
        className="mt-8 sm:mt-12"
      >
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Análisis recientes
        </h3>
        <div className="space-y-2">
          {appState.history.slice(0, 3).map((result, index) => (
            <motion.div
              key={`history-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: animationConfig.duration, delay: index * animationConfig.stagger }}
              className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 flex justify-between items-center text-sm"
            >
              <span className="text-slate-600">
                {UnitPriceCalculator.formatPrice(result.originalPrice, result.currency)} / {result.originalWeight.originalValue}{result.originalWeight.originalUnit}
              </span>
              <span className="font-semibold text-primary-600">
                {UnitPriceCalculator.formatUnitPrice(result)}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }, [appState.history, appState.currentView, animationConfig])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: animationConfig.duration }}
        className="w-full max-w-sm sm:max-w-md lg:max-w-2xl mx-auto text-center"
      >
        {/* Header - Always visible */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: animationConfig.duration, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gradient mb-4 sm:mb-6"
        >
          KiloCheck
        </motion.h1>
        
        {/* Subtitle - Hide on result view for cleaner presentation */}
        <AnimatePresence>
          {appState.currentView !== 'result' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: animationConfig.duration, delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 mb-8 sm:mb-10 lg:mb-12 max-w-xs sm:max-w-md lg:max-w-2xl mx-auto leading-relaxed"
            >
              Descubre el precio unitario real de productos mediante análisis inteligente de fotografías
            </motion.p>
          )}
        </AnimatePresence>
        
        {/* Main content area with view transitions */}
        <AnimatePresence mode="wait">
          {/* Upload View */}
          {appState.currentView === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: animationConfig.duration }}
            >
              <ImageUploadInterface
                onImageSelect={handleImageSelect}
                isProcessing={isExtracting}
                supportedFormats={supportedFormats}
              />
            </motion.div>
          )}
          
          {/* Processing View */}
          {appState.currentView === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: animationConfig.duration }}
            >
              <LoadingComponent
                pipeline={appState.processingState}
                showProgress={true}
              />
            </motion.div>
          )}
          
          {/* Result View */}
          {appState.currentView === 'result' && appState.result && extractedData && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: animationConfig.duration }}
            >
              <ResultCard
                result={appState.result}
                productInfo={extractedData.product}
                onReset={handleReset}
                isVisible={true}
              />
            </motion.div>
          )}
          
          {/* Error View */}
          {appState.currentView === 'error' && appState.error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: animationConfig.duration }}
              className="text-center"
            >
              <div className="card-premium p-6 sm:p-8 max-w-md mx-auto">
                {/* Error icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: animationConfig.duration * 1.5, delay: 0.1 }}
                  className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </motion.div>
                
                {/* Error message */}
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: animationConfig.duration, delay: 0.2 }}
                  className="text-lg font-semibold text-slate-800 mb-2"
                >
                  {appState.error.userMessage}
                </motion.h3>
                
                {/* Error suggestions */}
                {appState.error.suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: animationConfig.duration, delay: 0.3 }}
                    className="text-sm text-slate-600 mb-6"
                  >
                    <ul className="space-y-1">
                      {appState.error.suggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}
                
                {/* Retry button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: animationConfig.duration, delay: 0.4 }}
                  onClick={handleRetry}
                  className="btn-primary w-full"
                >
                  Intentar de nuevo
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* History section - Memoized for performance */}
        {historyDisplay}
      </motion.div>
    </main>
  )
}