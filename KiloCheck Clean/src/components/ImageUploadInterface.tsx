'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InteractiveButton, InteractiveCard, useDeviceType } from './FeedbackSystem'
import { ImageUploadProps, UploadState } from '@/types'
import { validateAndSanitizeImage, validateProcessingEnvironment } from '@/lib/secureImageProcessing'

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB (reduced for security)

export default function ImageUploadInterface({
  onImageSelect,
  isProcessing,
  supportedFormats = SUPPORTED_FORMATS
}: ImageUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isDragOver: false,
    isUploading: false,
    error: null
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Use enhanced device detection
  const deviceType = useDeviceType()
  const isMobile = deviceType === 'mobile'
  const isDesktop = deviceType === 'desktop'
  
  const hasCamera = typeof navigator !== 'undefined' && 
    'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices

  // Validate processing environment on component mount
  const processingEnv = validateProcessingEnvironment()
  
  const validateFile = useCallback((file: File): string | null => {
    if (!supportedFormats.includes(file.type)) {
      return `Formato no soportado. Usa ${supportedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `La imagen es demasiado grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB.`
    }
    
    return null
  }, [supportedFormats])

  const handleFileSelect = useCallback(async (file: File) => {
    const error = validateFile(file)
    
    if (error) {
      setUploadState(prev => ({ ...prev, error }))
      return
    }

    setUploadState(prev => ({ ...prev, error: null, isUploading: true }))
    
    try {
      // Convert file to base64 for secure validation
      const base64Data = await fileToBase64(file)
      
      // Validate and sanitize image data
      const validation = validateAndSanitizeImage(base64Data, file.type)
      
      if (!validation.isValid) {
        setUploadState(prev => ({ 
          ...prev, 
          error: validation.error || 'Error de validación de imagen',
          isUploading: false 
        }))
        return
      }

      // Log security event
      console.log('[SECURE_UPLOAD] Image validated successfully', {
        size: validation.metadata.size,
        type: validation.metadata.type
      })

      onImageSelect(file)
    } catch (err) {
      setUploadState(prev => ({ 
        ...prev, 
        error: 'Error al procesar la imagen de forma segura',
        isUploading: false 
      }))
    }
  }, [validateFile, onImageSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setUploadState(prev => ({ ...prev, isDragOver: true }))
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setUploadState(prev => ({ ...prev, isDragOver: false }))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setUploadState(prev => ({ ...prev, isDragOver: false }))
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const openCamera = useCallback(() => {
    cameraInputRef.current?.click()
  }, [])

  // Enhanced keyboard navigation for desktop
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isDesktop) return
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openFileDialog()
    } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      if (hasCamera) openCamera()
    }
  }, [isDesktop, openFileDialog, openCamera, hasCamera])

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={supportedFormats.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept={supportedFormats.join(',')}
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Main upload area */}
      <InteractiveCard
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed text-center
          ${uploadState.isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-slate-300'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        hoverable={!isProcessing}
        ariaLabel={isDesktop ? "Área de carga de imágenes. Presiona Enter para seleccionar archivo o Ctrl+C para cámara" : "Área de carga de imágenes"}
        onDragOver={isDesktop ? handleDragOver : undefined}
        onDragLeave={isDesktop ? handleDragLeave : undefined}
        onDrop={isDesktop ? handleDrop : undefined}
        onKeyDown={isDesktop ? handleKeyDown : undefined}
        tabIndex={isDesktop ? 0 : -1}
        role={isDesktop ? "button" : undefined}
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
      >
        <AnimatePresence>
          {uploadState.isDragOver && isDesktop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-100 rounded-2xl flex items-center justify-center"
            >
              <p className="text-blue-600 font-medium">Suelta la imagen aquí</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Upload icon */}
          <div className="mb-3 sm:mb-4">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mx-auto text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-700 mb-2">
            Sube una foto de la etiqueta
          </h3>
          
          <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6">
            {isDesktop 
              ? 'Arrastra y suelta una imagen o haz clic para seleccionar'
              : 'Toca para seleccionar una imagen o usar la cámara'
            }
          </p>

          {/* Action buttons */}
          <div className="space-y-3 sm:space-y-4">
            <InteractiveButton
              onClick={(e) => {
                e?.stopPropagation()
                openFileDialog()
              }}
              variant="primary"
              size="lg"
              disabled={isProcessing}
              className="w-full"
              ariaLabel="Seleccionar archivo de imagen"
            >
              <span className="sm:hidden">📁 Seleccionar imagen</span>
              <span className="hidden sm:inline">Seleccionar archivo</span>
            </InteractiveButton>

            {(isMobile || hasCamera) && (
              <InteractiveButton
                onClick={(e) => {
                  e?.stopPropagation()
                  openCamera()
                }}
                variant="secondary"
                size="lg"
                disabled={isProcessing}
                className="w-full"
                ariaLabel="Usar cámara para tomar foto"
              >
                📷 <span className="sm:hidden">Tomar foto</span>
                <span className="hidden sm:inline">Usar cámara</span>
              </InteractiveButton>
            )}
          </div>

          <p className={`text-slate-400 mt-4 ${isMobile ? 'text-xs' : 'text-xs'}`}>
            Formatos soportados: JPEG, PNG, WebP (máx. 5MB)
            {!processingEnv.isSecure && (
              <span className="block text-yellow-600 mt-1">
                ⚠️ Entorno de procesamiento no completamente seguro
              </span>
            )}
          </p>
        </motion.div>
      </InteractiveCard>

      {/* Error message */}
      <AnimatePresence>
        {uploadState.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-sm text-red-600">{uploadState.error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Converts a File to base64 string securely
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Error reading file'))
    }
    
    reader.readAsDataURL(file)
  })
}