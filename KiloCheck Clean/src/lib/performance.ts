// Performance optimization utilities for KiloCheck

import { useCallback, useMemo, useRef } from 'react'

/**
 * Debounce hook for performance optimization
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    }) as T,
    [callback, delay]
  )
}

/**
 * Throttle hook for performance optimization
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0)

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now
        callback(...args)
      }
    }) as T,
    [callback, delay]
  )
}

/**
 * Memoized image processing utilities
 */
export const ImageUtils = {
  /**
   * Compress image for better performance
   */
  compressImage: (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        // Draw compressed image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file) // Fallback to original
            }
          },
          file.type,
          quality
        )
      }
      
      img.src = URL.createObjectURL(file)
    })
  },

  /**
   * Validate image dimensions and size
   */
  validateImage: (file: File): Promise<{ valid: boolean; reason?: string }> => {
    return new Promise((resolve) => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        resolve({ valid: false, reason: 'File too large (max 10MB)' })
        return
      }

      const img = new Image()
      img.onload = () => {
        // Check dimensions (min 100x100, max 4000x4000)
        if (img.width < 100 || img.height < 100) {
          resolve({ valid: false, reason: 'Image too small (min 100x100px)' })
        } else if (img.width > 4000 || img.height > 4000) {
          resolve({ valid: false, reason: 'Image too large (max 4000x4000px)' })
        } else {
          resolve({ valid: true })
        }
        
        URL.revokeObjectURL(img.src)
      }
      
      img.onerror = () => {
        resolve({ valid: false, reason: 'Invalid image file' })
        URL.revokeObjectURL(img.src)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }
}

/**
 * Memory management utilities
 */
export const MemoryUtils = {
  /**
   * Clean up object URLs to prevent memory leaks
   */
  cleanupObjectURL: (url: string) => {
    try {
      URL.revokeObjectURL(url)
    } catch (error) {
      console.warn('Failed to cleanup object URL:', error)
    }
  },

  /**
   * Monitor memory usage (development only)
   */
  logMemoryUsage: () => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const memory = (performance as any).memory
      console.log('Memory usage:', {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
      })
    }
  }
}

/**
 * Animation performance utilities
 */
export const AnimationUtils = {
  /**
   * Reduced motion preferences
   */
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  /**
   * Get optimized animation config based on device capabilities
   */
  getAnimationConfig: () => {
    const reducedMotion = AnimationUtils.prefersReducedMotion()
    const isLowEndDevice = navigator.hardwareConcurrency <= 2
    
    return {
      duration: reducedMotion ? 0 : isLowEndDevice ? 0.2 : 0.3,
      ease: 'easeOut',
      stagger: reducedMotion ? 0 : 0.1
    }
  }
}

/**
 * Bundle size optimization utilities
 */
export const BundleUtils = {
  /**
   * Lazy load heavy components
   */
  createLazyComponent: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
  ) => {
    const LazyComponent = React.lazy(importFn)
    
    return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
      <React.Suspense fallback={<div className="animate-pulse bg-slate-200 rounded h-32" />}>
        <LazyComponent {...props} ref={ref} />
      </React.Suspense>
    ))
  }
}

// React import for lazy loading
import React from 'react'