'use client'

import { useState, useEffect, useMemo } from 'react'
import { Event, Category } from '@/lib/firebase/events'
import { useEvents } from './use-events'

interface SearchFilters {
  query?: string
  category?: Category
  dateFrom?: string
  dateTo?: string
  distance?: number // en km
  userLocation?: [number, number]
  sortBy?: 'date' | 'distance' | 'popularity'
  status?: 'active' | 'cancelled' | 'completed'
}

interface UseAdvancedSearchReturn {
  events: Event[]
  filteredEvents: Event[]
  loading: boolean
  error: string | null
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void
  resetFilters: () => void
  refetch: () => Promise<void>
  // Stats
  totalResults: number
  hasActiveFilters: boolean
}

/**
 * Hook para búsqueda avanzada con múltiples filtros
 * 
 * @example
 * const { filteredEvents, filters, setFilters } = useAdvancedSearch({
 *   category: 'Música',
 *   dateFrom: '2025-01-01',
 *   distance: 10,
 *   userLocation: [-34.6037, -58.3816]
 * })
 */
export function useAdvancedSearch(initialFilters: SearchFilters = {}): UseAdvancedSearchReturn {
  const [filters, setFiltersState] = useState<SearchFilters>(initialFilters)
  const { events, loading, error, refetch } = useEvents()

  const setFilters = (newFilters: SearchFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }

  const resetFilters = () => {
    setFiltersState({})
  }

  // Calcular distancia entre dos coordenadas (Fórmula de Haversine)
  const calculateDistance = useMemo(() => {
    return (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371 // Radio de la Tierra en km
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLon = (lon2 - lon1) * Math.PI / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }
  }, [])

  // Filtrar eventos
  const filteredEvents = useMemo(() => {
    let result = [...events]

    // Filtro por búsqueda de texto
    if (filters.query?.trim()) {
      const query = filters.query.toLowerCase()
      result = result.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.address.toLowerCase().includes(query) ||
        event.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filtro por categoría
    if (filters.category) {
      result = result.filter(event => event.category === filters.category)
    }

    // Filtro por fecha desde
    if (filters.dateFrom) {
      result = result.filter(event => event.date >= filters.dateFrom!)
    }

    // Filtro por fecha hasta
    if (filters.dateTo) {
      result = result.filter(event => event.date <= filters.dateTo!)
    }

    // Filtro por distancia
    if (filters.distance && filters.userLocation) {
      result = result.filter(event => {
        if (!event.lat || !event.lng) return false
        const distance = calculateDistance(
          filters.userLocation![0],
          filters.userLocation![1],
          event.lat,
          event.lng
        )
        return distance <= filters.distance!
      })
    }

    // Filtro por estado
    if (filters.status) {
      result = result.filter(event => (event.status || 'active') === filters.status)
    }

    // Ordenar resultados
    if (filters.sortBy === 'date') {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } else if (filters.sortBy === 'distance' && filters.userLocation) {
      result.sort((a, b) => {
        const distA = filters.userLocation && a.lat && a.lng
          ? calculateDistance(filters.userLocation[0], filters.userLocation[1], a.lat, a.lng)
          : Infinity
        const distB = filters.userLocation && b.lat && b.lng
          ? calculateDistance(filters.userLocation[0], filters.userLocation[1], b.lat, b.lng)
          : Infinity
        return distA - distB
      })
    } else if (filters.sortBy === 'popularity') {
      result.sort((a, b) => (b.attendees || 0) - (a.attendees || 0))
    }

    return result
  }, [events, filters, calculateDistance])

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0
  }, [filters])

  return {
    events,
    filteredEvents,
    loading,
    error,
    filters,
    setFilters,
    resetFilters,
    refetch,
    totalResults: filteredEvents.length,
    hasActiveFilters,
  }
}

// Hook para filtros rápidos
export function useQuickFilters() {
  const [activeFilter, setActiveFilter] = useState<'today' | 'weekend' | 'thisWeek' | 'thisMonth' | null>(null)

  const getQuickDateRange = () => {
    const today = new Date()
    const dateFrom = new Date()
    const dateTo = new Date()

    switch (activeFilter) {
      case 'today':
        dateFrom.setHours(0, 0, 0, 0)
        dateTo.setHours(23, 59, 59, 999)
        break
      case 'weekend':
        const dayOfWeek = today.getDay()
        const diffToSaturday = dayOfWeek === 6 ? 0 : (6 - dayOfWeek + 7) % 7
        dateFrom.setDate(today.getDate() + diffToSaturday)
        dateFrom.setHours(0, 0, 0, 0)
        dateTo.setDate(dateFrom.getDate() + 1)
        dateTo.setHours(23, 59, 59, 999)
        break
      case 'thisWeek':
        dateFrom.setDate(today.getDate() - today.getDay())
        dateFrom.setHours(0, 0, 0, 0)
        dateTo.setDate(dateFrom.getDate() + 6)
        dateTo.setHours(23, 59, 59, 999)
        break
      case 'thisMonth':
        dateFrom.setDate(1)
        dateFrom.setHours(0, 0, 0, 0)
        dateTo.setMonth(dateTo.getMonth() + 1)
        dateTo.setDate(0)
        dateTo.setHours(23, 59, 59, 999)
        break
    }

    return {
      dateFrom: dateFrom.toISOString().split('T')[0],
      dateTo: dateTo.toISOString().split('T')[0],
    }
  }

  return {
    activeFilter,
    setActiveFilter,
    getQuickDateRange,
  }
}
