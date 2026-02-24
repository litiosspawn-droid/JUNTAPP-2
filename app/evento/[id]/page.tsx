'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header, Footer } from "@/components/layout"
import { EventCard } from "@/components/event-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock, ArrowLeft } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { getEvents, incrementAttendees, type Event } from '@/lib/firebase/events'
import EventChat from '@/components/chat/EventChat'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [attending, setAttending] = useState(false)

  const eventId = params.id as string

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const events = await getEvents()
        const foundEvent = events.find(e => e.id === eventId)
        setEvent(foundEvent || null)
      } catch (error) {
        console.error('Error loading event:', error)
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      loadEvent()
    }
  }, [eventId])

  const handleAttend = async () => {
    if (!event || !user) return

    try {
      await incrementAttendees(eventId)
      setEvent(prev => prev ? { ...prev, attendees: prev.attendees + 1 } : null)
      setAttending(true)
    } catch (error) {
      console.error('Error attending event:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p>Cargando evento...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Evento no encontrado</h1>
            <p className="text-muted-foreground mb-6">El evento que buscas no existe o ha sido eliminado.</p>
            <Button onClick={() => router.push('/')}>
              Volver al inicio
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event image */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                <img
                  src={event.flyerUrl}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-chart-1 text-primary-foreground">
                    {event.category}
                  </Badge>
                </div>
              </div>

              {/* Event details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {new Date(event.date).toLocaleDateString('es-AR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">{event.time}hs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{event.attendees} asistentes</p>
                        <p className="text-sm text-muted-foreground">Confirmados</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{event.address}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Descripción</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Attend button */}
                  {user && (
                    <Button
                      onClick={handleAttend}
                      disabled={attending}
                      className="w-full gap-2"
                      size="lg"
                    >
                      {attending ? (
                        <>
                          <Users className="h-5 w-5" />
                          Ya asistirás
                        </>
                      ) : (
                        <>
                          <Users className="h-5 w-5" />
                          Asistir al evento
                        </>
                      )}
                    </Button>
                  )}

                  {!user && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-3">
                        Inicia sesión para confirmar tu asistencia
                      </p>
                      <Button onClick={() => router.push('/')} className="gap-2">
                        Iniciar Sesión
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Chat */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chat del evento</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <EventChat
                    eventId={eventId}
                    chatExpiration={event?.chatExpiration}
                    attendees={event?.attendees || []}
                    creatorId={event?.creatorId}
                  />
                </CardContent>
              </Card>

              {/* Map placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ubicación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Mapa interactivo</p>
                      <p className="text-xs">Próximamente</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    {event.address}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
