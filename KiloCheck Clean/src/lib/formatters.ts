/**
 * Additional formatting utilities for KiloCheck application
 * Complements UnitPriceCalculator with specialized formatting functions
 */

/**
 * Formats a number with Spanish locale conventions
 * 
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimals: number = 2): string {
  try {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  } catch {
    // Fallback for unsupported environments
    return value.toFixed(decimals)
  }
}

/**
 * Formats a percentage value
 * 
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100)
  } catch {
    // Fallback formatting
    return `${value.toFixed(decimals)}%`
  }
}

/**
 * Formats a confidence score as a percentage
 * 
 * @param confidence - Confidence value (0-1)
 * @returns Formatted confidence string
 */
export function formatConfidence(confidence: number): string {
  const percentage = confidence * 100
  if (percentage >= 95) return 'Muy alta'
  if (percentage >= 80) return 'Alta'
  if (percentage >= 60) return 'Media'
  if (percentage >= 40) return 'Baja'
  return 'Muy baja'
}

/**
 * Formats file size in human-readable format
 * 
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${formatNumber(size, unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

/**
 * Formats processing time in human-readable format
 * 
 * @param milliseconds - Processing time in milliseconds
 * @returns Formatted time string
 */
export function formatProcessingTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${Math.round(milliseconds)}ms`
  }
  
  const seconds = milliseconds / 1000
  if (seconds < 60) {
    return `${formatNumber(seconds, 1)}s`
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${Math.round(remainingSeconds)}s`
}

/**
 * Capitalizes the first letter of a string
 * 
 * @param str - The string to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Truncates text to a specified length with ellipsis
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Formats currency symbol with proper spacing
 * 
 * @param currency - Currency code
 * @returns Currency symbol with appropriate spacing
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'JPY': '¥'
  }
  
  return symbols[currency] || currency
}

/**
 * Validates and normalizes currency codes
 * 
 * @param currency - Currency code to normalize
 * @returns Normalized currency code
 */
export function normalizeCurrency(currency: string): string {
  return currency.toUpperCase().trim()
}

/**
 * Formats unit labels with proper capitalization
 * 
 * @param unit - Unit to format
 * @returns Properly formatted unit
 */
export function formatUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    'g': 'g',
    'kg': 'kg',
    'ml': 'ml',
    'l': 'L',  // Capital L for liters
    'oz': 'oz',
    'lb': 'lb'
  }
  
  return unitMap[unit.toLowerCase()] || unit
}