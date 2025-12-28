import { WeightNormalizer } from '../WeightNormalizer'
import { ExtractedData } from '@/types'

describe('WeightNormalizer', () => {
  describe('normalize', () => {
    it('should convert grams to kilograms', () => {
      const weight: ExtractedData['weight'] = {
        value: 500,
        unit: 'g',
        confidence: 0.9
      }
      
      const result = WeightNormalizer.normalize(weight)
      
      expect(result.value).toBe(0.5)
      expect(result.unit).toBe('kg')
      expect(result.originalValue).toBe(500)
      expect(result.originalUnit).toBe('g')
    })
    
    it('should convert milliliters to liters', () => {
      const weight: ExtractedData['weight'] = {
        value: 1500,
        unit: 'ml',
        confidence: 0.9
      }
      
      const result = WeightNormalizer.normalize(weight)
      
      expect(result.value).toBe(1.5)
      expect(result.unit).toBe('l')
      expect(result.originalValue).toBe(1500)
      expect(result.originalUnit).toBe('ml')
    })
    
    it('should maintain kilograms unchanged (idempotence)', () => {
      const weight: ExtractedData['weight'] = {
        value: 2.5,
        unit: 'kg',
        confidence: 0.9
      }
      
      const result = WeightNormalizer.normalize(weight)
      
      expect(result.value).toBe(2.5)
      expect(result.unit).toBe('kg')
      expect(result.originalValue).toBe(2.5)
      expect(result.originalUnit).toBe('kg')
    })
    
    it('should maintain liters unchanged (idempotence)', () => {
      const weight: ExtractedData['weight'] = {
        value: 1.2,
        unit: 'l',
        confidence: 0.9
      }
      
      const result = WeightNormalizer.normalize(weight)
      
      expect(result.value).toBe(1.2)
      expect(result.unit).toBe('l')
      expect(result.originalValue).toBe(1.2)
      expect(result.originalUnit).toBe('l')
    })
    
    it('should throw error for invalid units', () => {
      const weight = {
        value: 100,
        unit: 'invalid' as any,
        confidence: 0.9
      }
      
      expect(() => WeightNormalizer.normalize(weight)).toThrow('Unsupported unit: invalid')
    })
    
    it('should throw error for invalid weight values', () => {
      const weight: ExtractedData['weight'] = {
        value: -100,
        unit: 'g',
        confidence: 0.9
      }
      
      expect(() => WeightNormalizer.normalize(weight)).toThrow('Invalid weight value: -100')
    })
  })
  
  describe('isValidUnit', () => {
    it('should return true for valid units', () => {
      expect(WeightNormalizer.isValidUnit('g')).toBe(true)
      expect(WeightNormalizer.isValidUnit('kg')).toBe(true)
      expect(WeightNormalizer.isValidUnit('ml')).toBe(true)
      expect(WeightNormalizer.isValidUnit('l')).toBe(true)
    })
    
    it('should return false for invalid units', () => {
      expect(WeightNormalizer.isValidUnit('invalid')).toBe(false)
      expect(WeightNormalizer.isValidUnit('oz')).toBe(false)
      expect(WeightNormalizer.isValidUnit('')).toBe(false)
    })
  })
  
  describe('getConversionFactor', () => {
    it('should return correct conversion factors', () => {
      expect(WeightNormalizer.getConversionFactor('g', 'kg')).toBe(0.001)
      expect(WeightNormalizer.getConversionFactor('kg', 'g')).toBe(1000)
      expect(WeightNormalizer.getConversionFactor('ml', 'l')).toBe(0.001)
      expect(WeightNormalizer.getConversionFactor('l', 'ml')).toBe(1000)
    })
    
    it('should return 1 for same unit conversions', () => {
      expect(WeightNormalizer.getConversionFactor('kg', 'kg')).toBe(1)
      expect(WeightNormalizer.getConversionFactor('l', 'l')).toBe(1)
    })
    
    it('should throw error for invalid conversions', () => {
      expect(() => WeightNormalizer.getConversionFactor('g', 'l')).toThrow('Cannot convert from g to l')
    })
  })
})