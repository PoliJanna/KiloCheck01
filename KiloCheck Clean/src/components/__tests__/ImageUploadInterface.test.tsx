import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ImageUploadInterface from '../ImageUploadInterface'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

describe('ImageUploadInterface', () => {
  const mockOnImageSelect = jest.fn()
  const defaultProps = {
    onImageSelect: mockOnImageSelect,
    isProcessing: false,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp']
  }

  beforeEach(() => {
    mockOnImageSelect.mockClear()
  })

  it('renders upload interface correctly', () => {
    render(<ImageUploadInterface {...defaultProps} />)
    
    expect(screen.getByText('Sube una foto de la etiqueta')).toBeInTheDocument()
    expect(screen.getByText('Seleccionar archivo')).toBeInTheDocument()
    expect(screen.getByText(/Formatos soportados: JPEG, PNG, WebP/)).toBeInTheDocument()
  })

  it('shows camera button on mobile devices', () => {
    // Mock mobile detection
    Object.defineProperty(window, 'ontouchstart', {
      value: true,
      writable: true
    })
    
    render(<ImageUploadInterface {...defaultProps} />)
    
    expect(screen.getByText('📷 Usar cámara')).toBeInTheDocument()
  })

  it('validates file formats correctly', () => {
    render(<ImageUploadInterface {...defaultProps} />)
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    
    // Create a mock file with invalid format
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false,
    })
    
    fireEvent.change(fileInput)
    
    expect(screen.getByText(/Formato no soportado/)).toBeInTheDocument()
  })

  it('validates file size correctly', () => {
    render(<ImageUploadInterface {...defaultProps} />)
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    
    // Create a mock file that's too large (>10MB)
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
    
    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false,
    })
    
    fireEvent.change(fileInput)
    
    expect(screen.getByText(/La imagen es demasiado grande/)).toBeInTheDocument()
  })

  it('calls onImageSelect with valid file', () => {
    render(<ImageUploadInterface {...defaultProps} />)
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    
    // Create a valid file
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    })
    
    fireEvent.change(fileInput)
    
    expect(mockOnImageSelect).toHaveBeenCalledWith(validFile)
  })

  it('disables interactions when processing', () => {
    render(<ImageUploadInterface {...defaultProps} isProcessing={true} />)
    
    const uploadArea = screen.getByText('Sube una foto de la etiqueta').closest('div')
    expect(uploadArea).toHaveClass('pointer-events-none')
  })
})