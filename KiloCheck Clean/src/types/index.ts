// Core data types for KiloCheck application

export interface ExtractedData {
  price: {
    value: number
    currency: string
    confidence: number
  }
  weight: {
    value: number
    unit: 'g' | 'kg' | 'ml' | 'l'
    confidence: number
  }
  product: {
    name: string
    brand: string
    confidence: number
  }
}

export interface ExtractionResult {
  success: boolean
  data?: ExtractedData
  error?: string
  processingTime: number
}

export interface NormalizedWeight {
  value: number
  unit: 'kg' | 'l'
  originalValue: number
  originalUnit: string
}

export interface UnitPriceResult {
  pricePerUnit: number
  unit: 'kg' | 'l'
  currency: string
  originalPrice: number
  originalWeight: NormalizedWeight
}

export interface ProcessingStep {
  name: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  duration?: number
  error?: string
}

export interface ProcessingPipeline {
  steps: ProcessingStep[]
  currentStep: number
  totalSteps: number
  startTime: number
}

export enum ProcessingSteps {
  IMAGE_VALIDATION = 'image_validation',
  AI_EXTRACTION = 'ai_extraction',
  DATA_VALIDATION = 'data_validation',
  UNIT_NORMALIZATION = 'unit_normalization',
  PRICE_CALCULATION = 'price_calculation'
}

export enum ErrorCode {
  INVALID_IMAGE_FORMAT = 'INVALID_IMAGE_FORMAT',
  IMAGE_TOO_LARGE = 'IMAGE_TOO_LARGE',
  NO_PRICE_DETECTED = 'NO_PRICE_DETECTED',
  NO_WEIGHT_DETECTED = 'NO_WEIGHT_DETECTED',
  NO_PRODUCT_DETECTED = 'NO_PRODUCT_DETECTED',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export interface AppError {
  code: ErrorCode
  message: string
  userMessage: string
  suggestions: string[]
  recoverable: boolean
}

export interface AppState {
  currentView: 'upload' | 'processing' | 'result' | 'error'
  uploadState: UploadState
  processingState: ProcessingPipeline
  result: UnitPriceResult | null
  error: AppError | null
  history: UnitPriceResult[]
}

export interface UploadState {
  isDragOver: boolean
  isUploading: boolean
  error: string | null
}

export interface ImageUploadProps {
  onImageSelect: (file: File) => void
  isProcessing: boolean
  supportedFormats: string[]
}

export interface UIPreferences {
  theme: 'light' | 'dark' | 'system'
  currency: string
  language: string
  animations: boolean
}