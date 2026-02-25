'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseVirtualScrollOptions<T> {
  items: T[]
  itemHeight?: number // Altura fija de cada item en px
  overscan?: number // Items extra a renderizar arriba/abajo
  enabled?: boolean // Habilitar/deshabilitar virtual scrolling
}

interface UseVirtualScrollReturn<T> {
  visibleItems: T[]
  startIndex: number
  endIndex: number
  totalHeight: number
  containerRef: React.RefObject<HTMLDivElement>
  isLoading: boolean
}

/**
 * Hook para virtual scrolling de listas largas
 * Mejora performance renderizando solo items visibles
 * 
 * @example
 * const { visibleItems, totalHeight, containerRef } = useVirtualScroll({
 *   items: events,
 *   itemHeight: 200,
 *   overscan: 5,
 *   enabled: events.length > 50
 * })
 */
export function useVirtualScroll<T>({
  items,
  itemHeight = 200,
  overscan = 5,
  enabled = true,
}: UseVirtualScrollOptions<T>): UseVirtualScrollReturn<T> {
  const [visibleItems, setVisibleItems] = useState<T[]>([])
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number | null>(null)

  const calculateVisibleItems = useCallback(() => {
    if (!containerRef.current || !enabled) {
      setVisibleItems(items)
      setStartIndex(0)
      setEndIndex(items.length)
      return
    }

    const container = containerRef.current
    const scrollTop = container.scrollTop
    const viewportHeight = container.clientHeight

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan
    )

    setStartIndex(start)
    setEndIndex(end)
    setVisibleItems(items.slice(start, end))
  }, [items, itemHeight, overscan, enabled])

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
      setEndIndex(items.length)
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

  const totalHeight = enabled ? items.length * itemHeight : 0

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    containerRef,
    isLoading,
  }
}

export type { UseVirtualScrollOptions, UseVirtualScrollReturn }
