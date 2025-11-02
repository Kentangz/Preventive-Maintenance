import { X } from 'lucide-react'
import Button from './Button'

const AlertDialog = ({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  confirmText = 'Ya', 
  cancelText = 'Batal',
  onConfirm,
  variant = 'default' // 'default' or 'destructive'
}) => {
  if (!open) return null

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      {/* Dialog */}
      <div className="relative z-50 w-full max-w-lg mx-4 bg-card border rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        {description && (
          <div className="p-6">
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AlertDialog
export { AlertDialog }

