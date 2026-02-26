'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyPreset } from '@/components/ui/empty';
import { useParams } from 'next/navigation';
import EventChat from '@/components/chat/EventChat';
import { useAttendees } from '@/hooks/use-attendees';
import { useUnifiedToast } from '@/hooks/use-unified-toast';
import {
  Calendar,
  MapPin,
  Users,
  Share2,
  User,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Circle,
  AlertCircle,
  Edit,
  Trash2,
  ZoomIn
} from 'lucide-react';
import { CATEGORY_COLORS } from '@/lib/firebase/events';

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
  time?: string;
  tags?: string[];
}

export default function EventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const toast = useUnifiedToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const {
    attendees,
    stats,
    isAttending,
    isLoading: isAttendeesLoading,
    isConfirming,
    confirmAttendance,
    cancelAttendance,
  } = useAttendees(id);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', id));
        if (!eventDoc.exists()) {
          setError('Evento no encontrado');
          return;
        }

        const eventData = eventDoc.data() as any;

        // Normalizar datos del evento (manejar creatorId vs createdBy)
        const normalizedEvent: Event = {
          id: eventDoc.id,
          title: eventData.title || 'Sin título',
          description: eventData.description || '',
          date: eventData.date,
          address: eventData.address || eventData.location?.address || 'Ubicación no especificada',
          flyerUrl: eventData.flyerUrl,
          category: eventData.category || 'Otros',
          createdBy: eventData.createdBy || eventData.creatorId || '',
          attendees: eventData.attendees || [],
          attendeesCount: eventData.attendeesCount || 0,
          time: eventData.time,
          tags: eventData.tags || [],
        };

        setEvent(normalizedEvent);
        
        // Check if current user is the creator
        if (user && (eventData.createdBy === user.uid || eventData.creatorId === user.uid)) {
          setIsCreator(true);
        }
      } catch (error: any) {
        console.error('Error fetching event:', error);
        setError(error.message || 'Error al cargar el evento');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  const handleToggleAttendance = async () => {
    if (isAttending) {
      await cancelAttendance();
      toast.success('Asistencia cancelada', {
        description: 'Ya no estás confirmado para este evento',
      });
    } else {
      await confirmAttendance();
      toast.success('¡Asistencia confirmada!', {
        description: 'Te has unido al evento exitosamente',
      });
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    
    if (!confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { deleteEvent } = await import('@/lib/firebase/events');
      await deleteEvent(id, user.uid);
      toast.success('Evento eliminado', {
        description: 'El evento ha sido eliminado correctamente',
      });
      router.push('/');
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error('Error al eliminar', {
        description: error.message || 'No se pudo eliminar el evento',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/events/${id}/edit`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado', {
        description: 'El enlace del evento ha sido copiado al portapapeles',
      });
    } catch {
      toast.error('Error al copiar', {
        description: 'No se pudo copiar el enlace',
      });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Fecha no disponible';
    const dateObj = typeof date === 'string' ? new Date(date) : date.toDate?.();
    return dateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: any, time?: string) => {
    if (time) return time;
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date.toDate?.();
    return dateObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
        {/* Hero skeleton */}
        <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden bg-muted">
          <Skeleton className="absolute inset-0 h-full w-full" />
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button variant="ghost" className="mb-6 gap-2" disabled>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6 md:p-8">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Separator />
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="h-64">
                  <Skeleton className="h-full w-full" />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar skeleton */}
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-24" />
                  </CardHeader>
                  <CardContent className="h-20">
                    <Skeleton className="h-full w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <EmptyPreset
          preset="no-data"
          title="Evento no encontrado"
          description={error || 'El evento que buscas no existe o ha sido eliminado.'}
          actionLabel="Volver al inicio"
          onAction={() => router.push('/')}
          className="max-w-md"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      {/* Hero Section with Flyer */}
      {event.flyerUrl && (
        <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden group cursor-pointer" onClick={() => setShowFullImage(true)}>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
          <img
            src={event.flyerUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <div className="container mx-auto max-w-6xl">
              <Badge className={`${CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS] ?? CATEGORY_COLORS["Otros"]} mb-3`}>
                {event.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                {event.title}
              </h1>
            </div>
          </div>
          
          {/* Ver flyer completo button */}
          <div className="absolute top-4 right-4 z-30">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullImage(true);
              }}
            >
              <ZoomIn className="h-4 w-4" />
              Ver imagen completa
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        {!event.flyerUrl && (
          <div className="mb-6">
            <Badge className={`${CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS] ?? CATEGORY_COLORS["Otros"]} mb-3`}>
              {event.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
          </div>
        )}

        {/* Creator Actions */}
        {isCreator && (
          <div className="mb-6 flex gap-2">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar Evento
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Eliminando...' : 'Eliminar Evento'}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info Card */}
            <Card className="overflow-hidden border-2 shadow-lg">
              <CardContent className="p-6 md:p-8">
                {/* Description */}
                {event.description && (
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Descripción
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                )}

                <Separator className="mb-6" />

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Date */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-5 w-5" />
                      <span className="text-sm font-medium">Fecha</span>
                    </div>
                    <p className="text-base pl-7">{formatDate(event.date)}</p>
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-5 w-5" />
                      <span className="text-sm font-medium">Hora</span>
                    </div>
                    <p className="text-base pl-7">{formatTime(event.date, event.time)}</p>
                  </div>

                  {/* Location */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                      <span className="text-sm font-medium">Ubicación</span>
                    </div>
                    <p className="text-base pl-7">{event.address}</p>
                  </div>
                </div>

                {/* Attendees Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {stats?.confirmed || 0} {stats?.confirmed === 1 ? 'persona confirmada' : 'personas confirmadas'}
                    </span>
                  </div>

                  {isAttendeesLoading ? (
                    <p className="text-sm text-muted-foreground">Cargando asistentes...</p>
                  ) : attendees.length > 0 ? (
                    <div className="flex -space-x-2">
                      {attendees.slice(0, 15).map((attendee) => (
                        <Avatar 
                          key={attendee.id} 
                          className="h-10 w-10 border-2 border-background ring-2 ring-muted transition-transform hover:scale-110 hover:z-10"
                        >
                          <AvatarImage src={attendee.userPhotoURL} alt={attendee.userName} />
                          <AvatarFallback className="text-sm font-medium">
                            {attendee.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {attendees.length > 15 && (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium border-2 border-background ring-2 ring-muted">
                          +{attendees.length - 15}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">¡Sé el primero en asistir!</p>
                  )}
                </div>

                {/* CTA Button */}
                {user && (
                  <div className="mt-8">
                    <Button
                      onClick={handleToggleAttendance}
                      variant={isAttending ? "outline" : "default"}
                      className="w-full h-12 text-base font-medium gap-2"
                      disabled={isConfirming}
                      size="lg"
                    >
                      {isConfirming ? (
                        <span className="animate-spin">⏳</span>
                      ) : isAttending ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                      {isAttending ? 'Ya voy a asistir' : 'Confirmar asistencia'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Section */}
            {user && (
              <Card className="overflow-hidden border-2 shadow-lg">
                <CardHeader className="bg-muted/50 border-b">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle>Chat del Evento</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <EventChat 
                    eventId={event.id} 
                    attendees={attendees.map(a => a.userId)} 
                    creatorId={event.createdBy} 
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer Card */}
            <Card className="overflow-hidden border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Organizador</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => router.push(`/profile/${event.createdBy}`)}
                >
                  <User className="h-4 w-4" />
                  Ver perfil del organizador
                </Button>
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card className="overflow-hidden border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Compartir</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  Copiar enlace
                </Button>
              </CardContent>
            </Card>

            {/* Tags */}
            {event.tags && Array.isArray(event.tags) && event.tags.length > 0 && (
              <Card className="overflow-hidden border-2 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                  <CardTitle className="text-base">Etiquetas</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Login Prompt */}
            {!user && (
              <Card className="overflow-hidden border-2 shadow-lg bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-primary opacity-50" />
                  <h3 className="font-semibold mb-2">Únete a la conversación</h3>
                  <p className="text-sm text-muted-foreground mb-4">
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

      {/* Full Image Modal */}
      {showFullImage && event.flyerUrl && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFullImage(false)}
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-6 w-6 rotate-45" />
            </Button>
            <img
              src={event.flyerUrl}
              alt={event.title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
