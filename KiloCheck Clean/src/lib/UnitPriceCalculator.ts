import { ExtractedData, NormalizedWeight, UnitPriceResult } from '@/types'

/**
 * UnitPriceCalculator class handles the calculation of unit prices
 * and formatting of price results as required by Requirements 3.4, 3.5
 */
export class UnitPriceCalculator {
  /**
   * Calculates the unit price (price per kilogram or liter)
   * 
   * @param price - The price data from extracted information
   * @param normalizedWeight - The normalized weight/volume data
   * @returns UnitPriceResult with calculated unit price
   */
  static calculate(
    price: ExtractedData['price'], 
    normalizedWeight: NormalizedWeight
  ): UnitPriceResult {
    // Validate inputs
    if (price.value <= 0) {
      throw new Error(`Invalid price value: ${price.value}`)
    }
    
    if (normalizedWeight.value <= 0) {
      throw new Error(`Invalid normalized weight value: ${normalizedWeight.value}`)
    }
    
    // Calculate unit price (price / normalized weight)
    const pricePerUnit = price.value / normalizedWeight.value
    
    // Round to appropriate precision (2 decimal places for currency)
    const roundedPricePerUnit = Math.round(pricePerUnit * 100) / 100
    
    return {
      pricePerUnit: roundedPricePerUnit,
      unit: normalizedWeight.unit,
      currency: price.currency,
      originalPrice: price.value,
      originalWeight: normalizedWeight
    }
  }
  
  /**
   * Formats a price with currency symbol and appropriate precision
   * 
   * @param price - The price value to format
   * @param currency - The currency code (EUR, USD, etc.)
   * @param locale - Optional locale for number formatting (defaults to Spanish)
   * @returns Formatted price string
   */
  static formatPrice(price: number, currency: string, locale: string = 'es-ES'): string {
    // Map currency codes to symbols and formatting rules
    const currencyConfig: Record<string, { symbol: string; position: 'before' | 'after' }> = {
      'EUR': { symbol: '€', position: 'after' },
      'USD': { symbol: '$', position: 'before' },
      'GBP': { symbol: '£', position: 'before' },
      'JPY': { symbol: '¥', position: 'before' }
    }
    
    const config = currencyConfig[currency] || { symbol: currency, position: 'before' }
    
    // Format number with locale-specific decimal separator
    let formattedValue: string
    try {
      // Use Intl.NumberFormat for proper locale formatting
      formattedValue = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price)
    } catch {
      // Fallback to simple formatting if locale is not supported
      formattedValue = price.toFixed(2)
    }
    
    // Apply currency symbol positioning
    if (config.position === 'after') {
      return `${formattedValue}${config.symbol}`
    } else {
      return `${config.symbol}${formattedValue}`
    }
  }
  
  /**
   * Formats a complete unit price result for display
   * 
   * @param result - The unit price result to format
   * @param locale - Optional locale for number formatting
   * @returns Formatted string like "5,00€/kg" or "3,50€/l"
   */
  static formatUnitPrice(result: UnitPriceResult, locale: string = 'es-ES'): string {
    const formattedPrice = this.formatPrice(result.pricePerUnit, result.currency, locale)
    const unitLabel = this.getUnitLabel(result.unit)
    return `${formattedPrice}/${unitLabel}`
  }
  
  /**
   * Gets the appropriate unit label for display
   * 
   * @param unit - The unit ('kg' or 'l')
   * @returns Formatted unit label
   */
  static getUnitLabel(unit: 'kg' | 'l'): string {
    const unitLabels: Record<string, string> = {
      'kg': 'kg',
      'l': 'L'  // Capital L for liters as per international standard
    }
    
    return unitLabels[unit] || unit
  }
  
  /**
   * Formats weight/volume with appropriate units
   * 
   * @param value - The numeric value
   * @param unit - The unit ('g', 'kg', 'ml', 'l')
   * @param locale - Optional locale for number formatting
   * @returns Formatted weight/volume string
   */
  static formatWeight(value: number, unit: string, locale: string = 'es-ES'): string {
    let formattedValue: string
    try {
      // Use appropriate decimal places based on unit
      const decimals = (unit === 'g' || unit === 'ml') ? 0 : 2
      formattedValue = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value)
    } catch {
      // Fallback formatting
      const decimals = (unit === 'g' || unit === 'ml') ? 0 : 2
      formattedValue = value.toFixed(decimals)
    }
    
    // Format unit labels consistently
    const unitLabels: Record<string, string> = {
      'g': 'g',
      'kg': 'kg', 
      'ml': 'ml',
      'l': 'L'
    }
    
    const unitLabel = unitLabels[unit] || unit
    return `${formattedValue}${unitLabel}`
  }
  
  /**
   * Validates if a currency code is supported
   * 
   * @param currency - The currency code to validate
   * @returns true if the currency is supported
   */
  static isSupportedCurrency(currency: string): boolean {
    const supportedCurrencies = ['EUR', 'USD', 'GBP', 'JPY']
    return supportedCurrencies.includes(currency)
  }
  
  /**
   * Gets all supported currencies with their display information
   * 
   * @returns Array of supported currency information
   */
  static getSupportedCurrencies(): Array<{ code: string; symbol: string; name: string }> {
    return [
      { code: 'EUR', symbol: '€', name: 'Euro' },
      { code: 'USD', symbol: '$', name: 'US Dollar' },
      { code: 'GBP', symbol: '£', name: 'British Pound' },
      { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
    ]
  }
  
  /**
   * Calculates the percentage difference between two unit prices
   * Useful for comparing products
   * 
   * @param price1 - First unit price result
   * @param price2 - Second unit price result
   * @returns Percentage difference (positive if price1 is higher)
   */
  static calculatePriceDifference(
    price1: UnitPriceResult, 
    price2: UnitPriceResult
  ): number {
    // Ensure both prices are in the same unit and currency
    if (price1.unit !== price2.unit) {
      throw new Error(`Cannot compare different units: ${price1.unit} vs ${price2.unit}`)
    }
    
    if (price1.currency !== price2.currency) {
      throw new Error(`Cannot compare different currencies: ${price1.currency} vs ${price2.currency}`)
    }
    
    if (price2.pricePerUnit === 0) {
      throw new Error('Cannot calculate percentage with zero price')
    }
    
    const difference = ((price1.pricePerUnit - price2.pricePerUnit) / price2.pricePerUnit) * 100
    return Math.round(difference * 100) / 100 // Round to 2 decimal places
  }
}