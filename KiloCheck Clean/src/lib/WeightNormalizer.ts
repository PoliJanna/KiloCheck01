import { ExtractedData, NormalizedWeight } from '@/types'

/**
 * WeightNormalizer class handles the conversion of weight and volume units
 * to standardized units (kg for weight, l for volume) as required by Requirements 3.1, 3.2, 3.3
 */
export class WeightNormalizer {
  /**
   * Normalizes weight/volume to standard units (kg/l)
   * Converts grams to kilograms and milliliters to liters
   * Maintains values already in standard units (idempotence)
   * 
   * @param weight - The weight data from extracted information
   * @returns NormalizedWeight with standardized units
   */
  static normalize(weight: ExtractedData['weight']): NormalizedWeight {
    const { value, unit } = weight
    
    // Validate input
    if (!this.isValidUnit(unit)) {
      throw new Error(`Unsupported unit: ${unit}`)
    }
    
    if (value <= 0) {
      throw new Error(`Invalid weight value: ${value}`)
    }
    
    let normalizedValue: number
    let normalizedUnit: 'kg' | 'l'
    
    switch (unit) {
      case 'g':
        // Convert grams to kilograms
        normalizedValue = value / 1000
        normalizedUnit = 'kg'
        break
      case 'kg':
        // Already in standard unit - maintain value (idempotence)
        normalizedValue = value
        normalizedUnit = 'kg'
        break
      case 'ml':
        // Convert milliliters to liters
        normalizedValue = value / 1000
        normalizedUnit = 'l'
        break
      case 'l':
        // Already in standard unit - maintain value (idempotence)
        normalizedValue = value
        normalizedUnit = 'l'
        break
      default:
        throw new Error(`Unsupported unit: ${unit}`)
    }
    
    return {
      value: normalizedValue,
      unit: normalizedUnit,
      originalValue: value,
      originalUnit: unit
    }
  }
  
  /**
   * Validates if a unit is supported by the normalizer
   * 
   * @param unit - The unit string to validate
   * @returns true if the unit is supported
   */
  static isValidUnit(unit: string): unit is 'g' | 'kg' | 'ml' | 'l' {
    return ['g', 'kg', 'ml', 'l'].includes(unit)
  }
  
  /**
   * Gets the conversion factor between two units
   * 
   * @param fromUnit - Source unit
   * @param toUnit - Target unit
   * @returns Conversion factor to multiply by
   */
  static getConversionFactor(fromUnit: string, toUnit: string): number {
    const conversions: Record<string, Record<string, number>> = {
      'g': { 'kg': 1/1000, 'g': 1 },
      'kg': { 'kg': 1, 'g': 1000 },
      'ml': { 'l': 1/1000, 'ml': 1 },
      'l': { 'l': 1, 'ml': 1000 }
    }
    
    if (!conversions[fromUnit] || !conversions[fromUnit][toUnit]) {
      throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}`)
    }
    
    return conversions[fromUnit][toUnit]
  }
}