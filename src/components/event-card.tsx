"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CATEGORY_COLORS, type Event } from "@/lib/firebase/events"
import { useAuth } from '@/contexts/AuthContext'
import { deleteEvent } from '@/lib/firebase/events'
import { useState, memo } from 'react'

export const EventCard = memo(function EventCard({ event, onDelete }: { event: Event; onDelete?: () => void }) {
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault() // Evitar navegación al enlace
    e.stopPropagation() // Evitar bubbling

    if (!user || !user.uid) {
      alert('Error: Usuario no válido')
      return
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar el evento "${event.title}"? Esta acción no se puede deshacer.`
    )

    if (!event.id) {
      alert('Error: Evento sin ID válido')
      return
    }

    try {
      setIsDeleting(true)
      await deleteEvent(event.id, user.uid)
      alert('Evento eliminado exitosamente')
      onDelete?.() // Callback para refrescar la lista
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Error al eliminar el evento: ' + (error as Error).message)
    } finally {
      setIsDeleting(false)
    }
  }

  const isOwner = user && event.createdBy === user.uid

  return (
    <Link
      href={`/events/${event.id}`}
      className="block group h-[480px]"
      aria-label={`Ver detalles del evento: ${event.title}`}
    >
      <article className="relative flex flex-col h-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        {/* Image section - only show if flyer exists */}
        {event.flyerUrl && (
          <div className="h-[240px] bg-muted relative overflow-hidden shrink-0">
            <Image
              src={event.flyerUrl}
              alt={`Imagen promocional del evento: ${event.title}`}
              fill
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge
                className={CATEGORY_COLORS[event.category]}
                variant="secondary"
                aria-label={`Categoría: ${event.category}`}
              >
                {event.category}
              </Badge>
            </div>

            {/* Delete Button - Only for creator */}
            {isOwner && (
              <div className="absolute top-3 right-3">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-label={`Eliminar evento: ${event.title}`}
                  title={`Eliminar evento: ${event.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Content section */}
        <div className="p-4 flex flex-col flex-1 overflow-hidden">
          {/* Category Badge - Show at top if no flyer, or below image if flyer */}
          <div className="shrink-0 mb-3">
            <Badge
              className={CATEGORY_COLORS[event.category]}
              variant="secondary"
              aria-label={`Categoría: ${event.category}`}
            >
              {event.category}
            </Badge>
          </div>

          <div className="flex flex-col flex-1 space-y-2.5 overflow-hidden">
            {/* Event Title */}
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 shrink-0" id={`event-title-${event.id}`}>
              {event.title}
            </h3>

            {/* Event Description */}
            <p className="text-sm text-muted-foreground line-clamp-3 shrink-0" aria-describedby={`event-title-${event.id}`}>
              {event.description}
            </p>

            {/* Event Details - Stacked vertically */}
            <div className="space-y-2 text-sm text-muted-foreground shrink-0">
              {/* Date and Time */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                <time dateTime={`${event.date}T${event.time}`} className="truncate">
                  {new Date(event.date).toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  })} • {event.time}
                </time>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                <address className="not-italic truncate">
                  {event.address}
                </address>
              </div>

              {/* Attendees */}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">{Number(event.attendees || 0).toString()} asistencias</span>
              </div>
            </div>

            {/* Tags - Push to bottom, show all with wrap */}
            {event.tags && Array.isArray(event.tags) && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-auto shrink-0">
                {event.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs px-2 py-0.5 max-w-full truncate"
                    aria-label={`Etiqueta: ${tag}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Delete Button - Show at bottom for owner */}
          {isOwner && (
            <div className="pt-3 mt-3 border-t shrink-0">
              <Button
                variant="destructive"
                size="sm"
                className="w-full gap-2"
                onClick={handleDelete}
                disabled={isDeleting}
                aria-label={`Eliminar evento: ${event.title}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar evento
              </Button>
            </div>
          )}
        </div>
      </article>
    </Link>
  )
})
