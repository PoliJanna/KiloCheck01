import { 
  calculateBackoffDelay, 
  addJitter, 
  retryWithBackoff, 
  shouldRetryError,
  CircuitBreaker
} from '../retryUtils'
import { ErrorCode, AppError } from '@/types'

describe('retryUtils', () => {
  describe('calculateBackoffDelay', () => {
    it('should calculate exponential backoff correctly', () => {
      expect(calculateBackoffDelay(1, 1000, 2)).toBe(1000)
      expect(calculateBackoffDelay(2, 1000, 2)).toBe(2000)
      expect(calculateBackoffDelay(3, 1000, 2)).toBe(4000)
    })

    it('should respect maximum delay', () => {
      const maxDelay = 5000
      const delay = calculateBackoffDelay(10, 1000, 2, maxDelay)
      expect(delay).toBeLessThanOrEqual(maxDelay)
    })
  })

  describe('addJitter', () => {
    it('should add jitter to delay', () => {
      const baseDelay = 1000
      const jitteredDelay = addJitter(baseDelay, 0.1)
      expect(jitteredDelay).toBeGreaterThanOrEqual(baseDelay)
      expect(jitteredDelay).toBeLessThanOrEqual(baseDelay * 1.1)
    })
  })

  describe('shouldRetryError', () => {
    it('should return true for retryable errors', () => {
      const error: AppError = {
        code: ErrorCode.NETWORK_ERROR,
        message: 'Network error',
        userMessage: 'Network error',
        suggestions: [],
        recoverable: true
      }
      
      const retryableErrors = [ErrorCode.NETWORK_ERROR, ErrorCode.API_RATE_LIMIT]
      expect(shouldRetryError(error, retryableErrors)).toBe(true)
    })

    it('should return false for non-retryable errors', () => {
      const error: AppError = {
        code: ErrorCode.INVALID_IMAGE_FORMAT,
        message: 'Invalid format',
        userMessage: 'Invalid format',
        suggestions: [],
        recoverable: false
      }
      
      const retryableErrors = [ErrorCode.NETWORK_ERROR, ErrorCode.API_RATE_LIMIT]
      expect(shouldRetryError(error, retryableErrors)).toBe(false)
    })
  })

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success')
      
      const result = await retryWithBackoff(operation, { maxRetries: 3 })
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should retry on retryable errors', async () => {
      const retryableError: AppError = {
        code: ErrorCode.NETWORK_ERROR,
        message: 'Network error',
        userMessage: 'Network error',
        suggestions: [],
        recoverable: true
      }

      const operation = jest.fn()
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValue('success')
      
      const result = await retryWithBackoff(operation, { 
        maxRetries: 3,
        baseDelay: 10, // Short delay for testing
        retryableErrors: [ErrorCode.NETWORK_ERROR]
      })
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(3)
    })

    it('should not retry on non-retryable errors', async () => {
      const nonRetryableError: AppError = {
        code: ErrorCode.INVALID_IMAGE_FORMAT,
        message: 'Invalid format',
        userMessage: 'Invalid format',
        suggestions: [],
        recoverable: false
      }

      const operation = jest.fn().mockRejectedValue(nonRetryableError)
      
      await expect(retryWithBackoff(operation, { 
        maxRetries: 3,
        retryableErrors: [ErrorCode.NETWORK_ERROR]
      })).rejects.toThrow()
      
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should call onRetry callback', async () => {
      const retryableError: AppError = {
        code: ErrorCode.NETWORK_ERROR,
        message: 'Network error',
        userMessage: 'Network error',
        suggestions: [],
        recoverable: true
      }

      const operation = jest.fn()
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValue('success')
      
      const onRetry = jest.fn()
      
      await retryWithBackoff(operation, { 
        maxRetries: 3,
        baseDelay: 10,
        retryableErrors: [ErrorCode.NETWORK_ERROR],
        onRetry
      })
      
      expect(onRetry).toHaveBeenCalledWith(1, retryableError)
    })
  })

  describe('CircuitBreaker', () => {
    it('should start in CLOSED state', () => {
      const breaker = new CircuitBreaker(3, 1000)
      expect(breaker.getState()).toBe('CLOSED')
      expect(breaker.getFailures()).toBe(0)
    })

    it('should open after threshold failures', async () => {
      const breaker = new CircuitBreaker(2, 1000)
      const failingOperation = jest.fn().mockRejectedValue(new Error('fail'))
      
      // First failure
      await expect(breaker.execute(failingOperation)).rejects.toThrow()
      expect(breaker.getState()).toBe('CLOSED')
      
      // Second failure - should open circuit
      await expect(breaker.execute(failingOperation)).rejects.toThrow()
      expect(breaker.getState()).toBe('OPEN')
    })

    it('should reject calls when OPEN', async () => {
      const breaker = new CircuitBreaker(1, 1000)
      const failingOperation = jest.fn().mockRejectedValue(new Error('fail'))
      
      // Trigger failure to open circuit
      await expect(breaker.execute(failingOperation)).rejects.toThrow()
      expect(breaker.getState()).toBe('OPEN')
      
      // Should reject without calling operation
      const newOperation = jest.fn()
      await expect(breaker.execute(newOperation)).rejects.toThrow('Circuit breaker is OPEN')
      expect(newOperation).not.toHaveBeenCalled()
    })

    it('should reset on success', async () => {
      const breaker = new CircuitBreaker(3, 1000)
      const successOperation = jest.fn().mockResolvedValue('success')
      
      const result = await breaker.execute(successOperation)
      
      expect(result).toBe('success')
      expect(breaker.getFailures()).toBe(0)
      expect(breaker.getState()).toBe('CLOSED')
    })
  })
})