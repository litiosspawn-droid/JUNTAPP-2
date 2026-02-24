'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: any;
}

interface Event {
  id: string;
  title: string;
  date: any;
  address: string;
  flyerUrl?: string;
  category: string;
  createdBy: string;
  attendees: string[];
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = user?.uid === params.id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', params.id));
        if (!userDoc.exists()) {
          setError('Usuario no encontrado');
          return;
        }
        
        const userData = userDoc.data() as UserProfile;
        setProfile(userData);

        // Fetch created events
        const createdEventsQuery = query(
          collection(db, 'events'),
          where('createdBy', '==', params.id),
          orderBy('date', 'desc')
        );
        const createdEventsSnapshot = await getDocs(createdEventsQuery);
        const createdEventsList = createdEventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        setCreatedEvents(createdEventsList);

        // Fetch attending events
        const attendingEventsQuery = query(
          collection(db, 'events'),
          where('attendees', 'array-contains', params.id),
          orderBy('date', 'desc')
        );
        const attendingEventsSnapshot = await getDocs(attendingEventsQuery);
        const attendingEventsList = attendingEventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        setAttendingEvents(attendingEventsList);

      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Cargando perfil...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">{error || 'Usuario no encontrado'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-4">
            {profile.photoURL ? (
              <img 
                src={profile.photoURL} 
                alt={profile.displayName}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-2xl text-gray-600">
                  {profile.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <CardTitle className="text-2xl">{profile.displayName}</CardTitle>
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-sm text-muted-foreground">
                Miembro desde {profile.createdAt?.toDate()?.toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Created Events */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Creados ({createdEvents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {createdEvents.length === 0 ? (
              <p className="text-muted-foreground">No ha creado ningún evento</p>
            ) : (
              <div className="space-y-3">
                {createdEvents.map((event) => (
                  <div key={event.id} className="border rounded p-3">
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{event.address}</p>
                    <p className="text-sm">
                      {event.date?.toDate()?.toLocaleDateString()}
                    </p>
                    {event.flyerUrl && (
                      <img 
                        src={event.flyerUrl} 
                        alt={event.title}
                        className="mt-2 w-full h-32 object-cover rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attending Events */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Asistiendo ({attendingEvents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {attendingEvents.length === 0 ? (
              <p className="text-muted-foreground">No asiste a ningún evento</p>
            ) : (
              <div className="space-y-3">
                {attendingEvents.map((event) => (
                  <div key={event.id} className="border rounded p-3">
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">{event.address}</p>
                    <p className="text-sm">
                      {event.date?.toDate()?.toLocaleDateString()}
                    </p>
                    {event.flyerUrl && (
                      <img 
                        src={event.flyerUrl} 
                        alt={event.title}
                        className="mt-2 w-full h-32 object-cover rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isOwnProfile && (
        <div className="mt-6 flex justify-center">
          <Button onClick={() => router.push('/events/create')}>
            Crear Nuevo Evento
          </Button>
        </div>
      )}
    </div>
  );
}
