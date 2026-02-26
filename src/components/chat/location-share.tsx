'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { SharedLocation } from '@/types'

interface LocationShareProps {
  onLocationShare: (location: SharedLocation) => void
  onCancel: () => void
}

/**
 * Componente para compartir ubicación en tiempo real
 */
export function LocationShare({ onLocationShare, onCancel }: LocationShareProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<SharedLocation | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización')
      setLoading(false)
      return
    }

    // Obtener ubicación inicial
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const initialLocation: SharedLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date(),
        }
        setLocation(initialLocation)
        setLoading(false)

        // Actualizar ubicación en tiempo real cada 5 segundos
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            const updatedLocation: SharedLocation = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              timestamp: new Date(),
            }
            setLocation(updatedLocation)
          },
          (err) => {
            console.error('Error watching location:', err)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          }
        )
        setWatchId(id)
      },
      (err) => {
        setError('No se pudo obtener tu ubicación. Asegúrate de tener los permisos activados.')
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    )

    // Cleanup
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [])

  const handleShare = () => {
    if (location) {
      onLocationShare({
        ...location,
        address: 'Ubicación en tiempo real',
      })
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground text-center">
            Obteniendo tu ubicación...
          </p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive text-center">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Compartir Ubicación en Tiempo Real</h3>
        </div>

        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Latitud:</span>
            <span className="font-mono">{location?.lat.toFixed(6)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Longitud:</span>
            <span className="font-mono">{location?.lng.toFixed(6)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Actualizado:</span>
            <span className="font-mono">
              {location?.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Tu ubicación se actualizará automáticamente cada 5 segundos mientras
          el mensaje esté visible.
        </p>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleShare} className="flex-1 gap-2">
            <MapPin className="h-4 w-4" />
            Compartir
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Componente para mostrar ubicación compartida en el chat
 */
interface SharedLocationDisplayProps {
  location: SharedLocation
  onOpen?: () => void
}

export function SharedLocationDisplay({
  location,
  onOpen,
}: SharedLocationDisplayProps) {
  const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`

  return (
    <a
      href={googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full max-w-xs"
      onClick={onOpen}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-0">
          {/* Mapa embebido */}
          <div className="relative aspect-video bg-muted">
            <img
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=15&size=400x200&markers=color:red%7C${location.lat},${location.lng}&key=${process.env.NEXT_PUBLIC_MAPS_API_KEY || ''}`}
              alt="Ubicación compartida"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback si no hay API key
                e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Mapa+de+Ubicación'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <MapPin className="absolute bottom-2 right-2 h-6 w-6 text-white" />
          </div>

          <div className="p-3 space-y-1">
            <p className="font-medium text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {location.address || 'Ubicación compartida'}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(location.timestamp).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </a>
  )
}
