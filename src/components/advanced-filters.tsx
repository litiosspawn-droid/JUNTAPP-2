'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Calendar } from '@/components/ui/calendar'
import { Search, Filter, X, MapPin, Calendar as CalendarIcon, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES, type Category } from '@/lib/firebase/events'
import { useQuickFilters } from '@/hooks/use-advanced-search'

interface AdvancedFiltersProps {
  onSearchChange?: (query: string) => void
  onCategoryChange?: (category: Category | null) => void
  onDateRangeChange?: (dateFrom: string, dateTo: string) => void
  onDistanceChange?: (distance: number) => void
  onSortChange?: (sortBy: 'date' | 'distance' | 'popularity') => void
  onReset?: () => void
  hasActiveFilters?: boolean
  userLocation?: [number, number]
}

export function AdvancedFilters({
  onSearchChange,
  onCategoryChange,
  onDateRangeChange,
  onDistanceChange,
  onSortChange,
  onReset,
  hasActiveFilters = false,
  userLocation,
}: AdvancedFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'distance' | 'popularity'>('date')
  const [distance, setDistance] = useState<number>(50)
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { activeFilter, setActiveFilter, getQuickDateRange } = useQuickFilters()

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearchChange?.(value)
  }

  const handleCategoryChange = (value: string) => {
    const category = value === 'all' ? null : (value as Category)
    setSelectedCategory(category)
    onCategoryChange?.(category)
  }

  const handleQuickFilter = (filter: 'today' | 'weekend' | 'thisWeek' | 'thisMonth') => {
    const newFilter = activeFilter === filter ? null : filter
    setActiveFilter(newFilter)
    
    if (newFilter) {
      const { dateFrom: from, dateTo: to } = getQuickDateRange()
      setDateFrom(new Date(from))
      setDateTo(new Date(to))
      onDateRangeChange?.(from, to)
    } else {
      setDateFrom(undefined)
      setDateTo(undefined)
      onDateRangeChange?.('', '')
    }
  }

  const handleDistanceChange = (value: number[]) => {
    setDistance(value[0])
    onDistanceChange?.(value[0])
  }

  const handleSortChange = (value: string) => {
    setSortBy(value as 'date' | 'distance' | 'popularity')
    onSortChange?.(value as 'date' | 'distance' | 'popularity')
  }

  const handleReset = () => {
    setSearchQuery('')
    setSelectedCategory(null)
    setSortBy('date')
    setDistance(50)
    setDateFrom(undefined)
    setDateTo(undefined)
    setActiveFilter(null)
    onReset?.()
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Seleccionar fecha'
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, descripción o ubicación..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 h-11"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => handleSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Quick Filters + Sort + Filters Button */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filtros rápidos de fecha */}
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            variant={activeFilter === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter('today')}
            className="h-8 text-xs"
          >
            Hoy
          </Button>
          <Button
            variant={activeFilter === 'weekend' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter('weekend')}
            className="h-8 text-xs"
          >
            Finde
          </Button>
          <Button
            variant={activeFilter === 'thisWeek' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter('thisWeek')}
            className="h-8 text-xs"
          >
            Esta semana
          </Button>
          <Button
            variant={activeFilter === 'thisMonth' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter('thisMonth')}
            className="h-8 text-xs"
          >
            Este mes
          </Button>
        </div>

        <div className="flex-1" />

        {/* Sort */}
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Por fecha</SelectItem>
            <SelectItem value="distance">Por distancia</SelectItem>
            <SelectItem value="popularity">Más populares</SelectItem>
          </SelectContent>
        </Select>

        {/* Filters Popover */}
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9 relative">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 space-y-4" align="end">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros avanzados</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 text-xs"
              >
                Limpiar
              </Button>
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rango de fechas */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Rango de fechas
              </Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal h-9"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      {formatDate(dateFrom)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span className="flex items-center">-</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal h-9"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                      {formatDate(dateTo)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Distancia */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Distancia máxima: {distance} km
              </Label>
              <Slider
                value={[distance]}
                onValueChange={handleDistanceChange}
                min={1}
                max={100}
                step={1}
                className="w-full"
                disabled={!userLocation}
              />
              {!userLocation && (
                <p className="text-xs text-muted-foreground">
                  Permite el acceso a tu ubicación para filtrar por distancia
                </p>
              )}
            </div>

            {/* Active filters badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-1 pt-2 border-t">
                {selectedCategory && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedCategory}
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {dateFrom && dateTo && (
                  <Badge variant="secondary" className="text-xs">
                    {dateFrom.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} - {dateTo.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    <button
                      onClick={() => {
                        setDateFrom(undefined)
                        setDateTo(undefined)
                        onDateRangeChange?.('', '')
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {distance < 100 && (
                  <Badge variant="secondary" className="text-xs">
                    ≤{distance}km
                    <button
                      onClick={() => {
                        setDistance(100)
                        onDistanceChange?.(100)
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
