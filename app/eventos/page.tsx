"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton"
import { EmptyPreset } from "@/components/ui/empty"
import { type Category } from "@/lib/firebase/events"
import { useEvents } from '@/hooks/use-events'
import { useAuth } from '@/contexts/AuthContext'
import { usePullToRefresh, PullToRefreshContainer } from '@/components/ui/pull-to-refresh'
import { useUnifiedToast } from '@/hooks/use-unified-toast'
import { AdvancedFilters } from '@/components/advanced-filters'
import { useAdvancedSearch } from '@/hooks/use-advanced-search'
import { useGeolocation } from '@/hooks/use-geolocation'
import { ArrowLeft, Plus, RefreshCcw } from 'lucide-react'
import dynamic from 'next/dynamic'

const EventCard = dynamic(() => import("@/components/event-card").then((mod) => mod.EventCard), {
  loading: () => (
    <div className="rounded-lg overflow-hidden border bg-card h-[480px]">
      <div className="h-[240px] bg-muted animate-pulse" />
      <div className="p-4 space-y-2.5">
        <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
        <div className="space-y-1.5">
          <div className="h-4 bg-muted rounded animate-pulse w-full" />
          <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
        <div className="flex gap-1.5 pt-2 mt-auto">
          <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-14 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  ),
})

export default function EventosPage() {
  const { user } = useAuth()
  const toast = useUnifiedToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<Category | null>(null)
  const { events, loading: eventsLoading, refetch } = useEvents()
  const { position: userLocation } = useGeolocation()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const {
    filteredEvents,
    setFilters,
    resetFilters,
    hasActiveFilters,
  } = useAdvancedSearch({
    userLocation: userLocation || undefined,
  })

  useEffect(() => {
    setFilters({
      query: searchQuery || undefined,
      category: activeCategoryFilter || undefined,
      userLocation: userLocation || undefined,
    })
  }, [searchQuery, activeCategoryFilter, userLocation])

  const handleRefresh = async () => {
    await refetch()
    toast.success('Eventos actualizados', {
      description: `${events.length} eventos cargados`,
      duration: 2000,
    })
  }

  const {
    isRefreshing,
    pullDistance,
    containerRef,
  } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 100,
    enabled: isMobile,
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header con botón volver */}
          <div className="mb-8 flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {searchQuery ? `Resultados para "${searchQuery}"` : 
                 activeCategoryFilter ? `Eventos de ${activeCategoryFilter}` :
                 "Todos los eventos"}
              </h1>
              <p className="text-muted-foreground">
                {eventsLoading ? "Cargando..." : `${filteredEvents.length} evento${filteredEvents.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-8">
            <AdvancedFilters
              onSearchChange={setSearchQuery}
              onCategoryChange={setActiveCategoryFilter}
              onReset={resetFilters}
              hasActiveFilters={hasActiveFilters}
              userLocation={userLocation || undefined}
            />
          </div>

          {/* Lista de eventos */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={eventsLoading}
                  className="shrink-0"
                  title="Actualizar eventos"
                >
                  <RefreshCcw className={`h-5 w-5 ${eventsLoading ? 'animate-spin' : ''}`} />
                </Button>
              )}
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

          {/* Loading state */}
          {eventsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <PullToRefreshContainer
              onRefresh={handleRefresh}
              enabled={isMobile}
              threshold={100}
            >
              <div className="w-full max-w-full overflow-x-hidden">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onDelete={refetch}
                    />
                  ))}
                </div>
              </div>
            </PullToRefreshContainer>
          ) : (
            <EmptyPreset
              preset="no-data"
              title={
                searchQuery || activeCategoryFilter
                  ? "No se encontraron eventos"
                  : "No hay eventos disponibles"
              }
              description={
                searchQuery || activeCategoryFilter
                  ? "Intenta ajustar los filtros de búsqueda para encontrar más eventos."
                  : "Los eventos aparecerán aquí cuando estén disponibles."
              }
              actionLabel={
                searchQuery || activeCategoryFilter
                  ? "Limpiar filtros"
                  : undefined
              }
              onAction={
                searchQuery || activeCategoryFilter
                  ? () => {
                      setSearchQuery("")
                      setActiveCategoryFilter(null)
                    }
                  : undefined
              }
              className="max-w-md mx-auto py-16"
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
