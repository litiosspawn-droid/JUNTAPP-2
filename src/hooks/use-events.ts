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
      
      let eventsData: Event[];
      if (category) {
        eventsData = await getEventsByCategory(category);
      } else {
        eventsData = await getEvents();
      }
      
      setEvents(eventsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [category]);

  return { events, loading, error, refetch: loadEvents };
}
