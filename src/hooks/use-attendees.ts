import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  confirmAttendance,
  cancelAttendance,
  getEventAttendees,
  isUserAttendee,
  getAttendeeStats,
  joinWaitlist,
  leaveWaitlist,
  type Attendee,
  type AttendeeStats,
} from '@/lib/firebase/attendees';
import { useUnifiedToast } from './use-unified-toast';

interface UseAttendeesOptions {
  maxAttendees?: number
}

export function useAttendees(eventId: string, options: UseAttendeesOptions = {}) {
  const { user } = useAuth();
  const toast = useUnifiedToast();
  const { maxAttendees } = options;
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [waitlist, setWaitlist] = useState<Attendee[]>([]);
  const [stats, setStats] = useState<AttendeeStats | null>(null);
  const [isAttending, setIsAttending] = useState(false);
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isEventFull, setIsEventFull] = useState(false);
  const [availableSpots, setAvailableSpots] = useState(0);

  // Cargar asistentes al montar
  useEffect(() => {
    if (!eventId) return;

    const loadAttendees = async () => {
      try {
        setIsLoading(true);
        const [attendeesList, userIsAttending, attendeeStats, userIsOnWaitlist] = await Promise.all([
          getEventAttendees(eventId),
          user ? isUserAttendee(eventId, user.uid) : false,
          getAttendeeStats(eventId),
          user ? isUserAttendee(eventId, user.uid, 'waitlist') : false,
        ]);

        const confirmed = attendeesList.filter(a => a.status === 'confirmed');
        const waitlisted = attendeesList.filter(a => a.status === 'waitlist');
        
        setAttendees(confirmed);
        setWaitlist(waitlisted);
        setIsAttending(userIsAttending);
        setIsOnWaitlist(userIsOnWaitlist);
        setStats(attendeeStats);

        // Calcular lugares disponibles
        if (maxAttendees) {
          const spots = maxAttendees - attendeeStats.confirmed;
          setAvailableSpots(Math.max(0, spots));
          setIsEventFull(spots <= 0);
        } else {
          setIsEventFull(false);
          setAvailableSpots(Infinity);
        }
      } catch (error) {
        console.error('Error loading attendees:', error);
        toast.error('Error al cargar asistentes');
      } finally {
        setIsLoading(false);
      }
    };

    loadAttendees();
  }, [eventId, user?.uid, maxAttendees]);

  // Confirmar asistencia
  const handleConfirmAttendance = async () => {
    if (!user || !eventId) {
      toast.error('Debes iniciar sesión para registrarte');
      return;
    }

    // Verificar si está lleno
    if (isEventFull && !isOnWaitlist) {
      toast.warning('Evento completo', {
        description: 'No hay más lugares disponibles. ¿Querés unirte a la lista de espera?',
        action: {
          label: 'Unirme',
          onClick: handleJoinWaitlist,
        },
      });
      return;
    }

    try {
      setIsConfirming(true);
      await confirmAttendance(
        eventId,
        user.uid,
        user.displayName || 'Usuario',
        user.photoURL || undefined
      );

      setIsAttending(true);
      setStats(prev => prev ? { ...prev, confirmed: prev.confirmed + 1 } : null);
      setAvailableSpots(prev => Math.max(0, prev - 1));

      toast.success('¡Registro exitoso!', {
        description: 'Te has registrado correctamente en el evento',
      });
    } catch (error) {
      console.error('Error confirming attendance:', error);
      toast.error('Error al confirmar asistencia');
    } finally {
      setIsConfirming(false);
    }
  };

  // Unirse a lista de espera
  const handleJoinWaitlist = async () => {
    if (!user || !eventId) {
      toast.error('Debes iniciar sesión');
      return;
    }

    try {
      setIsConfirming(true);
      await joinWaitlist(
        eventId,
        user.uid,
        user.displayName || 'Usuario',
        user.photoURL || undefined
      );

      setIsOnWaitlist(true);
      toast.success('Te uniste a la lista de espera', {
        description: 'Te avisaremos si se libera un lugar',
      });
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast.error('Error al unirse a la lista de espera');
    } finally {
      setIsConfirming(false);
    }
  };

  // Salir de lista de espera
  const handleLeaveWaitlist = async () => {
    if (!user || !eventId) return;

    try {
      setIsConfirming(true);
      await leaveWaitlist(eventId, user.uid);

      setIsOnWaitlist(false);
      toast.info('Saliste de la lista de espera');
    } catch (error) {
      console.error('Error leaving waitlist:', error);
      toast.error('Error al salir de la lista de espera');
    } finally {
      setIsConfirming(false);
    }
  };

  // Cancelar asistencia
  const handleCancelAttendance = async () => {
    if (!user || !eventId) return;

    try {
      setIsConfirming(true);
      await cancelAttendance(eventId, user.uid);

      setIsAttending(false);
      setStats(prev => prev ? { ...prev, confirmed: prev.confirmed - 1, total: prev.total - 1 } : null);

      toast({
        title: 'Registro cancelado',
        description: 'Se ha cancelado tu registro en el evento',
      });
    } catch (error) {
      console.error('Error cancelling attendance:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo cancelar la asistencia',
        variant: 'destructive',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return {
    attendees,
    waitlist,
    stats,
    isAttending,
    isOnWaitlist,
    isLoading,
    isConfirming,
    isEventFull,
    availableSpots,
    maxAttendees,
    confirmAttendance: handleConfirmAttendance,
    cancelAttendance: handleCancelAttendance,
    joinWaitlist: handleJoinWaitlist,
    leaveWaitlist: handleLeaveWaitlist,
  };
}
