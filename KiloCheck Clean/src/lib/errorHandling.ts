import { ErrorCode, AppError } from '@/types'

/**
 * Error Classification System for KiloCheck
 * 
 * Classifies errors into three main categories:
 * 1. User Errors (Recoverable) - Issues that users can fix
 * 2. System Errors (Temporary) - Network/API issues that may resolve
 * 3. Critical Errors (Non-recoverable) - Configuration/system failures
 */

export interface ErrorRecoveryStrategy {
  maxRetries: number
  backoffMultiplier: number
  retryableErrors: ErrorCode[]
  fallbackAction?: () => void
}

export const API_RETRY_STRATEGY: ErrorRecoveryStrategy = {
  maxRetries: 3,
  backoffMultiplier: 1.5,
  retryableErrors: [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.API_RATE_LIMIT,
    ErrorCode.API_ERROR
  ]
}

/**
 * Error Category Classification
 */
export enum ErrorCategory {
  USER_ERROR = 'user_error',           // Recoverable user issues
  SYSTEM_ERROR = 'system_error',       // Temporary system issues
  CRITICAL_ERROR = 'critical_error'    // Non-recoverable system failures
}

/**
 * Maps error codes to their categories
 */
export const ERROR_CATEGORIES: Record<ErrorCode, ErrorCategory> = {
  [ErrorCode.INVALID_IMAGE_FORMAT]: ErrorCategory.USER_ERROR,
  [ErrorCode.IMAGE_TOO_LARGE]: ErrorCategory.USER_ERROR,
  [ErrorCode.NO_PRICE_DETECTED]: ErrorCategory.USER_ERROR,
  [ErrorCode.NO_WEIGHT_DETECTED]: ErrorCategory.USER_ERROR,
  [ErrorCode.NO_PRODUCT_DETECTED]: ErrorCategory.USER_ERROR,
  [ErrorCode.API_RATE_LIMIT]: ErrorCategory.SYSTEM_ERROR,
  [ErrorCode.NETWORK_ERROR]: ErrorCategory.SYSTEM_ERROR,
  [ErrorCode.API_ERROR]: ErrorCategory.CRITICAL_ERROR
}

/**
 * User-friendly error messages in Spanish
 */
export const ERROR_MESSAGES: Record<ErrorCode, {
  title: string
  message: string
  suggestions: string[]
}> = {
  [ErrorCode.INVALID_IMAGE_FORMAT]: {
    title: 'Formato no válido',
    message: 'El formato de imagen no es compatible. Usa JPEG, PNG o WebP.',
    suggestions: [
      'Convierte la imagen a JPEG, PNG o WebP',
      'Toma una nueva foto con la cámara',
      'Verifica que el archivo no esté dañado'
    ]
  },
  [ErrorCode.IMAGE_TOO_LARGE]: {
    title: 'Imagen demasiado grande',
    message: 'La imagen es demasiado grande. El tamaño máximo es 10MB.',
    suggestions: [
      'Reduce la resolución de la imagen',
      'Comprime la imagen antes de subirla',
      'Toma una nueva foto con menor calidad'
    ]
  },
  [ErrorCode.NO_PRICE_DETECTED]: {
    title: 'Precio no encontrado',
    message: 'No pudimos encontrar el precio en la imagen. Asegúrate de que esté visible y enfocado.',
    suggestions: [
      'Toma la foto más cerca del precio',
      'Asegúrate de que haya buena iluminación',
      'Verifica que el precio esté claramente visible',
      'Evita reflejos o sombras sobre el precio'
    ]
  },
  [ErrorCode.NO_WEIGHT_DETECTED]: {
    title: 'Peso no encontrado',
    message: 'No pudimos identificar el peso o volumen. Verifica que esta información esté clara en la etiqueta.',
    suggestions: [
      'Asegúrate de que el peso/volumen esté visible',
      'Toma la foto más cerca de la información nutricional',
      'Verifica que la etiqueta esté completa en la imagen',
      'Busca información como "500g", "1L", etc.'
    ]
  },
  [ErrorCode.NO_PRODUCT_DETECTED]: {
    title: 'Producto no identificado',
    message: 'No pudimos identificar el nombre del producto. Asegúrate de que esté visible en la etiqueta.',
    suggestions: [
      'Toma la foto incluyendo el nombre del producto',
      'Asegúrate de que el texto esté enfocado',
      'Verifica que la etiqueta esté completa',
      'Evita cortar el nombre del producto en la foto'
    ]
  },
  [ErrorCode.API_RATE_LIMIT]: {
    title: 'Demasiadas solicitudes',
    message: 'Has realizado demasiadas solicitudes. Espera un momento e intenta de nuevo.',
    suggestions: [
      'Espera 30 segundos antes de intentar de nuevo',
      'Evita subir múltiples imágenes muy rápido',
      'Intenta de nuevo en unos minutos'
    ]
  },
  [ErrorCode.NETWORK_ERROR]: {
    title: 'Error de conexión',
    message: 'Parece que hay un problema de conexión. Verifica tu internet e intenta de nuevo.',
    suggestions: [
      'Verifica tu conexión a internet',
      'Intenta de nuevo en unos momentos',
      'Cambia a una red más estable si es posible',
      'Recarga la página si el problema persiste'
    ]
  },
  [ErrorCode.API_ERROR]: {
    title: 'Error del servidor',
    message: 'Ha ocurrido un error en nuestros servidores. Intenta de nuevo en unos momentos.',
    suggestions: [
      'Intenta de nuevo en unos minutos',
      'Si el problema persiste, contacta soporte',
      'Verifica que la imagen sea válida'
    ]
  }
}

/**
 * Creates a standardized AppError from an ErrorCode
 */
export function createAppError(
  code: ErrorCode,
  originalMessage?: string,
  customSuggestions?: string[]
): AppError {
  const errorInfo = ERROR_MESSAGES[code]
  const category = ERROR_CATEGORIES[code]
  
  return {
    code,
    message: originalMessage || errorInfo.message,
    userMessage: errorInfo.message,
    suggestions: customSuggestions || errorInfo.suggestions,
    recoverable: category !== ErrorCategory.CRITICAL_ERROR
  }
}

/**
 * Determines if an error is retryable based on the retry strategy
 */
export function isRetryableError(error: AppError, strategy: ErrorRecoveryStrategy = API_RETRY_STRATEGY): boolean {
  return strategy.retryableErrors.includes(error.code)
}

/**
 * Gets the error category for an error code
 */
export function getErrorCategory(code: ErrorCode): ErrorCategory {
  return ERROR_CATEGORIES[code]
}

/**
 * Checks if an error is recoverable (user can potentially fix it)
 */
export function isRecoverableError(error: AppError): boolean {
  return error.recoverable
}

/**
 * Gets user-friendly error information
 */
export function getErrorInfo(code: ErrorCode): {
  title: string
  message: string
  suggestions: string[]
  category: ErrorCategory
} {
  const errorInfo = ERROR_MESSAGES[code]
  const category = ERROR_CATEGORIES[code]
  
  return {
    ...errorInfo,
    category
  }
}

/**
 * Formats an error for logging purposes
 */
export function formatErrorForLogging(error: AppError, context?: Record<string, any>): string {
  const timestamp = new Date().toISOString()
  const category = getErrorCategory(error.code)
  
  return JSON.stringify({
    timestamp,
    code: error.code,
    category,
    message: error.message,
    recoverable: error.recoverable,
    context: context || {}
  }, null, 2)
}

/**
 * Error boundary helper for React components
 */
export function handleComponentError(error: Error, errorInfo: any): AppError {
  console.error('Component error:', error, errorInfo)
  
  return createAppError(
    ErrorCode.API_ERROR,
    'An unexpected error occurred in the application',
    ['Refresh the page and try again', 'Contact support if the problem persists']
  )
}