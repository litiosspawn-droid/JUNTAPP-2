'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Solución para iconos de Leaflet en Next.js
// Usamos URLs públicas para los iconos
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface EventMapProps {
  events: Array<{
    id: string;
    title: string;
    location: { lat: number; lng: number };
    flyerUrl?: string;
  }>;
  center?: [number, number];
  zoom?: number;
}

export default function EventMap({ events, center = [40.4168, -3.7038], zoom = 6 }: EventMapProps) {
  useEffect(() => {
    // Forzar uso del icono por defecto en los marcadores
    L.Marker.prototype.options.icon = defaultIcon;
  }, []);

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {events.map((event) => (
        <Marker key={event.id} position={[event.location.lat, event.location.lng]}>
          <Popup>
            <div>
              <h3 className="font-bold">{event.title}</h3>
              {event.flyerUrl && (
                <img src={event.flyerUrl} alt={event.title} className="w-32 h-32 object-cover" />
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
