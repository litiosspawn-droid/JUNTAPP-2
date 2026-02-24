"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CATEGORIES, CATEGORY_COLORS, type Category } from "@/lib/firebase/events"
import { useEvents } from '@/hooks/use-events'
import { useAuth } from '@/contexts/AuthContext'
import { useGeolocation } from '@/hooks/use-geolocation'
import { Sparkles, Plus, MapPin, TrendingUp, Users as UsersIcon, Calendar, Star, Search } from 'lucide-react'
import { ErrorBoundary } from '@/components/error-boundary'

// Lazy load heavy components
const EventCard = dynamic(() => import("@/components/event-card").then((mod) => mod.EventCard), {
  loading: () => (
    <Card className="overflow-hidden">
      <div className="aspect-[16/10] bg-muted animate-pulse" />
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  ),
})

const MapView = dynamic(() => import("@/components/map-view").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Cargando mapa...</p>
      </div>
    </div>
  ),
})

// Lazy load icon components
const CATEGORY_ICON_MAP: Record<Category, React.ComponentType<{ className?: string }>> = {
  "Música": dynamic(() => import("lucide-react").then(mod => mod.Music)),
  "Deporte": dynamic(() => import("lucide-react").then(mod => mod.Trophy)),
  "After": dynamic(() => import("lucide-react").then(mod => mod.PartyPopper)),
  "Reunión": dynamic(() => import("lucide-react").then(mod => mod.Users)),
  "Arte & Cultura": dynamic(() => import("lucide-react").then(mod => mod.Palette)),
  "Tecnología": dynamic(() => import("lucide-react").then(mod => mod.Cpu)),
  "Gastronomía": dynamic(() => import("lucide-react").then(mod => mod.UtensilsCrossed)),
  "Educación": dynamic(() => import("lucide-react").then(mod => mod.GraduationCap)),
  "Bienestar": dynamic(() => import("lucide-react").then(mod => mod.Heart)),
  "Entretenimiento": dynamic(() => import("lucide-react").then(mod => mod.Gamepad2)),
  "Negocios": dynamic(() => import("lucide-react").then(mod => mod.Briefcase)),
  "Religión": dynamic(() => import("lucide-react").then(mod => mod.Church)),
  "Familia": dynamic(() => import("lucide-react").then(mod => mod.Home)),
  "Otros": dynamic(() => import("lucide-react").then(mod => mod.MoreHorizontal)),
}

export default function HomePage() {
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState<Category | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { events, loading, error, refetch } = useEvents(activeFilter || undefined)
  const { position: userLocation, loading: locationLoading, error: locationError, requestLocation } = useGeolocation()

  // Filtrar eventos por búsqueda
  const filteredEvents = useMemo(() => {
    let filtered = activeFilter
      ? events.filter((e) => e.category === activeFilter)
      : events

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.address.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [events, activeFilter, searchQuery])

  // Eventos destacados (últimos 3 más próximos)
  const featuredEvents = useMemo(() => {
    return events
      .filter(event => new Date(event.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
  }, [events])

  // Estadísticas
  const stats = useMemo(() => {
    const totalEvents = events.length
    const upcomingEvents = events.filter(event => new Date(event.date) >= new Date()).length
    const totalAttendees = events.reduce((sum, event) => sum + (Number(event.attendees) || 0), 0)
    const categories = new Set(events.map(event => event.category)).size

    return { totalEvents, upcomingEvents, totalAttendees, categories }
  }, [events])

  // Estado para controlar si hemos intentado obtener ubicación
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false)

  // Solicitar ubicación automáticamente al cargar la página
  useEffect(() => {
    if (!hasRequestedLocation && !userLocation && !locationLoading) {
      console.log('Homepage: Requesting user location')
      requestLocation()
      setHasRequestedLocation(true)
    }
  }, [hasRequestedLocation, userLocation, locationLoading, requestLocation])

  // Estadísticas
  const homepageStats = useMemo(() => {
    const totalEvents = events.length
    const upcomingEvents = events.filter(event => new Date(event.date) >= new Date()).length
    const totalAttendees = events.reduce((sum, event) => sum + (Number(event.attendees) || 0), 0)

    return { totalEvents, upcomingEvents, totalAttendees }
  }, [events])

  // Debug: verificar carga de eventos
  useEffect(() => {
    console.log('🏠 Homepage: Events loading status:', { loading, error, eventsCount: events.length })
    console.log('🏠 Homepage: Events data:', events)

    if (error) {
      console.error('🏠 Homepage: Events error:', error)
    }
  }, [events, loading, error])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section Mejorado */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <Badge className="w-fit" variant="secondary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Comunidad Local
                  </Badge>
                  <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance">
                    Descubre{" "}
                    <span className="text-primary">eventos</span>{" "}
                    cerca tuyo
                  </h1>
                  <p className="text-lg text-muted-foreground md:text-xl max-w-2xl">
                    Explora lo que pasa en tu zona, conecta con tu comunidad y vive experiencias inolvidables.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/crear">
                    <Button size="lg" className="gap-2 text-base px-8 py-3">
                      <Plus className="h-5 w-5" />
                      Crear Evento
                    </Button>
                  </Link>
                  <Link href="/mapa">
                    <Button variant="outline" size="lg" className="gap-2 text-base px-8 py-3">
                      <MapPin className="h-5 w-5" />
                      Explorar Mapa
                    </Button>
                  </Link>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-3 gap-4 pt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{homepageStats.upcomingEvents}</div>
                    <div className="text-sm text-muted-foreground">Próximos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{homepageStats.totalEvents}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{homepageStats.totalAttendees}</div>
                    <div className="text-sm text-muted-foreground">Asistentes</div>
                  </div>
                </div>
              </div>

              {/* Map Preview - SIEMPRE VISIBLE */}
              <div className="relative">
                <div className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl">
                  <ErrorBoundary
                    fallback={
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <div className="text-center p-6">
                          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Mapa no disponible</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            El mapa no se pudo cargar. Esto puede deberse a restricciones de seguridad del navegador.
                          </p>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                              Intenta recargar la página o verifica tu conexión a internet.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.reload()}
                              className="text-xs"
                            >
                              Recargar página
                            </Button>
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <MapView
                      key={`homepage-map-${userLocation ? 'located' : 'default'}-${featuredEvents.length}`}
                      events={featuredEvents}
                      center={userLocation || [-34.6037, -58.3816]}
                      zoom={userLocation ? 13 : 11}
                      className="h-full w-full"
                      showUserLocation={true}
                      userLocation={userLocation}
                    />
                  </ErrorBoundary>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>

                {/* Indicador de ubicación */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {locationLoading && (
                    <div className="bg-white/90 text-foreground px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm font-medium">Obteniendo ubicación...</span>
                    </div>
                  )}

                  {locationError && (
                    <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg shadow-lg">
                      <p className="text-sm font-medium mb-1">Error de ubicación</p>
                      <p className="text-xs">{locationError}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-6 text-xs"
                        onClick={() => {
                          setHasRequestedLocation(false)
                        }}
                      >
                        Reintentar
                      </Button>
                    </div>
                  )}

                  {userLocation && (
                    <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg shadow-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-medium">Ubicación detectada</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="absolute -bottom-4 -left-4 bg-card rounded-lg p-4 shadow-lg border">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{homepageStats.upcomingEvents} eventos esta semana</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 border-b bg-card/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos por nombre, descripción o ubicación..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setSearchQuery("")}
                  >
                    ✕
                  </Button>
                )}
              </div>

              {/* Category Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Button
                  variant={activeFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(null)}
                  className="gap-2 shrink-0"
                  disabled={loading}
                >
                  <Sparkles className="h-4 w-4" />
                  Todos
                </Button>
                {CATEGORIES.map((cat) => {
                  const IconComponent = CATEGORY_ICON_MAP[cat]
                  return (
                    <Button
                      key={cat}
                      variant={activeFilter === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
                      className="gap-2 shrink-0"
                      disabled={loading}
                    >
                      <IconComponent className="h-4 w-4" />
                      {cat}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Events Section */}
        {featuredEvents.length > 0 && !searchQuery && !activeFilter && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 mb-8">
                <Star className="h-6 w-6 text-yellow-500" />
                <h2 className="text-3xl font-bold">Eventos Destacados</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {featuredEvents.map((event, index) => (
                  <Card key={event.id} className={`group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${index === 0 ? 'md:col-span-2' : ''}`}>
                    <div className={`relative ${index === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'} overflow-hidden rounded-t-lg`}>
                      <img
                        src={event.flyerUrl}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white/90 text-foreground hover:bg-white">
                          {event.category}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-black/50 text-white border-0">
                          Próximo
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(event.date).toLocaleDateString("es-AR", {
                              day: "numeric",
                              month: "short",
                            })} - {event.time}hs
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{event.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4" />
                          <span>{event.attendees} asistentes</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Events Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {loading ? "Cargando eventos..." :
                   searchQuery ? `Resultados para "${searchQuery}"` :
                   activeFilter ? `Eventos de ${activeFilter}` :
                   "Todos los eventos"}
                </h2>
                <p className="text-muted-foreground">
                  {!loading && `${filteredEvents.length} evento${filteredEvents.length !== 1 ? 's' : ''} encontrado${filteredEvents.length !== 1 ? 's' : ''}`}
                </p>
              </div>

              {user && (
                <Link href="/crear">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Evento
                  </Button>
                </Link>
              )}
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-80 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredEvents.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onDelete={refetch}
                  />
                ))}
              </div>
            )}

            {!loading && filteredEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">
                  {searchQuery ? "No se encontraron resultados" :
                   activeFilter ? `No hay eventos de ${activeFilter}` :
                   "No hay eventos disponibles"}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {searchQuery ? "Prueba con otros términos de búsqueda o quita los filtros para ver más eventos." :
                   activeFilter ? `No se encontraron eventos en la categoría "${activeFilter}".` :
                   "Sé el primero en crear un evento en tu zona."}
                </p>
                {user ? (
                  <Link href="/crear">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Crear el primer evento
                    </Button>
                  </Link>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Inicia sesión para crear eventos
                    </p>
                    <Button>Iniciar Sesión</Button>
                  </div>
                )}
                {error && (
                  <p className="text-sm text-red-500 mt-4">{error}</p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
