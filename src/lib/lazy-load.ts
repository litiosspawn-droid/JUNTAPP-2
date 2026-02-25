'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Lazy load components con loading skeleton
 * 
 * @example
 * const LazyMap = lazyWithSkeleton(() => import('@/components/map-view'))
 */
export function lazyWithSkeleton<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    ssr?: boolean
    loadingHeight?: string
  }
) {
  return dynamic(
    {
      loader: importFunc,
      loading: () => (
        <Card className="w-full h-full overflow-hidden">
          <CardContent className="p-0">
            <Skeleton 
              className="w-full h-full" 
              style={{ height: options?.loadingHeight || '400px' }} 
            />
          </CardContent>
        </Card>
      ),
      ssr: options?.ssr ?? false,
    }
  )
}

// Lazy load para páginas completas
export function lazyPage<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    ssr?: boolean
    fullScreen?: boolean
  }
) {
  return dynamic(
    {
      loader: importFunc,
      loading: () => {
        if (options?.fullScreen) {
          return (
            <div className="flex min-h-screen items-center justify-center">
              <div className="text-center space-y-4">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-4 w-48 mx-auto" />
              </div>
            </div>
          )
        }
        return (
          <div className="flex items-center justify-center p-8">
            <Skeleton className="h-8 w-8 rounded-full animate-spin" />
          </div>
        )
      },
      ssr: options?.ssr ?? false,
    }
  )
}

// Export dynamic de Next.js directamente para casos custom
export { dynamic }
