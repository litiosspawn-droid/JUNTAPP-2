'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  threshold?: number // Distancia en px para activar el refresh (default: 100)
  enabled?: boolean // Habilitar/deshabilitar el pull-to-refresh
}

/**
 * Hook para implementar pull-to-refresh en dispositivos móviles
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

// Componente wrapper para facilitar el uso
export interface PullToRefreshContainerProps {
  children: React.ReactNode
  onRefresh: () => Promise<void> | void
  enabled?: boolean
  threshold?: number
  className?: string
}

export function PullToRefreshContainer({
  children,
  onRefresh,
  enabled = true,
  threshold = 100,
  className,
}: PullToRefreshContainerProps) {
  const {
    isRefreshing,
    pullDistance,
    containerRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = usePullToRefresh({ onRefresh, threshold, enabled })

  return (
    <div
      ref={containerRef}
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
        transition: pullDistance > 0 && !isRefreshing ? 'transform 0.2s ease-out' : undefined,
      }}
    >
      {/* Indicador de refresh */}
      {pullDistance > 0 && (
        <div
          className="fixed left-0 right-0 flex justify-center pointer-events-none"
          style={{
            top: Math.max(0, pullDistance - 40),
            opacity: Math.min(1, pullDistance / 50),
            transition: 'opacity 0.2s ease-out',
            zIndex: 50,
          }}
        >
          <div className="bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
            {isRefreshing ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : hasTriggered ? (
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            )}
          </div>
        </div>
      )}
      
      {children}
      
      {/* Overlay de refresh */}
      {isRefreshing && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-start justify-center pt-4 pointer-events-none">
          <div className="bg-background rounded-full p-3 shadow-lg">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </div>
      )}
    </div>
  )
}
