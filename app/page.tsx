"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Header, Footer } from "@/components/layout"
import { EventCard } from "@/components/event-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CATEGORIES, CATEGORY_COLORS, type Category } from "@/lib/firebase/events"
import { Music, Trophy, PartyPopper, Users, Sparkles, Search, MapPin, Calendar, Clock, Plus, TrendingUp, Users as UsersIcon, Calendar as CalendarIcon, Star, Palette, Cpu, UtensilsCrossed, GraduationCap, Heart, Gamepad2, Briefcase, Church, Home, MoreHorizontal } from "lucide-react"
import { useEvents } from '@/hooks/use-events'
import { useAuth } from '@/contexts/AuthContext'
import { useGeolocation } from '@/hooks/use-geolocation'

const MapView = dynamic(() => import("@/components/map-view").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-lg bg-muted" />
  ),
})

const CATEGORY_ICON_MAP: Record<Category, React.ReactNode> = {
  "Música": <Music className="h-4 w-4" />,
  "Deporte": <Trophy className="h-4 w-4" />,
  "After": <PartyPopper className="h-4 w-4" />,
  "Reunión": <Users className="h-4 w-4" />,
  "Arte & Cultura": <Palette className="h-4 w-4" />,
  "Tecnología": <Cpu className="h-4 w-4" />,
  "Gastronomía": <UtensilsCrossed className="h-4 w-4" />,
  "Educación": <GraduationCap className="h-4 w-4" />,
  "Bienestar": <Heart className="h-4 w-4" />,
  "Entretenimiento": <Gamepad2 className="h-4 w-4" />,
  "Negocios": <Briefcase className="h-4 w-4" />,
  "Religión": <Church className="h-4 w-4" />,
  "Familia": <Home className="h-4 w-4" />,
  "Otros": <MoreHorizontal className="h-4 w-4" />,
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
                    <div className="text-2xl font-bold text-primary">{stats.upcomingEvents}</div>
                    <div className="text-sm text-muted-foreground">Próximos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.totalEvents}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.totalAttendees}</div>
                    <div className="text-sm text-muted-foreground">Asistentes</div>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <div className="relative">
                <div className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl">
                  {featuredEvents.length > 0 ? (
                    <MapView
                      key={`hero-map-${featuredEvents.length}-${featuredEvents[0]?.id || 'empty'}`}
                      events={featuredEvents}
                      center={userLocation || [-34.6037, -58.3816]}
                      zoom={userLocation ? 15 : 13}
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <MapPin className="h-8 w-8 mx-auto mb-2" />
                        <p>Cargando mapa...</p>
                        {locationLoading && <p className="text-sm">Obteniendo tu ubicación...</p>}
                        {locationError && (
                          <div className="mt-2">
                            <p className="text-sm text-yellow-600 mb-2">{locationError}</p>
                            <Button variant="outline" size="sm" onClick={requestLocation}>
                              Reintentar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-card rounded-lg p-4 shadow-lg border">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{stats.upcomingEvents} eventos esta semana</span>
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
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    variant={activeFilter === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
                    className="gap-2 shrink-0"
                    disabled={loading}
                  >
                    {CATEGORY_ICON_MAP[cat]}
                    {cat}
                  </Button>
                ))}
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
