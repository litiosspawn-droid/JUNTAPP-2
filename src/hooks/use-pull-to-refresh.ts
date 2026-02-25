'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

export interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  threshold?: number // Distancia en px para activar el refresh (default: 100)
  enabled?: boolean // Habilitar/deshabilitar el pull-to-refresh
}

/**
 * Hook para implementar pull-to-refresh en dispositivos móviles
 * 
 * @example
 * const { isRefreshing, pullDistance } = usePullToRefresh({
 *   onRefresh: async () => {
 *     await refetch()
 *   },
 *   threshold: 120,
 *   enabled: isMobile
 * })
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 100,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [hasTriggered, setHasTriggered] = useState(false)
  
  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || isRefreshing) return
    
    // Solo activar si estamos en el top de la página
    if (window.scrollY > 0) return
    
    startY.current = e.touches[0].clientY
    setPullDistance(0)
    setHasTriggered(false)
  }, [enabled, isRefreshing])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || isRefreshing || startY.current === 0) return
    
    // Solo activar si estamos en el top de la página
    if (window.scrollY > 0) return
    
    currentY.current = e.touches[0].clientY
    const diff = currentY.current - startY.current
    
    // Resistencia elástica (cada vez más difícil de bajar)
    if (diff > 0) {
      const resistance = Math.min(diff / 300, 0.8) // Máximo 80% de resistencia
      const adjustedDiff = diff * (1 - resistance)
      setPullDistance(Math.min(adjustedDiff, threshold * 1.5)) // Límite visual
    }
    
    // Marcar como activado si superamos el threshold
    if (diff >= threshold && !hasTriggered) {
      setHasTriggered(true)
      
      // Feedback háptico si está disponible
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }
  }, [enabled, isRefreshing, hasTriggered, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || isRefreshing || startY.current === 0) return
    
    if (hasTriggered && pullDistance >= threshold) {
      setIsRefreshing(true)
      
      try {
        await onRefresh()
      } catch (error) {
        console.error('Pull-to-refresh error:', error)
      } finally {
        setIsRefreshing(false)
      }
    }
    
    // Reset
    setPullDistance(0)
    startY.current = 0
    currentY.current = 0
    setHasTriggered(false)
  }, [enabled, isRefreshing, hasTriggered, pullDistance, threshold, onRefresh])

  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current || document

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd])

  // Prevenir scroll nativo cuando estamos haciendo pull-to-refresh
  useEffect(() => {
    if (!enabled || pullDistance === 0) return

    const preventScroll = (e: TouchEvent) => {
      if (pullDistance > 0 && window.scrollY === 0) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchmove', preventScroll, { passive: false })
    return () => document.removeEventListener('touchmove', preventScroll)
  }, [enabled, pullDistance])

  return {
    isRefreshing,
    pullDistance,
    hasTriggered,
    containerRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
