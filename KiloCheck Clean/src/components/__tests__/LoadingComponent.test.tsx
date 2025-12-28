import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoadingComponent, { LoadingSpinner } from '../LoadingComponent'
import { ProcessingPipeline, ProcessingSteps } from '@/types'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}))

describe('LoadingComponent', () => {
  const mockPipeline: ProcessingPipeline = {
    steps: [
      { name: ProcessingSteps.IMAGE_VALIDATION, status: 'completed' },
      { name: ProcessingSteps.AI_EXTRACTION, status: 'processing' },
      { name: ProcessingSteps.DATA_VALIDATION, status: 'pending' },
      { name: ProcessingSteps.UNIT_NORMALIZATION, status: 'pending' },
      { name: ProcessingSteps.PRICE_CALCULATION, status: 'pending' }
    ],
    currentStep: 1,
    totalSteps: 5,
    startTime: Date.now()
  }

  it('renders with default message when no pipeline provided', () => {
    render(<LoadingComponent />)
    
    expect(screen.getByText('Procesando imagen...')).toBeInTheDocument()
    expect(screen.getByText('Esto puede tomar unos segundos...')).toBeInTheDocument()
  })

  it('renders with custom message', () => {
    render(<LoadingComponent message="Mensaje personalizado" />)
    
    expect(screen.getByText('Mensaje personalizado')).toBeInTheDocument()
  })

  it('displays current step from pipeline', () => {
    render(<LoadingComponent pipeline={mockPipeline} />)
    
    expect(screen.getByText('Analizando con IA...')).toBeInTheDocument()
  })

  it('shows progress indicators for each step', () => {
    render(<LoadingComponent pipeline={mockPipeline} showProgress={true} />)
    
    // Should render 5 step indicators
    const stepIndicators = document.querySelectorAll('.w-2.h-2.rounded-full')
    expect(stepIndicators).toHaveLength(5)
  })

  it('hides progress when showProgress is false', () => {
    render(<LoadingComponent pipeline={mockPipeline} showProgress={false} />)
    
    // Progress bar should not be rendered
    const progressBar = document.querySelector('.bg-slate-200.rounded-full.h-2')
    expect(progressBar).not.toBeInTheDocument()
  })
})

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />)
    
    const spinner = document.querySelector('.w-6.h-6')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />)
    
    const spinner = document.querySelector('.w-8.h-8')
    expect(spinner).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />)
    
    const spinner = document.querySelector('.custom-class')
    expect(spinner).toBeInTheDocument()
  })
})