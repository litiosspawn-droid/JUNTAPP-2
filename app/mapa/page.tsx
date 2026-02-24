"use client"

import { useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, SUBCATEGORIES, POPULAR_TAGS, type Category } from "@/lib/firebase/events"
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
                  <div className="text-xl font-bold text-primary">0</div>
                  <div className="text-xs text-muted-foreground">Eventos</div>
                </div>
                <div className="rounded-lg bg-green-500/5 p-3 text-center">
                  <div className="text-xl font-bold text-green-600">0</div>
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
              events={[]}
              className="h-full w-full"
              zoom={13}
              center={[-34.6037, -58.3816]}
            />
          ) : (
            <div className="h-full overflow-y-auto p-4">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="text-center py-16">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Vista de lista</h3>
                  <p className="text-muted-foreground">
                    Funcionalidad de lista próximamente
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
