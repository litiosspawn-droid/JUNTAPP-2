"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Event } from "@/lib/mock-data"

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
  events: Event[]
  center?: [number, number]
  zoom?: number
  className?: string
  interactive?: boolean
  onMarkerClick?: (event: Event) => void
}

export function MapView({
  events,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  className = "h-64 w-full",
  interactive = true,
  onMarkerClick,
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
      dragging: interactive,
      zoomControl: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const categoryColors: Record<string, string> = {
      "Música": "#c2410c",
      "Deporte": "#0369a1",
      "After": "#a21caf",
      "Reunión": "#0d9488",
    }

    events.forEach((event) => {
      const marker = L.marker([event.lat, event.lng], {
        icon: createCustomIcon(categoryColors[event.category] || "#c2410c"),
      }).addTo(map)

      marker.bindPopup(`
        <div style="min-width:160px">
          <strong style="font-size:14px">${event.title}</strong><br/>
          <span style="font-size:12px;color:#666">${event.category} - ${event.date}</span>
        </div>
      `)

      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(event))
      }
    })

    mapInstanceRef.current = map

    setTimeout(() => map.invalidateSize(), 100)

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

    setTimeout(() => map.invalidateSize(), 100)

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
