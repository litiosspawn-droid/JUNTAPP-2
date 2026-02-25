'use client';
import { useEffect, useState, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Header, Footer } from "@/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyPreset } from '@/components/ui/empty';
import { Calendar, MapPin, Users, Globe, Edit } from 'lucide-react';
import { EventCard } from '@/components/event-card';
import type { Event } from '@/lib/firebase/events';
import type { UserProfile } from '@/lib/firebase/auth';

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = user?.uid === resolvedParams.id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', resolvedParams.id));
        
        // Si el usuario no existe, crear un perfil básico
        if (!userDoc.exists()) {
          // El usuario no tiene documento en Firestore, usar datos básicos
          setProfile({
            uid: resolvedParams.id,
            displayName: 'Usuario',
            email: '',
            photoURL: null,
            bio: '',
            location: '',
            website: '',
            banned: false,
            role: 'user',
            createdAt: null,
            updatedAt: null,
          });
        } else {
          const userData = userDoc.data() as UserProfile;
          setProfile(userData);
        }

        // Fetch created events
        let createdEventsList: Event[] = [];
        try {
          const createdEventsQuery = query(
            collection(db, 'events'),
            where('createdBy', '==', resolvedParams.id)
          );
          const createdEventsSnapshot = await getDocs(createdEventsQuery);
          createdEventsList = createdEventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Event[];
          // Ordenar por fecha en JavaScript
          createdEventsList.sort((a, b) => new Date(b.date + 'T' + (b.time || '00:00')).getTime() - new Date(a.date + 'T' + (a.time || '00:00')).getTime());
        } catch (error: any) {
          console.warn('Error fetching created events (index building):', error.message);
          // Fallback: fetch all events and filter in memory
          const allEventsQuery = query(collection(db, 'events'));
          const allEventsSnapshot = await getDocs(allEventsQuery);
          createdEventsList = allEventsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Event))
            .filter(event => event.createdBy === resolvedParams.id)
            .sort((a, b) => new Date(b.date + 'T' + (b.time || '00:00')).getTime() - new Date(a.date + 'T' + (a.time || '00:00')).getTime());
        }
        setCreatedEvents(createdEventsList);

        // Fetch attending events
        let attendingEventsList: Event[] = [];
        try {
          const attendingEventsQuery = query(
            collection(db, 'events'),
            where('attendees', 'array-contains', resolvedParams.id)
          );
          const attendingEventsSnapshot = await getDocs(attendingEventsQuery);
          attendingEventsList = attendingEventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Event[];
          // Ordenar por fecha en JavaScript
          attendingEventsList.sort((a, b) => new Date(b.date + 'T' + (b.time || '00:00')).getTime() - new Date(a.date + 'T' + (a.time || '00:00')).getTime());
        } catch (error: any) {
          console.warn('Error fetching attending events (index building):', error.message);
          // Fallback: fetch all events and filter in memory
          const allEventsQuery = query(collection(db, 'events'));
          const allEventsSnapshot = await getDocs(allEventsQuery);
          attendingEventsList = allEventsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Event))
            .filter(event => Array.isArray(event.attendees) && event.attendees.includes(resolvedParams.id))
            .sort((a, b) => new Date(b.date + 'T' + (b.time || '00:00')).getTime() - new Date(a.date + 'T' + (a.time || '00:00')).getTime());
        }
        setAttendingEvents(attendingEventsList);

      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Profile header skeleton */}
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 text-center">
                    <Skeleton className="h-8 w-12 mx-auto mb-2" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Events skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...Array(3)].map((_, j) => (
                        <Skeleton key={j} className="h-48" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <EmptyPreset
            preset="no-data"
            title="Perfil no encontrado"
            description={error || 'El perfil que buscas no existe o ha sido eliminado.'}
            actionLabel="Volver al inicio"
            onAction={() => router.push('/')}
            className="max-w-md"
          />
        </main>
        <Footer />
      </div>
    );
  }

  const createdAt = profile?.createdAt ? (profile.createdAt.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt)) : new Date();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header del perfil */}
          <div className="bg-card rounded-lg p-6 mb-8 border">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.photoURL} />
                <AvatarFallback className="text-2xl">
                  {profile.displayName?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-bold">{profile.displayName || 'Usuario'}</h1>
                </div>

                <p className="text-muted-foreground mb-3">{profile.email}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Miembro desde {createdAt.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <Button onClick={() => router.push('/profile/edit')} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Editar perfil
                </Button>
              )}
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{createdEvents.length}</div>
                <div className="text-sm text-muted-foreground">Eventos creados</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{attendingEvents.length}</div>
                <div className="text-sm text-muted-foreground">Eventos asistiendo</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {createdEvents.reduce((sum, event) => sum + (event.attendees || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Asistentes totales</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {new Set(createdEvents.map(e => e.category).filter(Boolean)).size}
                </div>
                <div className="text-sm text-muted-foreground">Categorías exploradas</div>
              </CardContent>
            </Card>
          </div>

          {/* Eventos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Eventos creados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Eventos creados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {createdEvents.length === 0 ? (
                  <EmptyPreset
                    preset="no-events"
                    title="Sin eventos creados"
                    description={isOwnProfile ? "¡Crea tu primer evento!" : "Este usuario aún no ha creado eventos."}
                    actionLabel={isOwnProfile ? 'Crear evento' : undefined}
                    onAction={() => router.push('/crear')}
                    className="py-8"
                  />
                ) : (
                  <div className="space-y-4">
                    {createdEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Eventos asistiendo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Eventos asistiendo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendingEvents.length === 0 ? (
                  <EmptyPreset
                    preset="no-data"
                    title="Sin eventos"
                    description={isOwnProfile ? "Explora eventos y confirma tu asistencia" : "Este usuario no está asistiendo a ningún evento."}
                    actionLabel={isOwnProfile ? 'Explorar eventos' : undefined}
                    onAction={() => router.push('/')}
                    className="py-8"
                  />
                ) : (
                  <div className="space-y-4">
                    {attendingEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
