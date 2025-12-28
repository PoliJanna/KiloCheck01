'use client'

import { useState, useCallback } from 'react'
import { ExtractedData, ErrorCode, AppError } from '@/types'
import { createAppError, isRecoverableError } from '@/lib/errorHandling'
import { retryImageAnalysis, resilientApiCall } from '@/lib/retryUtils'

interface DataExtractorProps {
  onExtractionComplete: (data: ExtractedData) => void
  onExtractionError: (error: AppError) => void
  onExtractionStart: () => void
}

interface DataExtractorResult {
  extractData: (file: File) => Promise<void>
  isExtracting: boolean
  error: AppError | null
}

export function useDataExtractor({
  onExtractionComplete,
  onExtractionError,
  onExtractionStart
}: DataExtractorProps): DataExtractorResult {
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  const extractData = useCallback(async (file: File) => {
    setIsExtracting(true)
    setError(null)
    onExtractionStart()

    try {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        const sizeError = createAppError(ErrorCode.IMAGE_TOO_LARGE)
        setError(sizeError)
        onExtractionError(sizeError)
        return
      }

      // Validate file type
      const supportedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!supportedTypes.includes(file.type)) {
        const formatError = createAppError(ErrorCode.INVALID_IMAGE_FORMAT)
        setError(formatError)
        onExtractionError(formatError)
        return
      }

      // Convert file to base64
      const base64 = await fileToBase64(file)

      // Call the API with retry logic
      const result = await retryImageAnalysis(base64, file.type, {
        onRetry: (attempt, error) => {
          console.log(`Retrying image analysis (attempt ${attempt}):`, error.code)
        }
      })

      // Validate extracted data
      const validationError = validateExtractedData(result.data)
      if (validationError) {
        setError(validationError)
        onExtractionError(validationError)
        return
      }

      // Success - call completion handler
      onExtractionComplete(result.data)

    } catch (error) {
      // Handle both retry failures and other errors
      const appError = error as AppError
      setError(appError)
      onExtractionError(appError)
    } finally {
      setIsExtracting(false)
    }
  }, [onExtractionComplete, onExtractionError, onExtractionStart])

  return {
    extractData,
    isExtracting,
    error
  }
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Helper function to validate extracted data
function validateExtractedData(data: ExtractedData): AppError | null {
  // Check price validation
  if (!data.price || data.price.value <= 0 || !data.price.currency) {
    return createAppError(ErrorCode.NO_PRICE_DETECTED)
  }

  // Check weight validation
  if (!data.weight || data.weight.value <= 0 || !data.weight.unit) {
    return createAppError(ErrorCode.NO_WEIGHT_DETECTED)
  }

  // Check valid weight units
  const validUnits = ['g', 'kg', 'ml', 'l']
  if (!validUnits.includes(data.weight.unit)) {
    return createAppError(
      ErrorCode.NO_WEIGHT_DETECTED,
      'Invalid weight unit detected',
      [
        'Verifica que la unidad esté claramente visible',
        'Asegúrate de que sea una unidad estándar (g, kg, ml, l)'
      ]
    )
  }

  // Check product validation
  if (!data.product || !data.product.name || data.product.name.trim().length === 0) {
    return createAppError(ErrorCode.NO_PRODUCT_DETECTED)
  }

  return null
}

// Export the component as a React component for direct usage
interface DataExtractorComponentProps extends DataExtractorProps {
  file: File | null
}

export default function DataExtractor({ 
  file, 
  onExtractionComplete, 
  onExtractionError, 
  onExtractionStart 
}: DataExtractorComponentProps) {
  const { extractData, isExtracting, error } = useDataExtractor({
    onExtractionComplete,
    onExtractionError,
    onExtractionStart
  })

  // Auto-extract when file is provided
  if (file && !isExtracting && !error) {
    extractData(file)
  }

  return null // This is a logic component, no UI
}