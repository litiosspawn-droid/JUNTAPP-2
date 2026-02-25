'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

// Re-exportar el hook
export { useVirtualScroll } from '@/hooks/use-virtual-scroll'
export type { UseVirtualScrollOptions, UseVirtualScrollReturn } from '@/hooks/use-virtual-scroll'

// Componente wrapper para facilitar el uso
export interface VirtualListProps<T> {
  items: T[]
  itemHeight?: number
  overscan?: number
  enabled?: boolean
  className?: string
  style?: React.CSSProperties
  renderItem: (item: T, index: number) => React.ReactNode
  itemKey?: (item: T, index: number) => string | number
  placeholder?: React.ReactNode
}

export function VirtualList<T>({
  items,
  itemHeight = 200,
  overscan = 5,
  enabled = true,
  className,
  style,
  renderItem,
  itemKey,
  placeholder,
}: VirtualListProps<T>) {
  const { useVirtualScroll } = require('@/hooks/use-virtual-scroll') as typeof import('@/hooks/use-virtual-scroll')
  
  const {
    visibleItems,
    startIndex,
    totalHeight,
    containerRef,
    isLoading,
  } = useVirtualScroll({
    items,
    itemHeight,
    overscan,
    enabled: enabled && items.length > 20,
  })

  if (isLoading) {
    return placeholder || (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!enabled || items.length <= 20) {
    return (
      <div className={className} style={style}>
        {items.map((item, index) => (
          <div key={itemKey?.(item, index) || index}>{renderItem(item, index)}</div>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{
        ...style,
        contain: 'strict',
      }}
      role="list"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: startIndex * itemHeight,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={itemKey?.(item, startIndex + index) || startIndex + index}
              style={{ height: itemHeight }}
              role="listitem"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Grid virtual para layouts de cards
export interface VirtualGridProps<T> {
  items: T[]
  itemHeight?: number
  columns?: number
  gap?: number
  overscan?: number
  enabled?: boolean
  className?: string
  style?: React.CSSProperties
  renderItem: (item: T, index: number) => React.ReactNode
  itemKey?: (item: T, index: number) => string | number
  placeholder?: React.ReactNode
}

export function VirtualGrid<T>({
  items,
  itemHeight = 250,
  columns = 4,
  gap = 24,
  overscan = 3,
  enabled = true,
  className,
  style,
  renderItem,
  itemKey,
  placeholder,
}: VirtualGridProps<T>) {
  const [visibleItems, setVisibleItems] = useState<T[]>([])
  const [startIndex, setStartIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number | null>(null)

  const rowHeight = itemHeight + gap
  const totalRows = Math.ceil(items.length / columns)

  const calculateVisibleItems = useCallback(() => {
    if (!containerRef.current || !enabled) {
      setVisibleItems(items)
      setStartIndex(0)
      return
    }

    const container = containerRef.current
    const scrollTop = container.scrollTop
    const viewportHeight = container.clientHeight

    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const endRow = Math.min(
      totalRows,
      Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan
    )

    const start = startRow * columns
    const end = Math.min(items.length, endRow * columns)

    setStartIndex(start)
    setVisibleItems(items.slice(start, end))
  }, [items, columns, rowHeight, overscan, totalRows, enabled])

  const handleScroll = useCallback(() => {
    if (rafId.current) return
    rafId.current = requestAnimationFrame(() => {
      calculateVisibleItems()
      rafId.current = null
    })
  }, [calculateVisibleItems])

  useEffect(() => {
    if (!enabled || items.length === 0) {
      setVisibleItems(items)
      setStartIndex(0)
      setIsLoading(false)
      return
    }

    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    calculateVisibleItems()
    setIsLoading(false)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [enabled, items.length, handleScroll, calculateVisibleItems])

  useEffect(() => {
    if (enabled) {
      calculateVisibleItems()
    }
  }, [items, enabled, calculateVisibleItems])

  const totalHeight = enabled ? totalRows * rowHeight : 'auto'

  if (isLoading) {
    return placeholder || (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!enabled || items.length <= 20) {
    return (
      <div
        className={cn('w-full max-w-full overflow-x-hidden', className)}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap,
          ...style,
        }}
      >
        {items.map((item, index) => (
          <div key={itemKey?.(item, index) || index} className="min-w-0">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto overflow-x-hidden', className)}
      style={{
        ...style,
        contain: 'strict',
      }}
      role="list"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: Math.floor(startIndex / columns) * rowHeight,
            left: 0,
            right: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={itemKey?.(item, startIndex + index) || startIndex + index}
              className="min-w-0"
              role="listitem"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
