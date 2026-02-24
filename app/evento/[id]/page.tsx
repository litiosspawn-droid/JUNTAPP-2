'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Header, Footer } from "@/components/layout"
import { EventCard } from "@/components/event-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock, ArrowLeft, Share2, Flag, Star, MessageCircle } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { getEvents, incrementAttendees, type Event, CATEGORY_COLORS } from '@/lib/firebase/events'
import EventChat from '@/components/chat/EventChat'
import { EventRatingForm } from '@/components/event-rating-form'
import { EventRatingsDisplay } from '@/components/event-ratings-display'

const MapView = dynamic(() => import("@/components/map-view").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="aspect-square rounded-lg overflow-hidden border flex items-center justify-center bg-muted">
      <div className="text-center text-muted-foreground">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto mb-2"></div>
        <p className="text-sm">Cargando mapa...</p>
      </div>
    </div>
  ),
})

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
    if (!user || !event) return

    try {
      // TODO: Implement actual attendance tracking
      setAttending(!attending)
    } catch (error) {
      console.error('Error updating attendance:', error)
    }
  }

  const handleShareEvent = async () => {
    const eventUrl = window.location.href
    const shareData = {
      title: event?.title || 'Evento en Juntapp',
      text: `¡Mira este evento! ${event?.title} - ${event?.description?.substring(0, 100)}...`,
      url: eventUrl
    }

    try {
      // Try native Web Share API first
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(eventUrl)
        alert('¡Enlace copiado al portapapeles! Puedes compartirlo donde quieras.')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      // Final fallback
      try {
        await navigator.clipboard.writeText(eventUrl)
        alert('Enlace copiado al portapapeles.')
      } catch (clipboardError) {
        alert(`Comparte este enlace: ${eventUrl}`)
      }
    }
  }

  const handleReportEvent = async () => {
    if (!user) return

    const confirmReport = window.confirm(
      '¿Estás seguro de que quieres reportar este evento? Los administradores revisarán el contenido y tomarán las medidas apropiadas.'
    )

    if (!confirmReport) return

    try {
      // TODO: Implement event reporting - could create a reports collection
      alert('Evento reportado exitosamente. Los administradores lo revisarán.')
    } catch (error) {
      console.error('Error reporting event:', error)
      alert('Error al reportar el evento. Inténtalo de nuevo.')
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

          {/* Event Header with Conditional Image */}
          {event.flyerUrl && (
            <div className="mb-8">
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
                <Image
                  src={event.flyerUrl}
                  alt={`Imagen promocional del evento: ${event.title}`}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={CATEGORY_COLORS[event.category]} variant="secondary">
                      {event.category}
                    </Badge>
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                      {event.attendees} asistentes
                    </Badge>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {event.title}
                  </h1>
                  <div className="flex items-center gap-4 text-white/90 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(event.date).toLocaleDateString('es-AR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })} • {event.time}hs
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{event.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Info Card - Only show if no flyer */}
              {event.flyerUrl ? (
                <div className="bg-card rounded-lg p-6 border shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={CATEGORY_COLORS[event.category]} variant="secondary">
                        {event.category}
                      </Badge>
                      <Badge variant="outline">
                        {event.attendees} asistentes
                      </Badge>
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold mb-2">{event.title}</h1>
                      <div className="space-y-3 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(event.date).toLocaleDateString('es-AR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })} • {event.time}hs
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.address}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <h3 className="font-semibold mb-2">Descripción</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={CATEGORY_COLORS[event.category]} variant="secondary">
                        {event.category}
                      </Badge>
                      <Badge variant="outline">
                        {event.attendees} asistentes
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {new Date(event.date).toLocaleDateString('es-AR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
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
              )}

              {/* Large Event Chat - Moved up and bigger */}
              <Card className="shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Chat del Evento
                    <Badge variant="secondary" className="ml-auto">
                      En vivo
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Conecta con otros asistentes y comparte tus pensamientos
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-96">
                    <EventChat
                      eventId={eventId}
                      attendees={[]}  // TODO: Implement attendee tracking
                      creatorId={event?.createdBy}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Event Ratings and Reviews */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Valoraciones y Comentarios
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Rating Form */}
                    <EventRatingForm
                      eventId={eventId}
                      onRatingSubmitted={() => {
                        // Optionally refresh the ratings display
                        window.location.reload()
                      }}
                    />

                    {/* Ratings Display */}
                    <EventRatingsDisplay eventId={eventId} />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar - More compact */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Acciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user && (
                    <Button
                      onClick={handleAttend}
                      disabled={attending}
                      className="w-full gap-2"
                      variant={attending ? "secondary" : "default"}
                    >
                      {attending ? (
                        <>
                          <Users className="h-4 w-4" />
                          Ya asistirás
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4" />
                          Confirmar asistencia
                        </>
                      )}
                    </Button>
                  )}

                  <Button variant="outline" className="w-full gap-2" onClick={handleShareEvent}>
                    <Share2 className="h-4 w-4" />
                    Compartir evento
                  </Button>

                  <Button variant="outline" className="w-full gap-2 text-destructive" onClick={handleReportEvent}>
                    <Flag className="h-4 w-4" />
                    Reportar evento
                  </Button>
                </CardContent>
              </Card>

              {/* Event Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Asistentes</span>
                    <span className="font-medium">{event.attendees}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Categoría</span>
                    <Badge variant="outline">{event.category}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estado</span>
                    <Badge variant="secondary">
                      {new Date(event.date) >= new Date() ? 'Próximo' : 'Pasado'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Map - Smaller in sidebar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ubicación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square rounded-lg overflow-hidden border">
                    <MapView
                      center={event ? [event.lat, event.lng] : [-34.6037, -58.3816]}
                      zoom={16}
                      className="h-full w-full"
                      events={event ? [event] : []}
                      interactive={false}
                    />
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs">{event.address}</span>
                    </div>
                  </div>
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
