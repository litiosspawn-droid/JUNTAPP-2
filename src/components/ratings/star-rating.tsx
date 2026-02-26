'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  allowHalf?: boolean
}

/**
 * Componente de calificación con estrellas
 */
export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  allowHalf = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const handleClick = (value: number) => {
    if (readonly || !onRatingChange) return
    onRatingChange(value)
  }

  const handleMouseEnter = (value: number) => {
    if (readonly) return
    setHoverRating(value)
  }

  const handleMouseLeave = () => {
    if (readonly) return
    setHoverRating(0)
  }

  const displayRating = hoverRating || rating

  return (
    <div className="flex gap-1" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating
        const isHalf = allowHalf && star === Math.ceil(displayRating) && displayRating % 1 !== 0

        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            className={cn(
              'transition-colors',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

/**
 * Componente para mostrar resumen de calificaciones
 */
interface RatingSummaryProps {
  averageRating: number
  totalRatings: number
  ratingDistribution?: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  size?: 'sm' | 'md' | 'lg'
}

export function RatingSummary({
  averageRating,
  totalRatings,
  ratingDistribution,
  size = 'md',
}: RatingSummaryProps) {
  const roundedRating = Math.round(averageRating * 10) / 10

  return (
    <div className="flex items-center gap-4">
      {/* Rating promedio */}
      <div className="text-center">
        <div className={cn(
          'font-bold',
          size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-xl'
        )}>
          {roundedRating.toFixed(1)}
        </div>
        <StarRating rating={Math.round(averageRating)} readonly size={size} />
        <div className="text-sm text-muted-foreground mt-1">
          {totalRatings} {totalRatings === 1 ? 'calificación' : 'calificaciones'}
        </div>
      </div>

      {/* Distribución */}
      {ratingDistribution && (
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingDistribution[stars as keyof typeof ratingDistribution]
            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0

            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm w-8">{stars}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Badge de calificación
 */
interface RatingBadgeProps {
  rating: number
  size?: 'sm' | 'md'
}

export function RatingBadge({ rating, size = 'md' }: RatingBadgeProps) {
  const getColor = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-700'
    if (rating >= 3.5) return 'bg-yellow-100 text-yellow-700'
    if (rating >= 2.5) return 'bg-orange-100 text-orange-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        getColor(rating),
        size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'
      )}
    >
      <Star className={cn(size === 'lg' ? 'w-4 h-4' : 'w-3 h-3')} fill="currentColor" />
      {rating.toFixed(1)}
    </span>
  )
}
