'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, useState, useEffect } from 'react'

// Device detection hook
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop' | 'tablet'>('desktop')
  
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const width = window.innerWidth
      
      if (isMobile && width < 768) {
        setDeviceType('mobile')
      } else if (width >= 768 && width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    
    return () => window.removeEventListener('resize', checkDevice)
  }, [])
  
  return deviceType
}

// Interactive Button with enhanced feedback
interface InteractiveButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  ariaLabel?: string
}

export function InteractiveButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ariaLabel
}: InteractiveButtonProps) {
  const deviceType = useDeviceType()
  const [isPressed, setIsPressed] = useState(false)
  
  const baseClasses = 'relative overflow-hidden font-medium rounded-xl transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 touch-optimized'
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-500 active:bg-slate-100',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-500 active:bg-slate-200'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]'
  }
  
  const shadowClasses = {
    primary: 'shadow-soft hover:shadow-medium',
    secondary: 'shadow-soft hover:shadow-medium',
    ghost: 'hover:shadow-soft'
  }
  
  const handleMouseDown = () => setIsPressed(true)
  const handleMouseUp = () => setIsPressed(false)
  const handleMouseLeave = () => setIsPressed(false)
  
  return (
    <motion.button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${shadowClasses[variant]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={disabled || loading ? undefined : onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      whileHover={deviceType === 'desktop' && !disabled && !loading ? { 
        scale: 1.02,
        y: -1
      } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Ripple effect for touch feedback */}
      <AnimatePresence>
        {isPressed && deviceType === 'mobile' && (
          <motion.div
            className="absolute inset-0 bg-white opacity-20 rounded-xl"
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
      
      {/* Shimmer effect for desktop hover */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <motion.div
          className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={deviceType === 'desktop' ? {
            left: ['100%', '100%', '-100%']
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'easeInOut'
          }}
        />
      </div>
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {children}
      </span>
    </motion.button>
  )
}

// Interactive Card with enhanced feedback
interface InteractiveCardProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'premium'
  hoverable?: boolean
  ariaLabel?: string
}

export function InteractiveCard({
  children,
  onClick,
  className = '',
  variant = 'default',
  hoverable = true,
  ariaLabel
}: InteractiveCardProps) {
  const deviceType = useDeviceType()
  
  const baseClasses = 'bg-white border border-slate-100 transition-all duration-300 ease-out'
  const variantClasses = {
    default: 'rounded-2xl shadow-soft p-6',
    premium: 'rounded-3xl shadow-premium p-8'
  }
  
  return (
    <motion.div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={deviceType === 'desktop' && hoverable ? {
        y: -4,
        scale: 1.02,
        boxShadow: variant === 'premium' 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' 
          : '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
    </motion.div>
  )
}

// Feedback Toast for user notifications
interface FeedbackToastProps {
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function FeedbackToast({
  message,
  type,
  isVisible,
  onClose,
  duration = 4000
}: FeedbackToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])
  
  const typeStyles = {
    success: 'bg-success-50 border-success-200 text-success-700',
    warning: 'bg-warning-50 border-warning-200 text-warning-700',
    error: 'bg-error-50 border-error-200 text-error-700',
    info: 'bg-primary-50 border-primary-200 text-primary-700'
  }
  
  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✕',
    info: 'ℹ'
  }
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`
            fixed top-4 right-4 z-50 max-w-sm p-4 rounded-xl border shadow-large
            ${typeStyles[type]}
          `}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{icons[type]}</span>
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
              onClick={onClose}
              className="text-current opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Cerrar notificación"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Loading state with enhanced feedback
interface LoadingFeedbackProps {
  isLoading: boolean
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingFeedback({
  isLoading,
  message = 'Cargando...',
  size = 'md'
}: LoadingFeedbackProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }
  
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-3"
        >
          <motion.div
            className={`${sizeClasses[size]} border-2 border-primary-200 border-t-primary-600 rounded-full`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span className="text-sm text-slate-600">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Input field with enhanced feedback
interface InteractiveInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number'
  disabled?: boolean
  error?: string
  success?: string
  className?: string
  ariaLabel?: string
}

export function InteractiveInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error,
  success,
  className = '',
  ariaLabel
}: InteractiveInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  
  const baseClasses = 'w-full px-4 py-3 rounded-xl border transition-all duration-200 ease-out touch-optimized'
  const stateClasses = error 
    ? 'border-error-300 focus:border-error-500 focus:ring-error-500' 
    : success
    ? 'border-success-300 focus:border-success-500 focus:ring-success-500'
    : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500'
  
  return (
    <div className="relative">
      <motion.input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          ${baseClasses}
          ${stateClasses}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        whileFocus={{ scale: 1.01 }}
        aria-label={ariaLabel}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      />
      
      {/* Focus indicator */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute inset-0 rounded-xl ring-2 ring-primary-500 ring-offset-2 pointer-events-none"
          />
        )}
      </AnimatePresence>
      
      {/* Error/Success message */}
      <AnimatePresence>
        {(error || success) && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-2 text-sm ${
              error ? 'text-error-600' : 'text-success-600'
            }`}
          >
            {error || success}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}