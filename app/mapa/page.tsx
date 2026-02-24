"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, SUBCATEGORIES, POPULAR_TAGS, type Category } from "@/lib/firebase/events"
import { useEvents } from '@/hooks/use-events'
import {
  MapPin,
  Search,
  X,
  Layers,
  Tag,
  Calendar,
  SlidersHorizontal,
  Music,
  Trophy,
  PartyPopper,
  Users,
  Palette,
  Cpu,
  UtensilsCrossed,
  GraduationCap,
  Heart,
  Gamepad2,
  Briefcase,
  Church,
  Home,
  MoreHorizontal,
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

// Mapeo de iconos de categoría
const CATEGORY_ICON_COMPONENTS: Record<string, React.ComponentType<any>> = {
  "music": Music,
  "trophy": Trophy,
  "party-popper": PartyPopper,
  "users": Users,
  "palette": Palette,
  "cpu": Cpu,
  "utensils-crossed": UtensilsCrossed,
  "graduation-cap": GraduationCap,
  "heart": Heart,
  "gamepad-2": Gamepad2,
  "briefcase": Briefcase,
  "church": Church,
  "home": Home,
  "more-horizontal": MoreHorizontal,
}

export default function MapaPage() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [activeFilters, setActiveFilters] = useState({
    categories: [] as Category[],
    subcategory: "",
    tags: [] as string[],
    dateFrom: "",
    dateTo: "",
    searchQuery: "",
  })

  // Obtener eventos
  const { events, loading, error } = useEvents()

  // Filtrar eventos basado en todos los criterios
  const filteredEvents = useMemo(() => {
    console.time('🔍 Filtering events')

    let filtered = events

    // Filtro por categorías (optimizado)
    if (activeFilters.categories.length > 0) {
      const categorySet = new Set(activeFilters.categories)
      filtered = filtered.filter(event => categorySet.has(event.category))
    }

    // Filtro por subcategoría
    if (activeFilters.subcategory) {
      filtered = filtered.filter(event => event.subcategory === activeFilters.subcategory)
    }

    // Filtro por tags (optimizado)
    if (activeFilters.tags.length > 0) {
      const tagSet = new Set(activeFilters.tags)
      filtered = filtered.filter(event =>
        event.tags?.some(tag => tagSet.has(tag))
      )
    }

    // Filtro por rango de fechas (optimizado)
    if (activeFilters.dateFrom || activeFilters.dateTo) {
      const dateFrom = activeFilters.dateFrom ? new Date(activeFilters.dateFrom) : null
      const dateTo = activeFilters.dateTo ? new Date(activeFilters.dateTo) : null

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date)
        if (dateFrom && eventDate < dateFrom) return false
        if (dateTo && eventDate > dateTo) return false
        return true
      })
    }

    // Filtro por búsqueda de texto (optimizado)
    if (activeFilters.searchQuery.trim()) {
      const query = activeFilters.searchQuery.toLowerCase().trim()
      const queryWords = query.split(' ').filter(word => word.length > 0)

      filtered = filtered.filter(event => {
        const searchableText = `${event.title} ${event.description} ${event.address} ${event.category} ${event.tags?.join(' ') || ''}`.toLowerCase()

        // Búsqueda por palabras completas (más eficiente)
        return queryWords.every(word => searchableText.includes(word))
      })
    }

    console.timeEnd('🔍 Filtering events')
    console.log(`📊 Filtered ${filtered.length} events from ${events.length} total`)

    return filtered
  }, [
    events,
    activeFilters.categories,
    activeFilters.subcategory,
    activeFilters.tags,
    activeFilters.dateFrom,
    activeFilters.dateTo,
    activeFilters.searchQuery
  ])

  // Estadísticas actualizadas
  const stats = useMemo(() => ({
    total: filteredEvents.length,
    upcoming: filteredEvents.filter(event => new Date(event.date) >= new Date()).length
  }), [filteredEvents])

  // Funciones de filtro
  const toggleCategory = (category: Category) => {
    setActiveFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
      subcategory: prev.categories.length === 0 ? "" : prev.subcategory
    }))
  }

  const toggleTag = (tag: string) => {
    setActiveFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const clearAllFilters = () => {
    setActiveFilters({
      categories: [],
      subcategory: "",
      tags: [],
      dateFrom: "",
      dateTo: "",
      searchQuery: "",
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar Filters */}
        <aside className="w-full shrink-0 border-r border-border bg-card lg:w-80">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  Filtros Avanzados
                </h2>
              </div>

              {/* Estadísticas */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-primary/5 p-3 text-center">
                  <div className="text-xl font-bold text-primary">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Eventos</div>
                </div>
                <div className="rounded-lg bg-green-500/5 p-3 text-center">
                  <div className="text-xl font-bold text-green-600">{stats.upcoming}</div>
                  <div className="text-xs text-muted-foreground">Próximos</div>
                </div>
              </div>
            </div>

            {/* Filters Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar eventos
                </Label>
                <Input
                  placeholder="Buscar eventos, categorías, ubicaciones..."
                  value={activeFilters.searchQuery}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                />
                {activeFilters.searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveFilters(prev => ({ ...prev, searchQuery: '' }))}
                    className="h-8 px-2"
                  >
                    <X className="h-4 w-4" />
                    Limpiar búsqueda
                  </Button>
                )}
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Categorías ({activeFilters.categories.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => {
                    const IconComponent = CATEGORY_ICON_COMPONENTS[CATEGORY_ICONS[category]]
                    return (
                      <Button
                        key={category}
                        variant={activeFilters.categories.includes(category) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCategory(category)}
                        className="gap-1.5 text-xs"
                      >
                        {IconComponent && <IconComponent className="h-3 w-3" />}
                        {category}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Subcategories */}
              {activeFilters.categories.length === 1 && SUBCATEGORIES[activeFilters.categories[0]] && (
                <div className="space-y-2">
                  <Label>Subcategorías</Label>
                  <Select
                    value={activeFilters.subcategory}
                    onValueChange={(value) => setActiveFilters(prev => ({ ...prev, subcategory: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las subcategorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {SUBCATEGORIES[activeFilters.categories[0]].map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Tags */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags ({activeFilters.tags.length})
                </Label>
                <div className="flex flex-wrap gap-1">
                  {POPULAR_TAGS.slice(0, 12).map((tag) => (
                    <Button
                      key={tag}
                      variant={activeFilters.tags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                      className="h-7 text-xs px-2"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Rango de fechas
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="dateFrom" className="text-xs">Desde</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={activeFilters.dateFrom}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateTo" className="text-xs">Hasta</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={activeFilters.dateTo}
                      onChange={(e) => setActiveFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {Object.values(activeFilters).some(value =>
                Array.isArray(value) ? value.length > 0 : Boolean(value)
              ) && (
                <Button variant="outline" onClick={clearAllFilters} className="w-full gap-2">
                  <X className="h-4 w-4" />
                  Limpiar filtros
                </Button>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>0 eventos encontrados</span>
                <Link href="/crear">
                  <Button size="sm" className="gap-1">
                    Crear Evento
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {viewMode === 'map' ? (
            <MapView
              events={filteredEvents}
              className="h-full w-full"
              zoom={13}
              center={[-34.6037, -58.3816]}
            />
          ) : (
            <div className="h-full overflow-y-auto p-4">
              <div className="max-w-4xl mx-auto space-y-4">
                {loading ? (
                  // Loading skeletons
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted h-32 rounded-lg"></div>
                    </div>
                  ))
                ) : filteredEvents.length === 0 ? (
                  // Empty state
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                      <Search className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {activeFilters.searchQuery || activeFilters.categories.length > 0
                        ? 'No se encontraron eventos'
                        : 'No hay eventos disponibles'
                      }
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {activeFilters.searchQuery || activeFilters.categories.length > 0
                        ? 'Intenta ajustar los filtros de búsqueda para encontrar más eventos.'
                        : 'Los eventos aparecerán aquí cuando estén disponibles.'
                      }
                    </p>
                    {(activeFilters.searchQuery || activeFilters.categories.length > 0) && (
                      <Button
                        variant="outline"
                        onClick={clearAllFilters}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                ) : (
                  // Events list
                  filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onDelete={() => {
                        // TODO: Implement refresh logic
                        window.location.reload()
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
