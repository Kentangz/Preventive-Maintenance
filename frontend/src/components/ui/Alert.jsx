import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '../../utils/cn'

const Alert = ({ 
  variant = 'default', // 'default' | 'success' | 'error' | 'warning' | 'info'
  title,
  message,
  onClose,
  className,
  duration = 3000
}) => {
  const variants = {
    success: {
      container: 'bg-gradient-to-r from-green-50 via-green-100 to-green-50 border-green-400 text-green-800 dark:from-emerald-500/10 dark:via-emerald-500/15 dark:to-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-200',
      icon: 'text-green-600 dark:text-emerald-300',
      title: 'text-green-800 dark:text-emerald-100',
      message: 'text-green-700 dark:text-emerald-200/90',
      iconComponent: CheckCircle
    },
    error: {
      container: 'bg-destructive/10 border-destructive/30 text-destructive dark:bg-destructive/20 dark:border-destructive/40 dark:text-destructive-foreground',
      icon: 'text-destructive dark:text-destructive-foreground',
      title: 'text-destructive dark:text-destructive-foreground',
      message: 'text-destructive/90 dark:text-destructive-foreground/80',
      iconComponent: XCircle
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-500 text-yellow-800 dark:text-yellow-200',
      icon: 'text-yellow-600 dark:text-yellow-400',
      title: 'text-yellow-800 dark:text-yellow-200',
      message: 'text-yellow-700 dark:text-yellow-300',
      iconComponent: AlertTriangle
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500 text-blue-800 dark:text-blue-200',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-800 dark:text-blue-200',
      message: 'text-blue-700 dark:text-blue-300',
      iconComponent: Info
    },
    default: {
      container: 'bg-background border-border text-foreground',
      icon: 'text-muted-foreground',
      title: 'text-foreground',
      message: 'text-muted-foreground',
      iconComponent: Info
    }
  }

  const config = variants[variant] || variants.default
  const Icon = config.iconComponent

  const [isVisible, setIsVisible] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)

  const effectKey = useMemo(() => `${variant}-${title ?? ''}-${message ?? ''}`, [variant, title, message])

  useEffect(() => {
    setIsDismissed(false)
    setIsVisible(true)

    if (!duration) return

    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [effectKey, duration])

  useEffect(() => {
    if (isVisible) return

    const timer = setTimeout(() => {
      setIsDismissed(true)
      onClose?.()
    }, 200)

    return () => clearTimeout(timer)
  }, [isVisible, onClose])

  if (isDismissed && !onClose) return null

  return (
    <div className="pointer-events-none fixed top-6 right-6 z-50 flex w-full max-w-sm justify-end">
      <div
        className={cn(
          'pointer-events-auto flex items-start gap-3 rounded-lg border-2 p-4 text-sm shadow-lg transition-all duration-200 ease-out',
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
          config.container,
          className
        )}
      >
        <Icon className={cn('mt-0.5 h-6 w-6 flex-shrink-0', config.icon)} />
        <div className="flex-1">
          {title && (
            <p className={cn('mb-1 text-base font-bold', config.title)}>
              {variant === 'success' && '✓ '}
              {title}
            </p>
          )}
          <p className={cn('font-medium', config.message)}>
            {message}
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className={cn('flex-shrink-0 transition-opacity hover:opacity-70', config.icon)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default Alert
export { Alert }

