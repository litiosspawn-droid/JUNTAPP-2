"use client"

import { useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MOCK_EVENTS,
  CATEGORIES,
  CATEGORY_COLORS,
  type Category,
} from "@/lib/mock-data"
import {
  Music,
  Trophy,
  PartyPopper,
  Users,
  Calendar,
  MapPin,
  Clock,
  Filter,
  X,
} from "lucide-react"

const MapView = dynamic(
  () => import("@/components/map-view").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-lg bg-muted" />
    ),
  }
)

const CATEGORY_ICON_MAP: Record<Category, React.ReactNode> = {
  "Música": <Music className="h-3.5 w-3.5" />,
  "Deporte": <Trophy className="h-3.5 w-3.5" />,
  "After": <PartyPopper className="h-3.5 w-3.5" />,
  "Reunión": <Users className="h-3.5 w-3.5" />,
}

export default function MapaPage() {
  const [activeCategories, setActiveCategories] = useState<Category[]>([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [showFilters, setShowFilters] = useState(true)

  const toggleCategory = (cat: Category) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const filteredEvents = MOCK_EVENTS.filter((event) => {
    if (activeCategories.length > 0 && !activeCategories.includes(event.category)) {
      return false
    }
    if (dateFrom && event.date < dateFrom) return false
    if (dateTo && event.date > dateTo) return false
    return true
  })

  const clearFilters = () => {
    setActiveCategories([])
    setDateFrom("")
    setDateTo("")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar Filters */}
        <aside
          className={`${
            showFilters ? "block" : "hidden lg:block"
          } w-full shrink-0 border-b border-border bg-card p-4 lg:w-80 lg:border-b-0 lg:border-r`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </h2>
            <div className="flex items-center gap-2">
              {(activeCategories.length > 0 || dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs">
                  <X className="h-3 w-3" />
                  Limpiar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Category filters */}
          <div className="mb-6">
            <Label className="mb-2 block text-sm font-medium text-foreground">
              Categorías
            </Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategories.includes(cat) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCategory(cat)}
                  className="gap-1.5"
                >
                  {CATEGORY_ICON_MAP[cat]}
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="mb-6">
            <Label className="mb-2 block text-sm font-medium text-foreground">
              Rango de fechas
            </Label>
            <div className="flex flex-col gap-2">
              <div>
                <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">
                  Desde
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateTo" className="text-xs text-muted-foreground">
                  Hasta
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {filteredEvents.length}
              </span>{" "}
              eventos encontrados
            </p>
          </div>

          {/* Event list in sidebar */}
          <div className="mt-4 flex flex-col gap-2 max-h-[400px] overflow-y-auto lg:max-h-[calc(100vh-480px)]">
            {filteredEvents.map((event) => (
              <Link key={event.id} href={`/evento/${event.id}`}>
                <Card className="transition-all hover:shadow-md py-0">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <Badge
                            className={`${CATEGORY_COLORS[event.category]} text-xs`}
                          >
                            {event.category}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-medium text-foreground truncate">
                          {event.title}
                        </h3>
                        <div className="mt-1 flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.date).toLocaleDateString("es-AR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {event.time}hs
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {event.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </aside>

        {/* Map */}
        <div className="relative flex-1">
          {!showFilters && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-4 top-4 z-10 gap-2 shadow-md lg:hidden"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          )}
          <MapView
            events={filteredEvents}
            className="h-[calc(100vh-4rem-4rem)] w-full lg:h-[calc(100vh-4rem)] rounded-none border-0"
            zoom={12}
          />
        </div>
      </main>

      <div className="lg:hidden">
        <Footer />
      </div>
    </div>
  )
}
