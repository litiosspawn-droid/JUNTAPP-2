'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Heart,
  Bookmark,
  ArrowRight,
  Star,
} from 'lucide-react'
import type { EventRecommendation } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface RecommendationsSectionProps {
  recommendations: EventRecommendation[]
  loading?: boolean
  onViewAll?: () => void
}

/**
 * Componente para mostrar una lista de recomendaciones de eventos
 */
export function RecommendationsSection({
  recommendations,
  loading = false,
  onViewAll,
}: RecommendationsSectionProps) {
  if (loading) {
    return (
      <section className="w-full py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <h2 className="text-2xl font-bold">Recomendado para ti</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="p-0">
                  <div className="h-48 bg-muted rounded-t-lg" />
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!recommendations || recommendations.length === 0) {
    return null
  }

  return (
    <section className="w-full py-8 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Recomendado para ti</h2>
              <p className="text-sm text-muted-foreground">
                Eventos seleccionados basados en tus intereses
              </p>
            </div>
          </div>
          {onViewAll && (
            <Button variant="ghost" onClick={onViewAll} className="gap-2">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Grid de recomendaciones */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recommendations.slice(0, 8).map((rec) => (
            <RecommendationCard key={rec.eventId} recommendation={rec} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface RecommendationCardProps {
  recommendation: EventRecommendation
}

/**
 * Tarjeta individual de recomendación
 */
function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { event, score, reasons } = recommendation

  // Formatear fecha
  const eventDate = new Date(event.date)
  const formattedDate = format(eventDate, "EEE, d 'de' MMMM", { locale: es })

  // Calcular número de attendees
  const attendeesCount = Array.isArray(event.attendees)
    ? event.attendees.length
    : 0

  // Determinar reason principal
  const mainReason = reasons.find((r) => r.type === 'category') || reasons[0]

  // Score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-blue-600 bg-blue-100'
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Score Badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge className={`${getScoreColor(score)} font-bold`}>
          <Sparkles className="h-3 w-3 mr-1" />
          {score}% match
        </Badge>
      </div>

      {/* Imagen del evento */}
      <Link href={`/events/${event.id}`} className="block relative overflow-hidden">
        <div className="aspect-video bg-muted">
          {event.images && event.images.length > 0 ? (
            <img
              src={event.images[0]}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Calendar className="h-12 w-12" />
            </div>
          )}
        </div>
      </Link>

      <CardHeader className="p-4 pb-2">
        {/* Título */}
        <Link href={`/events/${event.id}`}>
          <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
            {event.title}
          </h3>
        </Link>

        {/* Reason principal */}
        {mainReason && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            {mainReason.type === 'trending' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <Star className="h-3 w-3" />
            )}
            <span>{mainReason.label}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-2">
        {/* Fecha */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>

        {/* Ubicación */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{event.location.address}</span>
        </div>

        {/* Attendees */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{attendeesCount} personas interesadas</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {/* Botones de acción rápida */}
        <Button variant="outline" size="icon" className="flex-1">
          <Heart className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="flex-1">
          <Bookmark className="h-4 w-4" />
        </Button>
        <Button className="flex-[2]">
          Ver evento
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
}

/**
 * Componente para mostrar el estado vacío de recomendaciones
 */
export function EmptyRecommendations() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="p-4 bg-primary/10 rounded-full mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-semibold text-lg mb-2">
          ¡Comienza a explorar eventos!
        </h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Mientras más eventos explores y califiques, mejores recomendaciones
          recibirás basadas en tus intereses.
        </p>
      </CardContent>
    </Card>
  )
}
