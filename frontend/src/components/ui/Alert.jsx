import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '../../utils/cn'

const Alert = ({ 
  variant = 'default', // 'default' | 'success' | 'error' | 'warning' | 'info'
  title,
  message,
  onClose,
  className
}) => {
  const variants = {
    success: {
      container: 'bg-gradient-to-r from-green-50 via-green-100 to-green-50 border-green-400 text-green-800',
      icon: 'text-green-600',
      title: 'text-green-800',
      message: 'text-green-700',
      iconComponent: CheckCircle
    },
    error: {
      container: 'bg-destructive/10 border-destructive/30 text-destructive',
      icon: 'text-destructive',
      title: 'text-destructive',
      message: 'text-destructive/90',
      iconComponent: XCircle
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-400 text-yellow-800',
      icon: 'text-yellow-600',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      iconComponent: AlertTriangle
    },
    info: {
      container: 'bg-blue-50 border-blue-400 text-blue-800',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      message: 'text-blue-700',
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

  return (
    <div 
      className={cn(
        'p-4 text-sm border-2 rounded-lg shadow-lg flex items-start gap-3',
        config.container,
        className
      )}
    >
      <Icon className={cn('h-6 w-6 flex-shrink-0 mt-0.5', config.icon)} />
      <div className="flex-1">
        {title && (
          <p className={cn('font-bold text-base mb-1', config.title)}>
            {variant === 'success' && '✓ '}
            {title}
          </p>
        )}
        <p className={cn('font-medium', config.message)}>
          {message}
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={cn('flex-shrink-0 hover:opacity-70 transition-opacity', config.icon)}
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

export default Alert
export { Alert }

