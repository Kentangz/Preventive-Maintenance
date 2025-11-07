import { cn } from '../../utils/cn'
import { Skeleton } from './Skeleton'

const ButtonLoader = ({ labelClassName = 'w-16', className = '' }) => {
  return (
    <div className={cn('flex w-full items-center justify-center gap-2', className)}>
      <Skeleton className="h-4 w-4 rounded-full" />
      <Skeleton className={cn('h-4 rounded-md', labelClassName)} />
    </div>
  )
}

export { ButtonLoader }
export default ButtonLoader

