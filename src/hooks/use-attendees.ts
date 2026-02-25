import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  confirmAttendance,
  cancelAttendance,
  getEventAttendees,
  isUserAttendee,
  getAttendeeStats,
  type Attendee,
  type AttendeeStats,
} from '@/lib/firebase/attendees';
import { useToast } from './use-toast';

export function useAttendees(eventId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [stats, setStats] = useState<AttendeeStats | null>(null);
  const [isAttending, setIsAttending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  // Cargar asistentes al montar
  useEffect(() => {
    if (!eventId) return;

    const loadAttendees = async () => {
      try {
        setIsLoading(true);
        const [attendeesList, userIsAttending, attendeeStats] = await Promise.all([
          getEventAttendees(eventId),
          user ? isUserAttendee(eventId, user.uid) : false,
          getAttendeeStats(eventId),
        ]);

        setAttendees(attendeesList.filter(a => a.status === 'confirmed'));
        setIsAttending(userIsAttending);
        setStats(attendeeStats);
      } catch (error) {
        console.error('Error loading attendees:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los asistentes',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAttendees();
  }, [eventId, user?.uid]);

  // Confirmar asistencia
  const handleConfirmAttendance = async () => {
    if (!user || !eventId) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para registrarte',
        variant: 'destructive',
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
      setStats(prev => prev ? { ...prev, confirmed: prev.confirmed + 1, total: prev.total + 1 } : null);

      toast({
        title: '¡Registro exitoso!',
        description: 'Te has registrado correctamente en el evento',
      });
    } catch (error) {
      console.error('Error confirming attendance:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo confirmar la asistencia',
        variant: 'destructive',
      });
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
    stats,
    isAttending,
    isLoading,
    isConfirming,
    confirmAttendance: handleConfirmAttendance,
    cancelAttendance: handleCancelAttendance,
  };
}
