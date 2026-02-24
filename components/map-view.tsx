"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import "leaflet.markercluster"
import { MapPin } from "lucide-react"
import type { Event, CATEGORY_COLORS } from "@/lib/firebase/events"

const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816]
const DEFAULT_ZOOM = 13

function createCustomIcon(color: string = "#c2410c") {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
    className: "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

interface MapViewProps {
  events?: Event[]
  center?: [number, number]
  zoom?: number
  className?: string
  interactive?: boolean
  onMarkerClick?: (event: Event) => void
  onMapClick?: (latlng: { lat: number; lng: number }) => void
  selectedLocation?: [number, number]
  showUserLocation?: boolean
  userLocation?: [number, number]
  onUserLocationFound?: (location: [number, number]) => void
}

export function MapView({
  events = [],
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  className = "h-64 w-full",
  interactive = true,
  onMarkerClick,
  onMapClick,
  selectedLocation,
  showUserLocation = false,
  userLocation,
  onUserLocationFound,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isMapLoading, setIsMapLoading] = useState(true)

  useEffect(() => {
    console.log('MapView: Initializing map', { center, zoom, eventsCount: events.length })

    // Añadir timeout para evitar que se quede cargando indefinidamente
    const initTimeout = setTimeout(() => {
      console.warn('MapView: Initialization timeout - forcing error state')
      setMapError('Timeout al cargar el mapa')
      setIsMapLoading(false)
    }, 15000) // 15 segundos de timeout

    if (!mapRef.current) {
      console.error('MapView: mapRef.current is null')
      setMapError('Contenedor del mapa no encontrado')
      setIsMapLoading(false)
      clearTimeout(initTimeout)
      return
    }

    // Verificar que Leaflet esté disponible
    if (typeof L === 'undefined') {
      console.error('MapView: Leaflet library not loaded')
      setMapError('Biblioteca de mapas no cargada')
      setIsMapLoading(false)
      clearTimeout(initTimeout)
      return
    }

    try {
      if (mapInstanceRef.current) {
        console.log('MapView: Removing existing map instance')
        mapInstanceRef.current.remove()
      }

      console.log('MapView: Creating new map instance')
      const map = L.map(mapRef.current, {
        center,
        zoom,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
        boxZoom: interactive,
        keyboard: interactive,
        dragging: interactive,
        zoomControl: interactive,
        // Añadir opciones para mejor compatibilidad
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true,
      })

      // Añadir event listener para cuando el mapa esté listo
      map.whenReady(() => {
        console.log('MapView: Map is ready')
        clearTimeout(initTimeout)
        setIsMapLoading(false)
        setMapError(null)
      })

      console.log('MapView: Adding tile layer')
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        // Añadir opciones para mejor carga
        errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      }).addTo(map)

      // Agregar funcionalidad de clic en mapa
      if (onMapClick && interactive) {
        console.log('MapView: Adding map click handler')
        map.on('click', (e: L.LeafletMouseEvent) => {
          onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
        })
      }

    // Agregar marcador para ubicación seleccionada
    if (selectedLocation) {
      const selectedMarker = L.marker(selectedLocation, {
        icon: L.divIcon({
          html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
          className: "selected-location-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })
      }).addTo(map)

      selectedMarker.bindPopup(`
        <div style="text-align:center">
          <strong>Ubicación Seleccionada</strong><br/>
          <small>${selectedLocation[0].toFixed(6)}, ${selectedLocation[1].toFixed(6)}</small>
        </div>
      `)
    }

    const categoryColors: Record<string, string> = {
      "Música": "#8b5cf6",
      "Deporte": "#10b981",
      "After": "#ec4899",
      "Reunión": "#3b82f6",
      "Arte & Cultura": "#6366f1",
      "Tecnología": "#06b6d4",
      "Gastronomía": "#f97316",
      "Educación": "#14b8a6",
      "Bienestar": "#10b981",
      "Entretenimiento": "#eab308",
      "Negocios": "#4b5563",
      "Religión": "#d97706",
      "Familia": "#f472b6",
      "Otros": "#6b7280",
    }

    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 200,
      chunkDelay: 50,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      removeOutsideVisibleBounds: true,
      animate: true,
      disableClusteringAtZoom: 16,
      iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        let className = 'marker-cluster-small';

        if (count < 10) {
          className = 'marker-cluster-small';
        } else if (count < 100) {
          className = 'marker-cluster-medium';
        } else {
          className = 'marker-cluster-large';
        }

        return new L.DivIcon({
          html: '<div><span>' + count + '</span></div>',
          className: 'marker-cluster ' + className,
          iconSize: new L.Point(40, 40)
        });
      }
    });

    events.forEach((event) => {
      // Verificar que las coordenadas existan y sean válidas
      if (event.lat && event.lng && !isNaN(event.lat) && !isNaN(event.lng)) {
        const marker = L.marker([event.lat, event.lng], {
          icon: createCustomIcon(categoryColors[event.category] || "#c2410c"),
        })

        marker.bindPopup(`
          <div style="min-width:200px;max-width:300px">
            <strong style="font-size:16px;margin-bottom:8px;display:block">${event.title}</strong>
            <div style="margin-bottom:8px">
              <span style="background:${categoryColors[event.category] || '#c2410c'};color:white;padding:2px 6px;border-radius:4px;font-size:12px">${event.category}</span>
            </div>
            <div style="font-size:14px;margin-bottom:4px">
              <strong>📅 Fecha:</strong> ${event.date}
            </div>
            <div style="font-size:14px;margin-bottom:4px">
              <strong>🕐 Hora:</strong> ${event.time || 'No especificada'}
            </div>
            <div style="font-size:14px;margin-bottom:8px">
              <strong>📍 Ubicación:</strong> ${event.address}
            </div>
            ${event.description ? `<div style="font-size:13px;margin-bottom:8px"><strong>📝 Descripción:</strong> ${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</div>` : ''}
            <div style="text-align:center;margin-top:8px">
              <button onclick="window.open('/evento/${event.id}', '_blank')" style="background:#3b82f6;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px">Ver Evento</button>
            </div>
          </div>
        `, {
          maxWidth: 300,
          className: 'custom-popup'
        })

        if (onMarkerClick) {
          marker.on("click", () => onMarkerClick(event))
        }

        markers.addLayer(marker)
      }
    })

    // Mostrar ubicación del usuario si está disponible
    if (showUserLocation && userLocation) {
      const userMarker = L.marker(userLocation, {
        icon: L.divIcon({
          html: `<div style="background:#3b82f6;border:3px solid white;border-radius:50%;width:20px;height:20px;box-shadow:0 2px 4px rgba(0,0,0,0.2);position:relative;"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:8px;height:8px;background:white;border-radius:50%;"></div></div>`,
          className: "user-location-marker",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })
      }).addTo(map)

      userMarker.bindPopup(`
        <div style="text-align:center">
          <strong>Tu ubicación</strong><br/>
          <small>${userLocation[0].toFixed(6)}, ${userLocation[1].toFixed(6)}</small>
        </div>
      `)

      // Añadir un círculo de precisión alrededor de la ubicación del usuario
      L.circle(userLocation, {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: 100, // 100 metros de radio
        weight: 2,
        dashArray: '5, 5'
      }).addTo(map)
    }

    // Intentar obtener ubicación del usuario si showUserLocation es true pero no hay userLocation
    if (showUserLocation && !userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos: [number, number] = [position.coords.latitude, position.coords.longitude]
          if (onUserLocationFound) {
            onUserLocationFound(userPos)
          }
        },
        (error) => {
          console.warn('Error getting user location:', error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutos
        }
      )
    }

    // Configurar controles para móviles
    if (L.Browser.mobile) {
      // Mejorar la experiencia táctil
      map.on('popupopen', function(e) {
        const popup = e.popup
        const content = popup.getContent()
        // Reemplazar onclick con ontouchstart para mejor compatibilidad móvil
        if (typeof content === 'string') {
          const newContent = content.replace(
            /onclick="window\.open/g,
            'ontouchstart="window.open'
          )
          popup.setContent(newContent)
        }
      })

      // Mejorar popups en móviles - hacerlos más anchos
      map.on('popupopen', function(e) {
        const popup = e.popup
        popup.options.maxWidth = Math.min(window.innerWidth - 40, 300)
        popup.update()
      })

      // Prevenir comportamientos por defecto que pueden interferir
      map.on('dblclick', function(e) {
        e.originalEvent.preventDefault()
      })

      // Mejorar el zoom táctil
      map.options.doubleClickZoom = false
      map.options.boxZoom = false
    }

    map.addLayer(markers)

    // Usar requestAnimationFrame para asegurar que el mapa esté listo
    requestAnimationFrame(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    })

    mapInstanceRef.current = map
    setIsMapLoading(false)
    setMapError(null)
    console.log('MapView: Map initialized successfully')

    return () => {
      console.log('MapView: Cleaning up map instance')
      map.remove()
      mapInstanceRef.current = null
    }
    } catch (error) {
      console.error('MapView: Error initializing map:', error)
      setMapError(error instanceof Error ? error.message : 'Error desconocido al cargar el mapa')
      setIsMapLoading(false)
    }
  }, [events, center, zoom, interactive, onMarkerClick])

  return (
    <div className={`${className} rounded-lg overflow-hidden border border-border relative`}>
      {isMapLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando mapa...</p>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <div className="text-center p-4">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-destructive mb-1">Error al cargar el mapa</p>
            <p className="text-xs text-muted-foreground">{mapError}</p>
            <button
              onClick={() => {
                setMapError(null)
                setIsMapLoading(true)
                // Trigger re-render by updating a dependency
                window.location.reload()
              }}
              className="mt-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      <div ref={mapRef} className="h-full w-full" />
      <style jsx global>{`
        .custom-marker {
          background: none !important;
          border: none !important;
        }
      `}</style>
    </div>
  )
}

interface DraggableMapProps {
  center?: [number, number]
  className?: string
  onPositionChange?: (lat: number, lng: number) => void
}

export function DraggableMap({
  center = DEFAULT_CENTER,
  className = "h-64 w-full",
  onPositionChange,
}: DraggableMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
    }

    const map = L.map(mapRef.current, {
      center,
      zoom: 14,
      scrollWheelZoom: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const marker = L.marker(center, {
      draggable: true,
      icon: createCustomIcon("#c2410c"),
    }).addTo(map)

    marker.on("dragend", () => {
      const pos = marker.getLatLng()
      onPositionChange?.(pos.lat, pos.lng)
    })

    mapInstanceRef.current = map

    // Usar requestAnimationFrame para asegurar que el mapa esté listo
    requestAnimationFrame(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    })

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [center, onPositionChange])

  return (
    <div className={`${className} rounded-lg overflow-hidden border border-border`}>
      <div ref={mapRef} className="h-full w-full" />
      <style jsx global>{`
        .custom-marker {
          background: none !important;
          border: none !important;
        }
      `}</style>
    </div>
  )
}
