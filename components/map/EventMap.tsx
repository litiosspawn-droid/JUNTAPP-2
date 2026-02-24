'use client';
import { useEffect } from 'react';

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
    // Placeholder for map functionality
    console.log('Map would render here with events:', events);
  }, [events]);

  return (
    <div className="h-96 w-full bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-semibold">Map View</p>
        <p className="text-sm text-gray-600">Interactive map will be rendered here</p>
        <p className="text-xs text-gray-500 mt-2">Events: {events.length}</p>
      </div>
    </div>
  );
}
