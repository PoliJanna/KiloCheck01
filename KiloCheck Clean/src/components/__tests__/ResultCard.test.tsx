import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ResultCard, { CompactResultCard } from '../ResultCard'
import { UnitPriceResult, ExtractedData } from '@/types'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>
  },
  AnimatePresence: ({ children }: any) => children
}))

const mockResult: UnitPriceResult = {
  pricePerUnit: 5.25,
  unit: 'kg',
  currency: 'EUR',
  originalPrice: 2.10,
  originalWeight: {
    value: 0.4,
    unit: 'kg',
    originalValue: 400,
    originalUnit: 'g'
  }
}

const mockProductInfo: ExtractedData['product'] = {
  name: 'Tomates Cherry',
  brand: 'Marca Test',
  confidence: 0.95
}

describe('ResultCard', () => {
  const mockOnReset = jest.fn()

  beforeEach(() => {
    mockOnReset.mockClear()
  })

  test('displays unit price as most prominent element', () => {
    render(
      <ResultCard
        result={mockResult}
        productInfo={mockProductInfo}
        onReset={mockOnReset}
        isVisible={true}
      />
    )

    // Check that unit price is displayed prominently
    expect(screen.getByText(/5,25€\/kg/)).toBeInTheDocument()
  })

  test('displays product information as secondary element', () => {
    render(
      <ResultCard
        result={mockResult}
        productInfo={mockProductInfo}
        onReset={mockOnReset}
        isVisible={true}
      />
    )

    // Product name should be visible but secondary
    expect(screen.getByText('Tomates Cherry')).toBeInTheDocument()
    expect(screen.getByText('Marca Test')).toBeInTheDocument()
  })

  test('displays original price and weight information', () => {
    render(
      <ResultCard
        result={mockResult}
        productInfo={mockProductInfo}
        onReset={mockOnReset}
        isVisible={true}
      />
    )

    // Original price should be shown
    expect(screen.getByText(/2,10€/)).toBeInTheDocument()
    // Weight information should be shown
    expect(screen.getByText(/400g/)).toBeInTheDocument()
  })

  test('calls onReset when reset button is clicked', () => {
    render(
      <ResultCard
        result={mockResult}
        productInfo={mockProductInfo}
        onReset={mockOnReset}
        isVisible={true}
      />
    )

    const resetButton = screen.getByText('Analizar otra imagen')
    fireEvent.click(resetButton)

    expect(mockOnReset).toHaveBeenCalledTimes(1)
  })

  test('shows calculation breakdown', () => {
    render(
      <ResultCard
        result={mockResult}
        productInfo={mockProductInfo}
        onReset={mockOnReset}
        isVisible={true}
      />
    )

    // Should show the calculation formula
    expect(screen.getByText(/2,10€ ÷ 0,40kg = 5,25€\/kg/)).toBeInTheDocument()
  })
})

describe('CompactResultCard', () => {
  test('displays essential information in compact format', () => {
    render(
      <CompactResultCard
        result={mockResult}
        productInfo={mockProductInfo}
      />
    )

    // Should show product name and unit price
    expect(screen.getByText('Tomates Cherry')).toBeInTheDocument()
    expect(screen.getByText(/5,25€\/kg/)).toBeInTheDocument()
    expect(screen.getByText(/2,10€/)).toBeInTheDocument()
  })
})