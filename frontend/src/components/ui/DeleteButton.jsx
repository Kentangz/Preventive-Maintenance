import { Trash2 } from 'lucide-react'
import { Button } from './Button'
import ButtonLoader from './ButtonLoader'
import { cn } from '../../utils/cn'

const DeleteButton = ({ 
  onClick, 
  loading = false, 
  disabled = false, 
  className = '',
  title = 'Delete',
  ...props 
}) => {
  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('bg-red-600 hover:bg-red-700', className)}
      title={title}
      {...props}
    >
      {loading ? (
        <ButtonLoader labelClassName="w-auto" className="w-auto" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  )
}

export default DeleteButton
export { DeleteButton }
