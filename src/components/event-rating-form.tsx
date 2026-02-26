"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StarRating } from '@/components/ui/star-rating'
import { useAuth } from '@/contexts/AuthContext'
import { createOrUpdateRating, getUserRatingForEvent, type EventRating } from '@/lib/firebase/ratings'
import { Loader2, MessageSquare } from 'lucide-react'

interface EventRatingFormProps {
  eventId: string
  onRatingSubmitted?: (rating: EventRating) => void
  className?: string
}

export function EventRatingForm({ eventId, onRatingSubmitted, className }: EventRatingFormProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingRating, setExistingRating] = useState<EventRating | null>(null)
  const [isLoadingExisting, setIsLoadingExisting] = useState(true)

  // Cargar valoración existente del usuario
  useEffect(() => {
    const loadExistingRating = async () => {
      if (!user) {
        setIsLoadingExisting(false)
        return
      }

      try {
        const userRating = await getUserRatingForEvent(eventId, user.uid)
        if (userRating) {
          setExistingRating(userRating)
          setRating(userRating.rating)
          setReview(userRating.review || '')
        }
      } catch (error) {
        console.error('Error loading existing rating:', error)
      } finally {
        setIsLoadingExisting(false)
      }
    }

    loadExistingRating()
  }, [eventId, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert('Debes iniciar sesión para calificar eventos')
      return
    }

    if (rating === 0) {
      alert('Por favor selecciona una calificación')
      return
    }

    setIsSubmitting(true)

    try {
      const ratingData = {
        eventId,
        userId: user.uid,
        userName: user.displayName || user.email || 'Usuario anónimo',
        userPhotoURL: user.photoURL || undefined,
        rating,
        review: review.trim() || undefined,
      }

      const ratingId = await createOrUpdateRating(ratingData)

      const submittedRating: EventRating = {
        id: ratingId,
        ...ratingData,
        createdAt: existingRating?.createdAt || new Date() as any,
        updatedAt: new Date() as any,
      }

      onRatingSubmitted?.(submittedRating)

      if (existingRating) {
        alert('¡Tu valoración ha sido actualizada!')
      } else {
        alert('¡Gracias por tu valoración!')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Error al enviar la valoración. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Califica este evento</h3>
          <p className="text-muted-foreground mb-4">
            Inicia sesión para dejar tu opinión sobre este evento
          </p>
          <Button>Iniciar sesión</Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoadingExisting) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 w-6 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {existingRating ? 'Actualizar valoración' : 'Calificar evento'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Stars */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tu calificación *
            </label>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size="lg"
            />
          </div>

          {/* Review Text */}
          <div>
            <label htmlFor="review" className="text-sm font-medium mb-2 block">
              Tu opinión (opcional)
            </label>
            <Textarea
              id="review"
              placeholder="Comparte tu experiencia en este evento..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {review.length}/500 caracteres
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {existingRating ? 'Actualizar valoración' : 'Enviar valoración'}
          </Button>

          {existingRating && (
            <p className="text-xs text-muted-foreground text-center">
              Última actualización: {existingRating.updatedAt?.toDate?.()?.toLocaleDateString('es-ES')}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
