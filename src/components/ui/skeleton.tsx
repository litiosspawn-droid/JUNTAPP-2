import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const skeletonVariants = cva(
  'bg-accent/50 animate-pulse rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-accent/50',
        shimmer: 'bg-gradient-to-r from-accent/50 via-accent/70 to-accent/50 bg-[length:200%_100%] animate-shimmer',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface SkeletonProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant, className }))}
      {...props}
    />
  )
}

// Skeleton presets for common use cases
function SkeletonAvatar({ className, size = 'default', ...props }: SkeletonProps & { size?: 'sm' | 'default' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8 rounded-full',
    default: 'h-10 w-10 rounded-full',
    lg: 'h-16 w-16 rounded-full',
  }

  return (
    <Skeleton
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  )
}

function SkeletonText({
  className,
  lines = 3,
  gap = 'gap-2',
  ...props
}: SkeletonProps & { lines?: number; gap?: string }) {
  return (
    <div className={cn('flex flex-col', gap, className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            i === lines - 1 ? 'w-3/4' : 'w-full',
            i === 0 ? 'h-4' : 'h-3',
          )}
        />
      ))}
    </div>
  )
}

function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-lg border bg-card', className)} {...props}>
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

function SkeletonList({ className, count = 4, ...props }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <SkeletonAvatar size="default" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SkeletonTable({ className, rows = 5, columns = 4, ...props }: SkeletonProps & { rows?: number; columns?: number }) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {/* Header */}
      <div className="flex gap-4 border-b pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export {
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  skeletonVariants,
}
export type { SkeletonProps }
