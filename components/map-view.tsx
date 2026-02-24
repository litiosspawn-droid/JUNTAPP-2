"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import "leaflet.markercluster"
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

  useEffect(() => {
    if (!mapRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
    }

    const map = L.map(mapRef.current, {
      center,
      zoom,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
      dragging: interactive,
      zoomControl: interactive,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    // Agregar funcionalidad de clic en mapa
    if (onMapClick && interactive) {
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

    // Crear grupo de marcadores con clustering
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
      maxZoom: 18,
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
        const newContent = content.replace(
          /onclick="window\.open/g,
          'ontouchstart="window.open'
        )
        popup.setContent(newContent)
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

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [events, center, zoom, interactive, onMarkerClick])

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
