/**
 * Navigation state management for KiloCheck application
 * Handles transitions between upload, processing, result, and error states
 */

import { AppState, ProcessingPipeline, ProcessingSteps, UnitPriceResult, AppError } from '@/types'

export type ViewState = 'upload' | 'processing' | 'result' | 'error'

export interface NavigationActions {
  startProcessing: () => void
  completeProcessing: (result: UnitPriceResult) => void
  showError: (error: AppError) => void
  reset: () => void
  retry: () => void
}

/**
 * Create initial app state
 */
export function createInitialState(): AppState {
  return {
    currentView: 'upload',
    uploadState: {
      isDragOver: false,
      isUploading: false,
      error: null
    },
    processingState: {
      steps: [],
      currentStep: 0,
      totalSteps: 0,
      startTime: 0
    },
    result: null,
    error: null,
    history: []
  }
}

/**
 * Create processing pipeline
 */
export function createProcessingPipeline(): ProcessingPipeline {
  return {
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
}

/**
 * Navigation state reducer for managing state transitions
 */
export function navigationReducer(
  state: AppState,
  action: { type: string; payload?: any }
): AppState {
  switch (action.type) {
    case 'START_PROCESSING':
      return {
        ...state,
        currentView: 'processing',
        processingState: createProcessingPipeline(),
        error: null,
        result: null
      }

    case 'UPDATE_PROCESSING_STEP':
      const { stepIndex, status, error } = action.payload
      return {
        ...state,
        processingState: {
          ...state.processingState,
          steps: state.processingState.steps.map((step, index) =>
            index === stepIndex
              ? {
                  ...step,
                  status,
                  error,
                  duration: status === 'completed' ? Date.now() - state.processingState.startTime : undefined
                }
              : step
          ),
          currentStep: status === 'completed' ? stepIndex + 1 : stepIndex
        }
      }

    case 'COMPLETE_PROCESSING':
      return {
        ...state,
        currentView: 'result',
        result: action.payload.result,
        history: [action.payload.result, ...state.history.slice(0, 9)] // Keep last 10 results
      }

    case 'SHOW_ERROR':
      return {
        ...state,
        currentView: 'error',
        error: action.payload.error
      }

    case 'RESET':
      return {
        ...state,
        currentView: 'upload',
        result: null,
        error: null,
        processingState: {
          steps: [],
          currentStep: 0,
          totalSteps: 0,
          startTime: 0
        }
      }

    case 'RETRY':
      return {
        ...state,
        currentView: 'upload',
        error: null
      }

    case 'SET_DRAG_STATE':
      return {
        ...state,
        uploadState: {
          ...state.uploadState,
          isDragOver: action.payload.isDragOver
        }
      }

    case 'SET_UPLOAD_ERROR':
      return {
        ...state,
        uploadState: {
          ...state.uploadState,
          error: action.payload.error
        }
      }

    default:
      return state
  }
}

/**
 * Validate state transitions
 */
export function isValidTransition(from: ViewState, to: ViewState): boolean {
  const validTransitions: Record<ViewState, ViewState[]> = {
    upload: ['processing'],
    processing: ['result', 'error'],
    result: ['upload'],
    error: ['upload']
  }

  return validTransitions[from]?.includes(to) ?? false
}

/**
 * Get next allowed states from current state
 */
export function getAllowedTransitions(currentState: ViewState): ViewState[] {
  const transitions: Record<ViewState, ViewState[]> = {
    upload: ['processing'],
    processing: ['result', 'error'],
    result: ['upload'],
    error: ['upload']
  }

  return transitions[currentState] ?? []
}

/**
 * Calculate processing progress percentage
 */
export function calculateProgress(pipeline: ProcessingPipeline): number {
  if (pipeline.totalSteps === 0) return 0

  const completedSteps = pipeline.steps.filter(step => step.status === 'completed').length
  return Math.round((completedSteps / pipeline.totalSteps) * 100)
}

/**
 * Get current processing step name
 */
export function getCurrentStepName(pipeline: ProcessingPipeline): string {
  const currentStep = pipeline.steps[pipeline.currentStep]
  if (!currentStep) return 'Completado'

  const stepNames: Record<string, string> = {
    [ProcessingSteps.IMAGE_VALIDATION]: 'Validando imagen',
    [ProcessingSteps.AI_EXTRACTION]: 'Extrayendo datos',
    [ProcessingSteps.DATA_VALIDATION]: 'Validando datos',
    [ProcessingSteps.UNIT_NORMALIZATION]: 'Normalizando unidades',
    [ProcessingSteps.PRICE_CALCULATION]: 'Calculando precio unitario'
  }

  return stepNames[currentStep.name] ?? currentStep.name
}

/**
 * Estimate remaining processing time
 */
export function estimateRemainingTime(pipeline: ProcessingPipeline): number {
  const elapsed = Date.now() - pipeline.startTime
  const completedSteps = pipeline.steps.filter(step => step.status === 'completed').length
  
  if (completedSteps === 0) return 5000 // Default 5 seconds
  
  const avgTimePerStep = elapsed / completedSteps
  const remainingSteps = pipeline.totalSteps - completedSteps
  
  return Math.round(avgTimePerStep * remainingSteps)
}

/**
 * Check if processing is complete
 */
export function isProcessingComplete(pipeline: ProcessingPipeline): boolean {
  return pipeline.steps.every(step => step.status === 'completed')
}

/**
 * Check if processing has errors
 */
export function hasProcessingErrors(pipeline: ProcessingPipeline): boolean {
  return pipeline.steps.some(step => step.status === 'error')
}

/**
 * Get processing errors
 */
export function getProcessingErrors(pipeline: ProcessingPipeline): string[] {
  return pipeline.steps
    .filter(step => step.status === 'error' && step.error)
    .map(step => step.error!)
}