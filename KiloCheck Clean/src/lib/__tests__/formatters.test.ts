import {
  formatNumber,
  formatPercentage,
  formatConfidence,
  formatFileSize,
  formatProcessingTime,
  capitalize,
  truncateText,
  getCurrencySymbol,
  normalizeCurrency,
  formatUnit
} from '../formatters'

describe('formatters', () => {
  describe('formatNumber', () => {
    test('formats numbers with Spanish locale', () => {
      expect(formatNumber(1234.56)).toBe('1.234,56')
      expect(formatNumber(5.25, 2)).toBe('5,25')
      expect(formatNumber(10, 0)).toBe('10')
    })
  })

  describe('formatPercentage', () => {
    test('formats percentage values', () => {
      expect(formatPercentage(95.5)).toBe('95,5 %')
      expect(formatPercentage(100, 0)).toBe('100 %')
    })
  })

  describe('formatConfidence', () => {
    test('returns appropriate confidence levels', () => {
      expect(formatConfidence(0.98)).toBe('Muy alta')
      expect(formatConfidence(0.85)).toBe('Alta')
      expect(formatConfidence(0.70)).toBe('Media')
      expect(formatConfidence(0.50)).toBe('Baja')
      expect(formatConfidence(0.30)).toBe('Muy baja')
    })
  })

  describe('formatFileSize', () => {
    test('formats file sizes correctly', () => {
      expect(formatFileSize(1024)).toBe('1,0 KB')
      expect(formatFileSize(1048576)).toBe('1,0 MB')
      expect(formatFileSize(500)).toBe('500 B')
    })
  })

  describe('formatProcessingTime', () => {
    test('formats processing times', () => {
      expect(formatProcessingTime(500)).toBe('500ms')
      expect(formatProcessingTime(2500)).toBe('2,5s')
      expect(formatProcessingTime(65000)).toBe('1m 5s')
    })
  })

  describe('capitalize', () => {
    test('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('WORLD')).toBe('World')
      expect(capitalize('')).toBe('')
    })
  })

  describe('truncateText', () => {
    test('truncates long text', () => {
      expect(truncateText('This is a long text', 10)).toBe('This is...')
      expect(truncateText('Short', 10)).toBe('Short')
    })
  })

  describe('getCurrencySymbol', () => {
    test('returns correct currency symbols', () => {
      expect(getCurrencySymbol('EUR')).toBe('€')
      expect(getCurrencySymbol('USD')).toBe('$')
      expect(getCurrencySymbol('GBP')).toBe('£')
      expect(getCurrencySymbol('UNKNOWN')).toBe('UNKNOWN')
    })
  })

  describe('normalizeCurrency', () => {
    test('normalizes currency codes', () => {
      expect(normalizeCurrency('eur')).toBe('EUR')
      expect(normalizeCurrency(' usd ')).toBe('USD')
    })
  })

  describe('formatUnit', () => {
    test('formats units correctly', () => {
      expect(formatUnit('l')).toBe('L')
      expect(formatUnit('kg')).toBe('kg')
      expect(formatUnit('ML')).toBe('ml')
    })
  })
})