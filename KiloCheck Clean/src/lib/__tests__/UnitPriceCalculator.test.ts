import { UnitPriceCalculator } from '../UnitPriceCalculator'
import { ExtractedData, NormalizedWeight } from '@/types'

describe('UnitPriceCalculator', () => {
  describe('calculate', () => {
    it('should calculate unit price correctly', () => {
      const price: ExtractedData['price'] = {
        value: 2.50,
        currency: 'EUR',
        confidence: 0.9
      }
      
      const normalizedWeight: NormalizedWeight = {
        value: 0.5,
        unit: 'kg',
        originalValue: 500,
        originalUnit: 'g'
      }
      
      const result = UnitPriceCalculator.calculate(price, normalizedWeight)
      
      expect(result.pricePerUnit).toBe(5.00)
      expect(result.unit).toBe('kg')
      expect(result.currency).toBe('EUR')
      expect(result.originalPrice).toBe(2.50)
      expect(result.originalWeight).toBe(normalizedWeight)
    })
    
    it('should round to 2 decimal places', () => {
      const price: ExtractedData['price'] = {
        value: 3.33,
        currency: 'EUR',
        confidence: 0.9
      }
      
      const normalizedWeight: NormalizedWeight = {
        value: 1.5,
        unit: 'l',
        originalValue: 1500,
        originalUnit: 'ml'
      }
      
      const result = UnitPriceCalculator.calculate(price, normalizedWeight)
      
      expect(result.pricePerUnit).toBe(2.22) // 3.33 / 1.5 = 2.22
    })
    
    it('should throw error for invalid price', () => {
      const price: ExtractedData['price'] = {
        value: -2.50,
        currency: 'EUR',
        confidence: 0.9
      }
      
      const normalizedWeight: NormalizedWeight = {
        value: 0.5,
        unit: 'kg',
        originalValue: 500,
        originalUnit: 'g'
      }
      
      expect(() => UnitPriceCalculator.calculate(price, normalizedWeight)).toThrow('Invalid price value: -2.5')
    })
    
    it('should throw error for invalid weight', () => {
      const price: ExtractedData['price'] = {
        value: 2.50,
        currency: 'EUR',
        confidence: 0.9
      }
      
      const normalizedWeight: NormalizedWeight = {
        value: 0,
        unit: 'kg',
        originalValue: 0,
        originalUnit: 'g'
      }
      
      expect(() => UnitPriceCalculator.calculate(price, normalizedWeight)).toThrow('Invalid normalized weight value: 0')
    })
  })
  
  describe('formatPrice', () => {
    it('should format EUR prices correctly', () => {
      expect(UnitPriceCalculator.formatPrice(5.00, 'EUR')).toBe('5.00€')
      expect(UnitPriceCalculator.formatPrice(12.99, 'EUR')).toBe('12.99€')
    })
    
    it('should format USD prices correctly', () => {
      expect(UnitPriceCalculator.formatPrice(5.00, 'USD')).toBe('$5.00')
      expect(UnitPriceCalculator.formatPrice(12.99, 'USD')).toBe('$12.99')
    })
    
    it('should format GBP prices correctly', () => {
      expect(UnitPriceCalculator.formatPrice(5.00, 'GBP')).toBe('£5.00')
    })
    
    it('should handle unknown currencies', () => {
      expect(UnitPriceCalculator.formatPrice(5.00, 'XYZ')).toBe('XYZ5.00')
    })
  })
  
  describe('formatUnitPrice', () => {
    it('should format complete unit price', () => {
      const result = {
        pricePerUnit: 5.00,
        unit: 'kg' as const,
        currency: 'EUR',
        originalPrice: 2.50,
        originalWeight: {
          value: 0.5,
          unit: 'kg' as const,
          originalValue: 500,
          originalUnit: 'g'
        }
      }
      
      expect(UnitPriceCalculator.formatUnitPrice(result)).toBe('5.00€/kg')
    })
    
    it('should format liter unit price', () => {
      const result = {
        pricePerUnit: 3.50,
        unit: 'l' as const,
        currency: 'EUR',
        originalPrice: 1.75,
        originalWeight: {
          value: 0.5,
          unit: 'l' as const,
          originalValue: 500,
          originalUnit: 'ml'
        }
      }
      
      expect(UnitPriceCalculator.formatUnitPrice(result)).toBe('3.50€/l')
    })
  })
  
  describe('isSupportedCurrency', () => {
    it('should return true for supported currencies', () => {
      expect(UnitPriceCalculator.isSupportedCurrency('EUR')).toBe(true)
      expect(UnitPriceCalculator.isSupportedCurrency('USD')).toBe(true)
      expect(UnitPriceCalculator.isSupportedCurrency('GBP')).toBe(true)
      expect(UnitPriceCalculator.isSupportedCurrency('JPY')).toBe(true)
    })
    
    it('should return false for unsupported currencies', () => {
      expect(UnitPriceCalculator.isSupportedCurrency('XYZ')).toBe(false)
      expect(UnitPriceCalculator.isSupportedCurrency('')).toBe(false)
    })
  })
  
  describe('calculatePriceDifference', () => {
    const createUnitPriceResult = (pricePerUnit: number, unit: 'kg' | 'l' = 'kg', currency: string = 'EUR') => ({
      pricePerUnit,
      unit,
      currency,
      originalPrice: pricePerUnit * 0.5,
      originalWeight: {
        value: 0.5,
        unit,
        originalValue: 500,
        originalUnit: unit === 'kg' ? 'g' : 'ml'
      }
    })
    
    it('should calculate percentage difference correctly', () => {
      const price1 = createUnitPriceResult(6.00)
      const price2 = createUnitPriceResult(5.00)
      
      const difference = UnitPriceCalculator.calculatePriceDifference(price1, price2)
      expect(difference).toBe(20) // (6-5)/5 * 100 = 20%
    })
    
    it('should return negative for lower prices', () => {
      const price1 = createUnitPriceResult(4.00)
      const price2 = createUnitPriceResult(5.00)
      
      const difference = UnitPriceCalculator.calculatePriceDifference(price1, price2)
      expect(difference).toBe(-20) // (4-5)/5 * 100 = -20%
    })
    
    it('should throw error for different units', () => {
      const price1 = createUnitPriceResult(5.00, 'kg')
      const price2 = createUnitPriceResult(5.00, 'l')
      
      expect(() => UnitPriceCalculator.calculatePriceDifference(price1, price2))
        .toThrow('Cannot compare different units: kg vs l')
    })
    
    it('should throw error for different currencies', () => {
      const price1 = createUnitPriceResult(5.00, 'kg', 'EUR')
      const price2 = createUnitPriceResult(5.00, 'kg', 'USD')
      
      expect(() => UnitPriceCalculator.calculatePriceDifference(price1, price2))
        .toThrow('Cannot compare different currencies: EUR vs USD')
    })
  })
})