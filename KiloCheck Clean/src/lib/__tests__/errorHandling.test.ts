import { 
  createAppError, 
  isRetryableError, 
  getErrorCategory, 
  isRecoverableError,
  getErrorInfo,
  ErrorCategory,
  API_RETRY_STRATEGY
} from '../errorHandling'
import { ErrorCode } from '@/types'

describe('errorHandling', () => {
  describe('createAppError', () => {
    it('should create AppError with default message', () => {
      const error = createAppError(ErrorCode.INVALID_IMAGE_FORMAT)
      
      expect(error.code).toBe(ErrorCode.INVALID_IMAGE_FORMAT)
      expect(error.message).toBe('El formato de imagen no es compatible. Usa JPEG, PNG o WebP.')
      expect(error.userMessage).toBe('El formato de imagen no es compatible. Usa JPEG, PNG o WebP.')
      expect(error.suggestions).toEqual([
        'Convierte la imagen a JPEG, PNG o WebP',
        'Toma una nueva foto con la cámara',
        'Verifica que el archivo no esté dañado'
      ])
      expect(error.recoverable).toBe(true)
    })

    it('should create AppError with custom message and suggestions', () => {
      const customMessage = 'Custom error message'
      const customSuggestions = ['Custom suggestion']
      
      const error = createAppError(ErrorCode.API_ERROR, customMessage, customSuggestions)
      
      expect(error.code).toBe(ErrorCode.API_ERROR)
      expect(error.message).toBe(customMessage)
      expect(error.suggestions).toEqual(customSuggestions)
      expect(error.recoverable).toBe(false) // API_ERROR is critical
    })
  })

  describe('getErrorCategory', () => {
    it('should return correct category for user errors', () => {
      expect(getErrorCategory(ErrorCode.INVALID_IMAGE_FORMAT)).toBe(ErrorCategory.USER_ERROR)
      expect(getErrorCategory(ErrorCode.NO_PRICE_DETECTED)).toBe(ErrorCategory.USER_ERROR)
    })

    it('should return correct category for system errors', () => {
      expect(getErrorCategory(ErrorCode.NETWORK_ERROR)).toBe(ErrorCategory.SYSTEM_ERROR)
      expect(getErrorCategory(ErrorCode.API_RATE_LIMIT)).toBe(ErrorCategory.SYSTEM_ERROR)
    })

    it('should return correct category for critical errors', () => {
      expect(getErrorCategory(ErrorCode.API_ERROR)).toBe(ErrorCategory.CRITICAL_ERROR)
    })
  })

  describe('isRetryableError', () => {
    it('should return true for retryable errors', () => {
      const networkError = createAppError(ErrorCode.NETWORK_ERROR)
      expect(isRetryableError(networkError)).toBe(true)
      
      const rateLimitError = createAppError(ErrorCode.API_RATE_LIMIT)
      expect(isRetryableError(rateLimitError)).toBe(true)
    })

    it('should return false for non-retryable errors', () => {
      const formatError = createAppError(ErrorCode.INVALID_IMAGE_FORMAT)
      expect(isRetryableError(formatError)).toBe(false)
    })
  })

  describe('isRecoverableError', () => {
    it('should return true for recoverable errors', () => {
      const userError = createAppError(ErrorCode.INVALID_IMAGE_FORMAT)
      expect(isRecoverableError(userError)).toBe(true)
    })

    it('should return false for non-recoverable errors', () => {
      const criticalError = createAppError(ErrorCode.API_ERROR)
      expect(isRecoverableError(criticalError)).toBe(false)
    })
  })

  describe('getErrorInfo', () => {
    it('should return complete error information', () => {
      const info = getErrorInfo(ErrorCode.NO_PRICE_DETECTED)
      
      expect(info.title).toBe('Precio no encontrado')
      expect(info.message).toBe('No pudimos encontrar el precio en la imagen. Asegúrate de que esté visible y enfocado.')
      expect(info.category).toBe(ErrorCategory.USER_ERROR)
      expect(info.suggestions).toContain('Toma la foto más cerca del precio')
    })
  })

  describe('API_RETRY_STRATEGY', () => {
    it('should have correct configuration', () => {
      expect(API_RETRY_STRATEGY.maxRetries).toBe(3)
      expect(API_RETRY_STRATEGY.backoffMultiplier).toBe(1.5)
      expect(API_RETRY_STRATEGY.retryableErrors).toContain(ErrorCode.NETWORK_ERROR)
      expect(API_RETRY_STRATEGY.retryableErrors).toContain(ErrorCode.API_RATE_LIMIT)
      expect(API_RETRY_STRATEGY.retryableErrors).toContain(ErrorCode.API_ERROR)
    })
  })
})