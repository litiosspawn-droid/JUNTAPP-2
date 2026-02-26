'use client'

import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThumbsUp, ThumbsDown, Flag, MoreVertical, Trash2 } from 'lucide-react'
import { StarRating } from './star-rating'
import type { EventRating } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ReviewsDisplayProps {
  ratings: EventRating[]
  currentUserId?: string
  onMarkHelpful?: (ratingId: string, helpful: boolean) => void
  onReport?: (ratingId: string, reason: string) => void
  onDelete?: (ratingId: string) => void
  showReportButton?: boolean
  showDeleteButton?: boolean
}

/**
 * Componente para mostrar lista de reseñas
 */
export function ReviewsDisplay({
  ratings,
  currentUserId,
  onMarkHelpful,
  onReport,
  onDelete,
  showReportButton = true,
  showDeleteButton = false,
}: ReviewsDisplayProps) {
  const [reportingId, setReportingId] = useState<string | null>(null)

  if (ratings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay reseñas todavía</p>
        <p className="text-sm">Sé el primero en compartir tu experiencia</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <ReviewCard
          key={rating.id}
          rating={rating}
          currentUserId={currentUserId}
          onMarkHelpful={onMarkHelpful}
          onReport={onReport}
          onDelete={onDelete}
          showReportButton={showReportButton}
          showDeleteButton={showDeleteButton && rating.userId === currentUserId}
          isReporting={reportingId === rating.id}
          onReportToggle={() =>
            setReportingId(reportingId === rating.id ? null : rating.id)
          }
        />
      ))}
    </div>
  )
}

interface ReviewCardProps {
  rating: EventRating
  currentUserId?: string
  onMarkHelpful?: (ratingId: string, helpful: boolean) => void
  onReport?: (ratingId: string, reason: string) => void
  onDelete?: (ratingId: string) => void
  showReportButton?: boolean
  showDeleteButton?: boolean
  isReporting?: boolean
  onReportToggle?: () => void
}

function ReviewCard({
  rating,
  currentUserId,
  onMarkHelpful,
  onReport,
  onDelete,
  showReportButton,
  showDeleteButton,
  isReporting,
  onReportToggle,
}: ReviewCardProps) {
  const [reportReason, setReportReason] = useState('')

  const handleReport = () => {
    if (onReport && reportReason) {
      onReport(rating.id, reportReason)
      setReportReason('')
      onReportToggle?.()
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={rating.userPhotoURL} />
              <AvatarFallback>
                {rating.userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{rating.userName}</p>
              <div className="flex items-center gap-2">
                <StarRating rating={rating.rating} readonly size="sm" />
                <span className="text-xs text-muted-foreground">
                  {format(rating.createdAt, "d 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-2">
            {rating.isVerified && (
              <Badge variant="secondary" className="text-xs">
                ✓ Verificado
              </Badge>
            )}
            {rating.isFlagged && (
              <Badge variant="destructive" className="text-xs">
                Reportado
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dimensiones */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Calidad:</span>
            <StarRating rating={rating.ratings.quality} readonly size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Organización:</span>
            <StarRating rating={rating.ratings.organization} readonly size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Ubicación:</span>
            <StarRating rating={rating.ratings.location} readonly size="sm" />
          </div>
        </div>

        {/* Comentario */}
        {rating.comment && (
          <p className="text-sm text-foreground">{rating.comment}</p>
        )}

        {/* Fotos */}
        {rating.photos && rating.photos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {rating.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Foto ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkHelpful?.(rating.id, true)}
              className="gap-1 text-xs"
            >
              <ThumbsUp className="h-3 w-3" />
              Útil ({rating.helpfulCount || 0})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkHelpful?.(rating.id, false)}
              className="gap-1 text-xs"
            >
              <ThumbsDown className="h-3 w-3" />
              No útil ({rating.notHelpfulCount || 0})
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {showDeleteButton && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(rating.id)}
                className="gap-1 text-xs text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            {showReportButton && onReport && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReportToggle}
                  className="gap-1 text-xs"
                >
                  <Flag className="h-3 w-3" />
                  Reportar
                </Button>
                {isReporting && (
                  <div className="flex gap-2">
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="">Seleccioná razón</option>
                      <option value="spam">Spam</option>
                      <option value="inappropriate">Inapropiado</option>
                      <option value="fake">Falso</option>
                      <option value="other">Otro</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReport}
                      disabled={!reportReason}
                      className="text-xs"
                    >
                      Enviar
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
