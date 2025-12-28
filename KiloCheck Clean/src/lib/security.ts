/**
 * Security configuration and API key management
 * Ensures secure handling of sensitive credentials
 */

export interface SecurityConfig {
  geminiApiKey: string;
  isProduction: boolean;
  apiKeyValidated: boolean;
}

/**
 * Validates that required environment variables are present and secure
 */
export function validateEnvironmentSecurity(): SecurityConfig {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const isProduction = process.env.NODE_ENV === 'production';

  // Validate API key presence
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  // Validate API key format (basic validation)
  if (geminiApiKey.length < 10 || geminiApiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY appears to be invalid or using placeholder value');
  }

  // In production, ensure we're not using development keys
  if (isProduction && (geminiApiKey.includes('test') || geminiApiKey.includes('dev'))) {
    throw new Error('Development API key detected in production environment');
  }

  return {
    geminiApiKey,
    isProduction,
    apiKeyValidated: true
  };
}

/**
 * Sanitizes error messages to prevent credential exposure
 */
export function sanitizeErrorMessage(error: Error): string {
  let message = error.message;
  
  // Remove any potential API keys from error messages
  const apiKeyPattern = /[A-Za-z0-9_-]{20,}/g;
  message = message.replace(apiKeyPattern, '[REDACTED]');
  
  // Remove file paths that might contain sensitive info
  const pathPattern = /\/[^\s]+/g;
  message = message.replace(pathPattern, '[PATH_REDACTED]');
  
  return message;
}

/**
 * Validates that no sensitive data is exposed in client-side code
 */
export function validateClientSideSecurity(): void {
  // This function runs on the client side to ensure no server secrets are exposed
  if (typeof window !== 'undefined') {
    // Check that no server-side environment variables are accessible
    const dangerousVars = [
      'GEMINI_API_KEY',
      'API_KEY',
      'SECRET',
      'PRIVATE_KEY'
    ];
    
    dangerousVars.forEach(varName => {
      // @ts-ignore - checking for potential security leaks
      if (process.env[varName] || window[varName]) {
        console.error(`Security Warning: ${varName} may be exposed to client`);
      }
    });
  }
}

/**
 * Creates a secure headers object for API requests
 */
export function createSecureHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // Prevent caching of sensitive responses
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
}

/**
 * Logs security events without exposing sensitive data
 */
export function logSecurityEvent(event: string, details?: Record<string, any>): void {
  const sanitizedDetails = details ? 
    Object.fromEntries(
      Object.entries(details).map(([key, value]) => [
        key,
        typeof value === 'string' && value.length > 20 ? '[REDACTED]' : value
      ])
    ) : {};
    
  console.log(`[SECURITY] ${event}`, sanitizedDetails);
}