import { AppError, ErrorCode } from '@/types'
import { isRetryableError, API_RETRY_STRATEGY, ErrorRecoveryStrategy } from '@/lib/errorHandling'

/**
 * Retry utility with exponential backoff for handling API failures
 */

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  retryableErrors?: ErrorCode[]
  onRetry?: (attempt: number, error: AppError) => void
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: API_RETRY_STRATEGY.maxRetries,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: API_RETRY_STRATEGY.backoffMultiplier,
  retryableErrors: API_RETRY_STRATEGY.retryableErrors
}

/**
 * Calculates the delay for the next retry attempt using exponential backoff
 */
export function calculateBackoffDelay(
  attempt: number, 
  baseDelay: number = 1000, 
  multiplier: number = 1.5, 
  maxDelay: number = 30000
): number {
  const delay = baseDelay * Math.pow(multiplier, attempt - 1)
  return Math.min(delay, maxDelay)
}

/**
 * Adds jitter to prevent thundering herd problem
 */
export function addJitter(delay: number, jitterFactor: number = 0.1): number {
  const jitter = delay * jitterFactor * Math.random()
  return delay + jitter
}

/**
 * Sleeps for the specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Determines if an error should be retried based on the error code
 */
export function shouldRetryError(error: AppError, retryableErrors: ErrorCode[]): boolean {
  return retryableErrors.includes(error.code)
}

/**
 * Generic retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: AppError | null = null

  for (let attempt = 1; attempt <= (opts.maxRetries || 3); attempt++) {
    try {
      return await operation()
    } catch (error) {
      // Convert generic errors to AppError if needed
      const appError = error as AppError
      lastError = appError

      // Check if this error should be retried
      if (!shouldRetryError(appError, opts.retryableErrors || [])) {
        throw appError
      }

      // Don't retry on the last attempt
      if (attempt === opts.maxRetries) {
        throw appError
      }

      // Calculate delay with exponential backoff and jitter
      const baseDelay = opts.baseDelay || 1000
      const multiplier = opts.backoffMultiplier || 1.5
      const maxDelay = opts.maxDelay || 30000
      
      const delay = calculateBackoffDelay(attempt, baseDelay, multiplier, maxDelay)
      const delayWithJitter = addJitter(delay)

      // Call retry callback if provided
      if (opts.onRetry) {
        opts.onRetry(attempt, appError)
      }

      // Wait before retrying
      await sleep(delayWithJitter)
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError || new Error('Retry failed with unknown error')
}

/**
 * Specialized retry function for API calls
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const apiRetryOptions: RetryOptions = {
    ...DEFAULT_RETRY_OPTIONS,
    retryableErrors: [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.API_RATE_LIMIT,
      ErrorCode.API_ERROR
    ],
    onRetry: (attempt, error) => {
      console.warn(`API call failed (attempt ${attempt}):`, {
        code: error.code,
        message: error.message,
        recoverable: error.recoverable
      })
    },
    ...options
  }

  return retryWithBackoff(apiCall, apiRetryOptions)
}

/**
 * Retry function specifically for image analysis API calls
 */
export async function retryImageAnalysis(
  imageData: string,
  imageType: string,
  options: Partial<RetryOptions> = {}
): Promise<any> {
  const analysisOptions: RetryOptions = {
    ...DEFAULT_RETRY_OPTIONS,
    maxRetries: 3,
    baseDelay: 2000, // Start with 2 seconds for image analysis
    onRetry: (attempt, error) => {
      console.warn(`Image analysis failed (attempt ${attempt}):`, {
        code: error.code,
        message: error.message,
        imageType,
        imageSize: imageData.length
      })
    },
    ...options
  }

  return retryApiCall(async () => {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
        imageType: imageType
      })
    })

    const result = await response.json()

    if (!result.success) {
      // Convert API error to AppError for retry logic
      const appError: AppError = {
        code: result.error.code as ErrorCode,
        message: result.error.message,
        userMessage: result.error.message,
        suggestions: result.error.suggestions || [],
        recoverable: shouldRetryError({ code: result.error.code } as AppError, analysisOptions.retryableErrors || [])
      }
      throw appError
    }

    return result
  }, analysisOptions)
}

/**
 * Circuit breaker pattern for preventing cascading failures
 */
export class CircuitBreaker {
  private failures: number = 0
  private lastFailureTime: number = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN'
    }
  }

  getState(): string {
    return this.state
  }

  getFailures(): number {
    return this.failures
  }
}

/**
 * Global circuit breaker instance for API calls
 */
export const apiCircuitBreaker = new CircuitBreaker(5, 60000)

/**
 * Enhanced API call with circuit breaker and retry
 */
export async function resilientApiCall<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  return apiCircuitBreaker.execute(() => 
    retryApiCall(operation, options)
  )
}