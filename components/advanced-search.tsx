import { useState, useCallback, useMemo } from 'react'
import { MapPin, Search, Filter, Mic, MicOff, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useGeolocation } from '@/hooks/use-geolocation'

interface SearchFilters {
  query: string
  location: {
    lat: number | null
    lng: number | null
    radius: number // in kilometers
    useCurrentLocation: boolean
  }
  categories: string[]
  dateRange: {
    from: string
    to: string
  }
  priceRange: {
    min: number
    max: number
  }
  sortBy: 'relevance' | 'date' | 'distance' | 'popularity'
  sortOrder: 'asc' | 'desc'
  onlyFree: boolean
  onlyVerified: boolean
}

interface AdvancedSearchProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onSearch: () => void
  isSearching: boolean
  searchResults: number
  className?: string
}

export function AdvancedSearch({
  filters,
  onFiltersChange,
  onSearch,
  isSearching,
  searchResults,
  className
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const { position: userLocation, requestLocation } = useGeolocation()

  // Voice search functionality
  const startVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta búsqueda por voz')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'es-ES' // Spanish
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onFiltersChange({
        ...filters,
        query: transcript
      })
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error('Voice search error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [filters, onFiltersChange])

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }, [filters, onFiltersChange])

  const updateLocationFilter = useCallback((key: string, value: any) => {
    onFiltersChange({
      ...filters,
      location: {
        ...filters.location,
        [key]: value
      }
    })
  }, [filters, onFiltersChange])

  const updateDateRange = useCallback((key: 'from' | 'to', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [key]: value
      }
    })
  }, [filters, onFiltersChange])

  const toggleCategory = useCallback((category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]

    updateFilter('categories', newCategories)
  }, [filters.categories, updateFilter])

  const useCurrentLocation = useCallback(async () => {
    if (userLocation) {
      updateLocationFilter('lat', userLocation[0])
      updateLocationFilter('lng', userLocation[1])
      updateLocationFilter('useCurrentLocation', true)
    } else {
      const granted = await requestLocation()
      if (granted && userLocation) {
        updateLocationFilter('lat', userLocation[0])
        updateLocationFilter('lng', userLocation[1])
        updateLocationFilter('useCurrentLocation', true)
      }
    }
  }, [userLocation, requestLocation, updateLocationFilter])

  const clearFilters = useCallback(() => {
    onFiltersChange({
      query: '',
      location: {
        lat: null,
        lng: null,
        radius: 10,
        useCurrentLocation: false
      },
      categories: [],
      dateRange: {
        from: '',
        to: ''
      },
      priceRange: {
        min: 0,
        max: 1000
      },
      sortBy: 'relevance',
      sortOrder: 'desc',
      onlyFree: false,
      onlyVerified: false
    })
  }, [onFiltersChange])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.query) count++
    if (filters.location.lat && filters.location.lng) count++
    if (filters.categories.length > 0) count++
    if (filters.dateRange.from || filters.dateRange.to) count++
    if (filters.onlyFree || filters.onlyVerified) count++
    return count
  }, [filters])

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Búsqueda Avanzada
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Filter className="h-3 w-3" />
                {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Menos filtros' : 'Más filtros'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Search Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos, lugares, categorías..."
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={startVoiceSearch}
            disabled={isListening}
            className={isListening ? 'bg-red-50 border-red-200' : ''}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 text-red-600" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Button onClick={onSearch} disabled={isSearching}>
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>

        {/* Results Count */}
        {searchResults > 0 && (
          <p className="text-sm text-muted-foreground">
            {searchResults} resultado{searchResults !== 1 ? 's' : ''} encontrado{searchResults !== 1 ? 's' : ''}
          </p>
        )}

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.onlyFree ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('onlyFree', !filters.onlyFree)}
          >
            Solo gratis
          </Button>
          <Button
            variant={filters.onlyVerified ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('onlyVerified', !filters.onlyVerified)}
          >
            Solo verificados
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={useCurrentLocation}
            className="gap-1"
          >
            <Navigation className="h-3 w-3" />
            Cerca mío
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Location Filter */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Ubicación
              </Label>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={useCurrentLocation}
                  disabled={!userLocation && !filters.location.useCurrentLocation}
                >
                  Usar mi ubicación
                </Button>
                <Input
                  placeholder="Buscar ubicación..."
                  value={filters.query} // Reuse query for location search
                  onChange={(e) => updateFilter('query', e.target.value)}
                  className="flex-1"
                />
              </div>

              {filters.location.lat && filters.location.lng && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Radio (km)</Label>
                    <Slider
                      value={[filters.location.radius]}
                      onValueChange={(value) => updateLocationFilter('radius', value[0])}
                      max={50}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-xs text-muted-foreground">{filters.location.radius} km</span>
                  </div>
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date-from">Desde</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => updateDateRange('from', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="date-to">Hasta</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => updateDateRange('to', e.target.value)}
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ordenar por</Label>
                <Select value={filters.sortBy} onValueChange={(value: any) => updateFilter('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevancia</SelectItem>
                    <SelectItem value="date">Fecha</SelectItem>
                    <SelectItem value="distance">Distancia</SelectItem>
                    <SelectItem value="popularity">Popularidad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Orden</Label>
                <Select value={filters.sortOrder} onValueChange={(value: any) => updateFilter('sortOrder', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descendente</SelectItem>
                    <SelectItem value="asc">Ascendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
