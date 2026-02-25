import { Skeleton } from './skeleton'
import { Card, CardContent } from './card'

/**
 * Skeleton para EventCard - Reemplaza el spinner durante la carga de eventos
 */
export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Imagen placeholder */}
      <div className="aspect-[16/10] bg-muted relative">
        <Skeleton className="absolute inset-0 h-full w-full" />
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Badge de categoría */}
          <Skeleton className="h-5 w-20" />
          
          {/* Título */}
          <Skeleton className="h-5 w-full" />
          
          {/* Descripción */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          
          {/* Detalles del evento */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton para lista de eventos - Grid completo
 */
export function EventsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton para página de detalles de evento
 */
export function EventDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Imagen principal */}
      <Skeleton className="aspect-[16/9] w-full rounded-lg" />
      
      {/* Contenido */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      
      {/* Sección de información */}
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Skeleton para perfil de usuario
 */
export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Foto de perfil */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      
      {/* Información */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Skeleton para mapa
 */
export function MapSkeleton() {
  return (
    <div className="h-full w-full bg-muted flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
        </div>
        <p className="text-sm text-muted-foreground">Cargando mapa...</p>
      </div>
    </div>
  )
}

/**
 * Skeleton para chat
 */
export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-2 max-w-[70%]">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para lista de mensajes
 */
export function MessageListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para dashboard/analytics
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      
      {/* Chart */}
      <Skeleton className="h-80 rounded-lg" />
      
      {/* Table */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
