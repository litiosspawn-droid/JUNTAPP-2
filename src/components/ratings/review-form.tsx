'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { StarRating } from './star-rating'
import { useUnifiedToast } from '@/hooks/use-unified-toast'

interface ReviewFormProps {
  eventId: string
  canRate: boolean
  hasRated: boolean
  onSubmit: (
    rating: number,
    comment: string,
    dimensions: { quality: number; organization: number; location: number },
    photos?: string[]
  ) => Promise<void>
  trigger?: React.ReactNode
}

/**
 * Formulario para calificar y reseñar un evento
 */
export function ReviewForm({
  eventId,
  canRate,
  hasRated,
  onSubmit,
  trigger,
}: ReviewFormProps) {
  const toast = useUnifiedToast()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [dimensions, setDimensions] = useState({
    quality: 0,
    organization: 0,
    location: 0,
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error('Seleccioná una calificación')
      return
    }

    if (dimensions.quality === 0 || dimensions.organization === 0 || dimensions.location === 0) {
      toast.error('Completá todas las dimensiones')
      return
    }

    setSubmitting(true)

    try {
      await onSubmit(rating, comment, dimensions)
      setOpen(false)
      // Reset form
      setRating(0)
      setComment('')
      setDimensions({ quality: 0, organization: 0, location: 0 })
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!canRate) {
    return (
      <div className="text-sm text-muted-foreground italic">
        Solo los asistentes pueden calificar este evento
      </div>
    )
  }

  if (hasRated) {
    return (
      <div className="text-sm text-muted-foreground italic">
        Ya calificaste este evento
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Star className="h-4 w-4" />
            Calificar Evento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Calificar Evento</DialogTitle>
          <DialogDescription>
            Compartí tu experiencia para ayudar a otros usuarios
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Calificación general */}
            <div className="space-y-2">
              <Label>Calificación General</Label>
              <div className="flex items-center gap-4">
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  size="lg"
                />
                {rating > 0 && (
                  <span className="text-lg font-medium">
                    {rating} {rating === 1 ? 'estrella' : 'estrellas'}
                  </span>
                )}
              </div>
            </div>

            {/* Dimensiones */}
            <div className="space-y-4">
              <Label>Calificá por categoría</Label>
              
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="quality" className="flex-1">
                      Calidad General
                    </Label>
                    <StarRating
                      rating={dimensions.quality}
                      onRatingChange={(r) => setDimensions({ ...dimensions, quality: r })}
                      size="sm"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="organization" className="flex-1">
                      Organización
                    </Label>
                    <StarRating
                      rating={dimensions.organization}
                      onRatingChange={(r) => setDimensions({ ...dimensions, organization: r })}
                      size="sm"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="location" className="flex-1">
                      Ubicación
                    </Label>
                    <StarRating
                      rating={dimensions.location}
                      onRatingChange={(r) => setDimensions({ ...dimensions, location: r })}
                      size="sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comentario */}
            <div className="space-y-2">
              <Label htmlFor="comment">Tu Reseña (opcional)</Label>
              <Textarea
                id="comment"
                placeholder="Contanos qué te pareció el evento..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || rating === 0}>
              {submitting ? 'Enviando...' : 'Enviar Calificación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
