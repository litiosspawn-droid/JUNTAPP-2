"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Header, Footer } from "@/components/layout"
import { EventCard } from "@/components/event-card"
import { Button } from "@/components/ui/button"
import { MOCK_EVENTS, CATEGORIES, CATEGORY_COLORS, type Category } from "@/lib/mock-data"
import { Music, Trophy, PartyPopper, Users, Sparkles } from "lucide-react"

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
}

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<Category | null>(null)

  const filteredEvents = activeFilter
    ? MOCK_EVENTS.filter((e) => e.category === activeFilter)
    : MOCK_EVENTS

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {/* Hero section */}
        <section className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              Descubre eventos cerca tuyo
            </h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Explora lo que pasa en tu zona y conecta con tu comunidad.
            </p>
          </div>

          <MapView events={filteredEvents} className="h-64 w-full md:h-80" />
        </section>

        {/* Category filters */}
        <section className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button
              variant={activeFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(null)}
              className="gap-2 shrink-0"
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
              >
                {CATEGORY_ICON_MAP[cat]}
                {cat}
              </Button>
            ))}
          </div>
        </section>

        {/* Events grid */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {activeFilter ? `Eventos de ${activeFilter}` : "Próximos eventos"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredEvents.length} eventos
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium text-foreground">No hay eventos</p>
              <p className="text-muted-foreground">No se encontraron eventos para esta categoría.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
