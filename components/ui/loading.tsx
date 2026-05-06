import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: {
    container: 'h-4 w-4',
    text: 'text-xs',
  },
  md: {
    container: 'h-8 w-8',
    text: 'text-sm',
  },
  lg: {
    container: 'h-12 w-12',
    text: 'text-base',
  },
}

export function Loading({ size = 'md', className, text }: LoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <SpinnerLoading size={size} />
      {text && (
        <p className={cn('text-muted-foreground animate-pulse', sizeClasses[size].text)}>
          {text}
        </p>
      )}
    </div>
  )
}

function SpinnerLoading({ size }: { size: LoadingProps['size'] }) {
  return (
    <div className={cn('relative', sizeClasses[size!].container)}>
      <div className="absolute inset-0 rounded-full border-2 border-muted" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
    </div>
  )
}

// Convenience components for common use cases
export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loading size="lg" text={text} />
    </div>
  )
}

export function InlineLoading({ text }: { text?: string }) {
  return <Loading size="sm" text={text} />
}

export function CardLoading() {
  return (
    <div className="space-y-3 w-full max-w-xs">
      <div className="animate-pulse rounded-md bg-muted/60 h-6 w-36" />
      <div className="animate-pulse rounded-md bg-muted/60 h-6 w-36 w-[70%]" />
      <div className="animate-pulse rounded-md bg-muted/60 h-6 w-36 w-[85%]" />
    </div>
  )
}

export function ButtonLoading({ size = 'sm' }: { size?: LoadingProps['size'] }) {
  return <Loading size={size} />
}
