"use client"

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, AlertCircle, Search, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import("@/components/map-view").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-lg bg-muted flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2" />
        <p>Cargando mapa...</p>
      </div>
    </div>
  ),
})

interface LocationSelectorProps {
  address: string
  lat: number | null
  lng: number | null
  onAddressChange: (address: string) => void
  onLocationChange: (lat: number, lng: number) => void
  errors: {
    address?: string
    lat?: string
    lng?: string
  }
  touched: { [key: string]: boolean }
  onFieldBlur: (field: string) => void
  onGeocodeAddress?: (address: string) => Promise<{ lat: number; lng: number } | null>
}

export function LocationSelector({
  address,
  lat,
  lng,
  onAddressChange,
  onLocationChange,
  errors,
  touched,
  onFieldBlur,
  onGeocodeAddress,
}: LocationSelectorProps) {
  const [isGeocoding, setIsGeocoding] = useState(false)

  const handleGeocode = useCallback(async () => {
    if (!address.trim() || !onGeocodeAddress) return

    setIsGeocoding(true)
    try {
      const coordinates = await onGeocodeAddress(address)
      if (coordinates) {
        onLocationChange(coordinates.lat, coordinates.lng)
      }
    } catch (error) {
      console.error('Error geocoding address:', error)
    } finally {
      setIsGeocoding(false)
    }
  }, [address, onGeocodeAddress, onLocationChange])

  const handleMapClick = useCallback((latlng: { lat: number; lng: number }) => {
    onLocationChange(latlng.lat, latlng.lng)
  }, [onLocationChange])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Ubicación del evento
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Address Input */}
        <div className="space-y-2">
          <Label htmlFor="address">
            Dirección <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="address"
                placeholder="Ej: Plaza Dorrego, San Telmo, Buenos Aires"
                value={address}
                onChange={(e) => onAddressChange(e.target.value)}
                onBlur={() => onFieldBlur('address')}
                className={touched.address && errors.address ? 'border-red-500' : ''}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleGeocode}
              disabled={!address.trim() || isGeocoding}
              className="flex-shrink-0"
            >
              {isGeocoding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="hidden sm:inline ml-2">Buscar</span>
            </Button>
          </div>
          {touched.address && errors.address && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                {errors.address}
              </AlertDescription>
            </Alert>
          )}
          <p className="text-xs text-muted-foreground">
            Escribe la dirección completa para buscar automáticamente las coordenadas
          </p>
        </div>

        {/* Coordinates Display */}
        {(lat !== null && lng !== null) && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Latitud</Label>
              <Input
                value={lat.toFixed(6)}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Longitud</Label>
              <Input
                value={lng.toFixed(6)}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
        )}

        {/* Map */}
        <div className="space-y-2">
          <Label>Selecciona la ubicación exacta</Label>
          <div className="h-64 rounded-lg overflow-hidden border">
            <MapView
              events={[]}
              center={lat && lng ? [lat, lng] : [-34.6037, -58.3816]}
              zoom={lat && lng ? 16 : 12}
              className="h-full w-full"
              onMapClick={handleMapClick}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Haz clic en el mapa para ajustar la ubicación exacta del evento
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
