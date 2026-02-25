import { useState, useEffect } from 'react';
import { getEvents, getEventsByCategory, type Event, type Category } from '@/lib/firebase/events';

export function useEvents(category?: Category) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📡 Loading events, category:', category);

      let eventsData: Event[];
      if (category) {
        eventsData = await getEventsByCategory(category);
      } else {
        eventsData = await getEvents();
      }

      console.log('✅ Events loaded:', eventsData.length);
      console.log('📦 Events data:', eventsData);

      setEvents(eventsData);
    } catch (err) {
      console.error('❌ Error loading events:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los eventos';
      setError(errorMessage);
      
      // Si es error de índices, dar mensaje más claro
      if (errorMessage.includes('index')) {
        setError('Error de índice de Firestore. Por favor, contacta al administrador.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [category]);

  return { events, loading, error, refetch: loadEvents };
}
