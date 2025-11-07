import { cn } from '../../utils/cn'

const Input = ({ 
  className = '', 
  type = 'text', 
  ...props 
}) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-sm file:font-medium file:text-secondary-foreground file:transition-colors hover:file:bg-secondary/80 dark:file:bg-secondary dark:file:text-secondary-foreground/90',
        className
      )}
      {...props}
    />
  )
}

export default Input
export { Input }
