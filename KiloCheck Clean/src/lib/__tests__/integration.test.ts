/**
 * Integration tests for KiloCheck complete flow
 * Tests the integration between all components
 */

import { WeightNormalizer } from '../WeightNormalizer'
import { UnitPriceCalculator } from '../UnitPriceCalculator'
import { ExtractedData, NormalizedWeight, UnitPriceResult } from '@/types'

describe('KiloCheck Integration Tests', () => {
  describe('Complete processing flow', () => {
    it('should process extracted data through complete pipeline', () => {
      // Mock extracted data from AI
      const extractedData: ExtractedData = {
        price: {
          value: 2.50,
          currency: 'EUR',
          confidence: 0.95
        },
        weight: {
          value: 500,
          unit: 'g',
          confidence: 0.90
        },
        product: {
          name: 'Pasta Italiana',
          brand: 'Barilla',
          confidence: 0.85
        }
      }

      // Step 1: Normalize weight
      const normalizedWeight = WeightNormalizer.normalize(extractedData.weight)
      
      expect(normalizedWeight).toEqual({
        value: 0.5,
        unit: 'kg',
        originalValue: 500,
        originalUnit: 'g'
      })

      // Step 2: Calculate unit price
      const unitPriceResult = UnitPriceCalculator.calculate(
        extractedData.price,
        normalizedWeight
      )

      expect(unitPriceResult).toEqual({
        pricePerUnit: 5.00,
        unit: 'kg',
        currency: 'EUR',
        originalPrice: 2.50,
        originalWeight: normalizedWeight
      })

      // Step 3: Format for display
      const formattedPrice = UnitPriceCalculator.formatUnitPrice(unitPriceResult)
      expect(formattedPrice).toBe('€5.00/kg')
    })

    it('should handle liquid products correctly', () => {
      const extractedData: ExtractedData = {
        price: {
          value: 1.20,
          currency: 'EUR',
          confidence: 0.92
        },
        weight: {
          value: 750,
          unit: 'ml',
          confidence: 0.88
        },
        product: {
          name: 'Aceite de Oliva',
          brand: 'Carbonell',
          confidence: 0.90
        }
      }

      const normalizedWeight = WeightNormalizer.normalize(extractedData.weight)
      const unitPriceResult = UnitPriceCalculator.calculate(
        extractedData.price,
        normalizedWeight
      )

      expect(normalizedWeight.unit).toBe('l')
      expect(normalizedWeight.value).toBe(0.75)
      expect(unitPriceResult.pricePerUnit).toBe(1.60)
      expect(UnitPriceCalculator.formatUnitPrice(unitPriceResult)).toBe('€1.60/L')
    })

    it('should handle already normalized units', () => {
      const extractedData: ExtractedData = {
        price: {
          value: 3.99,
          currency: 'EUR',
          confidence: 0.98
        },
        weight: {
          value: 1,
          unit: 'kg',
          confidence: 0.95
        },
        product: {
          name: 'Arroz Bomba',
          brand: 'SOS',
          confidence: 0.92
        }
      }

      const normalizedWeight = WeightNormalizer.normalize(extractedData.weight)
      const unitPriceResult = UnitPriceCalculator.calculate(
        extractedData.price,
        normalizedWeight
      )

      // Should remain unchanged
      expect(normalizedWeight.value).toBe(1)
      expect(normalizedWeight.unit).toBe('kg')
      expect(unitPriceResult.pricePerUnit).toBe(3.99)
    })

    it('should maintain precision in calculations', () => {
      const extractedData: ExtractedData = {
        price: {
          value: 1.33,
          currency: 'EUR',
          confidence: 0.90
        },
        weight: {
          value: 333,
          unit: 'g',
          confidence: 0.85
        },
        product: {
          name: 'Queso Manchego',
          brand: 'García Baquero',
          confidence: 0.88
        }
      }

      const normalizedWeight = WeightNormalizer.normalize(extractedData.weight)
      const unitPriceResult = UnitPriceCalculator.calculate(
        extractedData.price,
        normalizedWeight
      )

      // Should handle precision correctly
      expect(normalizedWeight.value).toBe(0.333)
      expect(unitPriceResult.pricePerUnit).toBeCloseTo(3.99, 2)
    })
  })

  describe('Error handling integration', () => {
    it('should handle invalid weight units', () => {
      const extractedData: ExtractedData = {
        price: {
          value: 2.50,
          currency: 'EUR',
          confidence: 0.95
        },
        weight: {
          value: 500,
          unit: 'invalid' as any,
          confidence: 0.90
        },
        product: {
          name: 'Test Product',
          brand: 'Test Brand',
          confidence: 0.85
        }
      }

      expect(() => {
        WeightNormalizer.normalize(extractedData.weight)
      }).toThrow('Unsupported unit')
    })

    it('should handle zero or negative values', () => {
      const extractedData: ExtractedData = {
        price: {
          value: 0,
          currency: 'EUR',
          confidence: 0.95
        },
        weight: {
          value: 500,
          unit: 'g',
          confidence: 0.90
        },
        product: {
          name: 'Test Product',
          brand: 'Test Brand',
          confidence: 0.85
        }
      }

      const normalizedWeight = WeightNormalizer.normalize(extractedData.weight)

      expect(() => {
        UnitPriceCalculator.calculate(extractedData.price, normalizedWeight)
      }).toThrow('Price must be greater than 0')
    })
  })

  describe('Performance characteristics', () => {
    it('should process data quickly', () => {
      const extractedData: ExtractedData = {
        price: {
          value: 2.50,
          currency: 'EUR',
          confidence: 0.95
        },
        weight: {
          value: 500,
          unit: 'g',
          confidence: 0.90
        },
        product: {
          name: 'Test Product',
          brand: 'Test Brand',
          confidence: 0.85
        }
      }

      const startTime = performance.now()
      
      const normalizedWeight = WeightNormalizer.normalize(extractedData.weight)
      const unitPriceResult = UnitPriceCalculator.calculate(
        extractedData.price,
        normalizedWeight
      )
      const formattedPrice = UnitPriceCalculator.formatUnitPrice(unitPriceResult)
      
      const endTime = performance.now()
      const processingTime = endTime - startTime

      // Should complete in under 1ms
      expect(processingTime).toBeLessThan(1)
      expect(formattedPrice).toBeDefined()
    })
  })
})