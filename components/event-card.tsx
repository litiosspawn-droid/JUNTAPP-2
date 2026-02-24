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
import { useState } from 'react'

export function EventCard({ event, onDelete }: { event: Event; onDelete?: () => void }) {
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault() // Evitar navegación al enlace
    e.stopPropagation() // Evitar bubbling

    if (!user) {
      alert('Debes iniciar sesión para eliminar eventos')
      return
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar el evento "${event.title}"? Esta acción no se puede deshacer.`
    )

    if (!confirmDelete) return

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

  const isOwner = user && event.creatorId === user.uid

  return (
    <div className="relative">
      <Link href={`/evento/${event.id}`}>
        <Card className="group overflow-hidden border-border transition-all hover:shadow-lg hover:-translate-y-1 py-0">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={event.flyerUrl || '/images/placeholder-event.jpg'}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge className={CATEGORY_COLORS[event.category]}>
              {event.category}
            </Badge>
          </div>
          {isOwner && (
            <div className="absolute top-3 right-3">
              <Button
                variant="destructive"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 text-base font-semibold leading-tight text-foreground text-pretty line-clamp-2">
            {event.title}
          </h3>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>
                {new Date(event.date).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "short",
                })} - {event.time}hs
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>{Number(event.attendees || 0).toString()} asistentes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
    </div>
  )
}
