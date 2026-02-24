'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import EventChat from '@/components/chat/EventChat';

interface Event {
  id: string;
  title: string;
  description?: string;
  date: any;
  address: string;
  flyerUrl?: string;
  category: string;
  createdBy: string;
  attendees: string[];
  attendeesCount: number;
}

export default function EventPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAttending, setIsAttending] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', params.id));
        if (!eventDoc.exists()) {
          setError('Evento no encontrado');
          return;
        }
        
        const eventData = eventDoc.data() as Omit<Event, 'id'>;
        setEvent({ id: eventDoc.id, ...eventData });
        
        // Check if user is attending
        if (user) {
          setIsAttending(eventData.attendees.includes(user.uid));
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id, user]);

  const handleAttendEvent = async () => {
    if (!user || !event) return;
    
    // TODO: Implement attend/unattend functionality
    // This would update the attendees array in the event document
    console.log('Toggle attendance for event:', event.id);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Cargando evento...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">{error || 'Evento no encontrado'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                  <p className="text-muted-foreground">{event.category}</p>
                </div>
                {event.flyerUrl && (
                  <img 
                    src={event.flyerUrl} 
                    alt={event.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Fecha y Hora</h4>
                  <p>{event.date?.toDate()?.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Ubicación</h4>
                  <p>{event.address}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Asistentes</h4>
                  <p>{event.attendeesCount || event.attendees.length} personas</p>
                </div>
                {user && (
                  <Button 
                    onClick={handleAttendEvent}
                    variant={isAttending ? "outline" : "default"}
                    className="w-full"
                  >
                    {isAttending ? 'Dejar de asistir' : 'Asistir al evento'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Section */}
          <Card>
            <CardHeader>
              <CardTitle>Chat del Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <EventChat eventId={event.id} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/profile/${event.createdBy}`)}
              >
                Ver Organizador
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // TODO: Share functionality
                  navigator.clipboard.writeText(window.location.href);
                  alert('Enlace copiado al portapapeles');
                }}
              >
                Compartir Evento
              </Button>
            </CardContent>
          </Card>

          {!user && (
            <Card>
              <CardHeader>
                <CardTitle>Únete a la conversación</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Inicia sesión para participar en el chat y unirte a este evento.
                </p>
                <Button 
                  className="w-full"
                  onClick={() => router.push('/auth/login')}
                >
                  Iniciar Sesión
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
