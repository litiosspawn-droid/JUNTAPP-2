"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StarRating } from '@/components/ui/star-rating'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, MessageSquare, Star } from 'lucide-react'
import { getEventRatings, getEventRatingStats, type EventRating, type EventRatingStats } from '@/lib/firebase/ratings'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface EventRatingsDisplayProps {
  eventId: string
  className?: string
}

export function EventRatingsDisplay({ eventId, className }: EventRatingsDisplayProps) {
  const [stats, setStats] = useState<EventRatingStats | null>(null)
  const [ratings, setRatings] = useState<EventRating[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadRatings = async () => {
      try {
        setLoading(true)
        const [statsData, ratingsData] = await Promise.all([
          getEventRatingStats(eventId),
          getEventRatings(eventId, 20) // Load first 20 reviews
        ])

        setStats(statsData)
        setRatings(ratingsData)
      } catch (error) {
        console.error('Error loading ratings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRatings()
  }, [eventId])

  const toggleReviewExpansion = (ratingId: string) => {
    const newExpanded = new Set(expandedReviews)
    if (newExpanded.has(ratingId)) {
      newExpanded.delete(ratingId)
    } else {
      newExpanded.add(ratingId)
    }
    setExpandedReviews(newExpanded)
  }

  const displayedRatings = showAllReviews ? ratings : ratings.slice(0, 5)

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-muted rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.totalRatings === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Sin valoraciones aún</h3>
          <p className="text-muted-foreground">
            Sé el primero en calificar este evento
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Rating Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Valoraciones ({stats.totalRatings})
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {stats.averageRating}
              </div>
              <StarRating rating={Math.round(stats.averageRating)} readonly size="lg" showValue={false} />
              <p className="text-sm text-muted-foreground mt-2">
                Basado en {stats.totalRatings} valoración{stats.totalRatings !== 1 ? 'es' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3">{star}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <Progress
                    value={(stats.ratingDistribution[star] / stats.totalRatings) * 100}
                    className="flex-1 h-2"
                  />
                  <span className="w-6 text-right text-muted-foreground">
                    {stats.ratingDistribution[star]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reseñas
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {displayedRatings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay reseñas escritas aún
            </p>
          ) : (
            <>
              {displayedRatings.map((rating) => (
                <div key={rating.id} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={rating.userPhotoURL} alt={rating.userName} />
                      <AvatarFallback>
                        {rating.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{rating.userName}</span>
                        <StarRating rating={rating.rating} readonly size="sm" />
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">
                        {formatDistanceToNow(rating.createdAt.toDate(), {
                          addSuffix: true,
                          locale: es
                        })}
                      </p>

                      {rating.review && (
                        <div className="text-sm">
                          {expandedReviews.has(rating.id!) && rating.review.length > 150 ? (
                            <div>
                              <p className="whitespace-pre-wrap">{rating.review}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleReviewExpansion(rating.id!)}
                                className="mt-2 p-0 h-auto text-xs text-muted-foreground hover:text-foreground"
                              >
                                <ChevronUp className="w-3 h-3 mr-1" />
                                Ver menos
                              </Button>
                            </div>
                          ) : rating.review.length > 150 ? (
                            <div>
                              <p className="whitespace-pre-wrap">
                                {rating.review.substring(0, 150)}...
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleReviewExpansion(rating.id!)}
                                className="mt-2 p-0 h-auto text-xs text-muted-foreground hover:text-foreground"
                              >
                                <ChevronDown className="w-3 h-3 mr-1" />
                                Ver más
                              </Button>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{rating.review}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Show More/Less Button */}
              {ratings.length > 5 && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="gap-2"
                  >
                    {showAllReviews ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Ver menos reseñas
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Ver todas las reseñas ({ratings.length})
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
