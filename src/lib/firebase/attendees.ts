import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, Timestamp, getDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from './client';

export interface Attendee {
  id?: string;
  eventId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'waitlist';
  joinedAt?: Timestamp;
  role?: 'attendee' | 'organizer';
}

export interface AttendeeStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

/**
 * Confirmar asistencia a un evento
 */
export const confirmAttendance = async (eventId: string, userId: string, userName: string, userPhotoURL?: string): Promise<string> => {
  try {
    console.log('[Attendees] Confirmando asistencia:', { eventId, userId, userName });

    // Verificar si ya está registrado (usando un solo where para evitar índices)
    const q = query(
      collection(db, 'attendees'),
      where('eventId', '==', eventId)
    );
    const querySnapshot = await getDocs(q);

    // Buscar manualmente por userId
    let existingDoc: any = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().userId === userId) {
        existingDoc = doc;
      }
    });

    if (existingDoc) {
      const existingData = existingDoc.data();

      if (existingData.status === 'confirmed') {
        throw new Error('Ya estás registrado en este evento');
      }

      // Actualizar registro existente
      await updateDoc(doc(db, 'attendees', existingDoc.id), {
        status: 'confirmed',
        joinedAt: serverTimestamp(),
      });

      // Incrementar contador de asistentes
      await updateDoc(doc(db, 'events', eventId), {
        attendees: increment(1),
      });

      console.log('[Attendees] Asistencia actualizada:', existingDoc.id);
      return existingDoc.id;
    }

    // Crear nuevo registro
    const attendeeData: Omit<Attendee, 'id'> = {
      eventId,
      userId,
      userName,
      userPhotoURL: userPhotoURL || '',
      status: 'confirmed',
      joinedAt: serverTimestamp(),
      role: 'attendee',
    };

    console.log('[Attendees] Creando nuevo registro:', attendeeData);
    const docRef = await addDoc(collection(db, 'attendees'), attendeeData);
    console.log('[Attendees] Registro creado:', docRef.id);

    // Incrementar contador de asistentes
    await updateDoc(doc(db, 'events', eventId), {
      attendees: increment(1),
    });
    console.log('[Attendees] Contador actualizado');

    return docRef.id;
  } catch (error) {
    console.error('[Attendees] Error confirmando asistencia:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    throw new Error(`No se pudo confirmar la asistencia: ${errorMessage}`);
  }
};

/**
 * Cancelar asistencia a un evento
 */
export const cancelAttendance = async (eventId: string, userId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, 'attendees'),
      where('eventId', '==', eventId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No estás registrado en este evento');
    }

    // Buscar manualmente por userId
    let attendeeDoc: any = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().userId === userId) {
        attendeeDoc = doc;
      }
    });

    if (!attendeeDoc) {
      throw new Error('No estás registrado en este evento');
    }

    const attendeeData = attendeeDoc.data();

    if (attendeeData.status === 'cancelled') {
      return; // Ya está cancelado
    }

    // Actualizar estado
    await updateDoc(doc(db, 'attendees', attendeeDoc.id), {
      status: 'cancelled',
    });

    // Decrementar contador de asistentes
    await updateDoc(doc(db, 'events', eventId), {
      attendees: increment(-1),
    });
  } catch (error) {
    console.error('Error cancelling attendance:', error);
    throw new Error('No se pudo cancelar la asistencia');
  }
};

/**
 * Obtener todos los asistentes de un evento
 */
export const getEventAttendees = async (eventId: string): Promise<Attendee[]> => {
  try {
    const q = query(
      collection(db, 'attendees'),
      where('eventId', '==', eventId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Attendee));
  } catch (error) {
    console.error('Error getting attendees:', error);
    throw new Error('No se pudieron cargar los asistentes');
  }
};

/**
 * Obtener asistentes confirmados de un evento
 */
export const getConfirmedAttendees = async (eventId: string): Promise<Attendee[]> => {
  try {
    const q = query(
      collection(db, 'attendees'),
      where('eventId', '==', eventId)
    );
    const querySnapshot = await getDocs(q);

    // Filtrar manualmente por status
    return querySnapshot.docs
      .filter(doc => doc.data().status === 'confirmed')
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Attendee));
  } catch (error) {
    console.error('Error getting confirmed attendees:', error);
    throw new Error('No se pudieron cargar los asistentes confirmados');
  }
};

/**
 * Verificar si un usuario es asistente de un evento
 */
export const isUserAttendee = async (eventId: string, userId: string, status: 'confirmed' | 'waitlist' | 'any' = 'confirmed'): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'attendees'),
      where('eventId', '==', eventId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return false;

    // Buscar manualmente por userId
    let isAttendee = false;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId === userId) {
        if (status === 'any') {
          isAttendee = true;
        } else if (data.status === status) {
          isAttendee = true;
        }
      }
    });

    return isAttendee;
  } catch (error) {
    console.error('Error checking attendee status:', error);
    return false;
  }
};

/**
 * Obtener estadísticas de asistentes
 */
export const getAttendeeStats = async (eventId: string): Promise<AttendeeStats> => {
  try {
    const attendees = await getEventAttendees(eventId);

    return {
      total: attendees.length,
      confirmed: attendees.filter(a => a.status === 'confirmed').length,
      pending: attendees.filter(a => a.status === 'pending').length,
      cancelled: attendees.filter(a => a.status === 'cancelled').length,
    };
  } catch (error) {
    console.error('Error getting attendee stats:', error);
    return { total: 0, confirmed: 0, pending: 0, cancelled: 0 };
  }
};

/**
 * Obtener eventos donde un usuario es asistente
 */
export const getUserEvents = async (userId: string): Promise<Attendee[]> => {
  try {
    const q = query(
      collection(db, 'attendees'),
      where('userId', '==', userId),
      where('status', '==', 'confirmed')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Attendee));
  } catch (error) {
    console.error('Error getting user events:', error);
    throw new Error('No se pudieron cargar los eventos del usuario');
  }
};

/**
 * Eliminar un asistente (solo admin o creador del evento)
 */
export const removeAttendee = async (attendeeId: string, eventId: string): Promise<void> => {
  try {
    const attendeeRef = doc(db, 'attendees', attendeeId);
    const attendeeDoc = await getDoc(attendeeRef);

    if (!attendeeDoc.exists()) {
      throw new Error('Asistente no encontrado');
    }

    // Decrementar contador si estaba confirmado
    const attendeeData = attendeeDoc.data();
    if (attendeeData.status === 'confirmed') {
      await updateDoc(doc(db, 'events', eventId), {
        attendees: increment(-1),
      });
    }

    await deleteDoc(attendeeRef);
  } catch (error) {
    console.error('Error removing attendee:', error);
    throw new Error('No se pudo eliminar al asistente');
  }
};

/**
 * Unirse a la lista de espera de un evento
 */
export const joinWaitlist = async (eventId: string, userId: string, userName: string, userPhotoURL?: string): Promise<string> => {
  try {
    // Verificar si ya está en waitlist o confirmado
    const q = query(
      collection(db, 'attendees'),
      where('eventId', '==', eventId)
    );
    const querySnapshot = await getDocs(q);

    let existingDoc: any = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().userId === userId) {
        existingDoc = doc;
      }
    });

    if (existingDoc) {
      const data = existingDoc.data();
      if (data.status === 'waitlist') {
        throw new Error('Ya estás en la lista de espera');
      }
      if (data.status === 'confirmed') {
        throw new Error('Ya estás registrado en este evento');
      }

      // Actualizar registro existente
      await updateDoc(doc(db, 'attendees', existingDoc.id), {
        status: 'waitlist',
        joinedAt: serverTimestamp(),
      });

      return existingDoc.id;
    }

    // Crear nuevo registro en waitlist
    const attendeeData: Omit<Attendee, 'id'> = {
      eventId,
      userId,
      userName,
      userPhotoURL: userPhotoURL || '',
      status: 'waitlist',
      joinedAt: serverTimestamp(),
      role: 'attendee',
    };

    const docRef = await addDoc(collection(db, 'attendees'), attendeeData);
    return docRef.id;
  } catch (error) {
    console.error('[Waitlist] Error joining waitlist:', error);
    throw new Error('No se pudo unir a la lista de espera');
  }
};

/**
 * Salir de la lista de espera
 */
export const leaveWaitlist = async (eventId: string, userId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, 'attendees'),
      where('eventId', '==', eventId)
    );
    const querySnapshot = await getDocs(q);

    let attendeeDoc: any = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().userId === userId) {
        attendeeDoc = doc;
      }
    });

    if (!attendeeDoc) {
      throw new Error('No estás en la lista de espera');
    }

    const data = attendeeDoc.data();
    if (data.status !== 'waitlist') {
      throw new Error('No estás en la lista de espera');
    }

    await deleteDoc(doc(db, 'attendees', attendeeDoc.id));
  } catch (error) {
    console.error('[Waitlist] Error leaving waitlist:', error);
    throw new Error('No se pudo salir de la lista de espera');
  }
};

/**
 * Promover de waitlist a confirmado (cuando se libera un lugar)
 */
export const promoteFromWaitlist = async (eventId: string, userId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, 'attendees'),
      where('eventId', '==', eventId)
    );
    const querySnapshot = await getDocs(q);

    let attendeeDoc: any = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().userId === userId) {
        attendeeDoc = doc;
      }
    });

    if (!attendeeDoc) {
      throw new Error('Usuario no encontrado en waitlist');
    }

    const data = attendeeDoc.data();
    if (data.status !== 'waitlist') {
      throw new Error('El usuario no está en la lista de espera');
    }

    await updateDoc(doc(db, 'attendees', attendeeDoc.id), {
      status: 'confirmed',
    });

    await updateDoc(doc(db, 'events', eventId), {
      attendees: increment(1),
    });
  } catch (error) {
    console.error('[Waitlist] Error promoting from waitlist:', error);
    throw new Error('No se pudo promover al usuario');
  }
};

/**
 * Cancelar registro de asistente con validación de política
 * Esta función se exporta desde events.ts, pero la referenciamos aquí también
 */
export const cancelAttendeeRegistration = async (
  eventId: string,
  userId: string,
  policy?: 'flexible' | 'moderate' | 'strict' | 'custom',
  deadline?: string
): Promise<void> => {
  try {
    // Obtener evento para verificar política
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) {
      throw new Error('Evento no encontrado');
    }

    const eventData = eventDoc.data();
    
    // Verificar si puede cancelar (lógica simplificada, la completa está en events.ts)
    const now = new Date();
    const eventDate = new Date(eventData.date);
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    const cancellationPolicy = policy || eventData.cancellationPolicy || 'moderate';
    let canCancel = true;
    
    if (cancellationPolicy === 'flexible' && hoursUntilEvent < 2) {
      canCancel = false;
    } else if (cancellationPolicy === 'moderate' && hoursUntilEvent < 24) {
      canCancel = false;
    } else if (cancellationPolicy === 'strict' && hoursUntilEvent < 168) {
      canCancel = false;
    }
    
    if (!canCancel) {
      throw new Error('No se puede cancelar después del plazo establecido');
    }

    // Buscar registro del asistente
    const attendeesQuery = query(
      collection(db, 'attendees'),
      where('eventId', '==', eventId)
    );
    const querySnapshot = await getDocs(attendeesQuery);

    let attendeeDoc: any = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().userId === userId) {
        attendeeDoc = doc;
      }
    });

    if (!attendeeDoc) {
      throw new Error('No estás registrado en este evento');
    }

    // Actualizar estado a cancelled
    await updateDoc(doc(db, 'attendees', attendeeDoc.id), {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
    });

    // Decrementar contador si estaba confirmado
    if (attendeeDoc.data().status === 'confirmed') {
      await updateDoc(doc(db, 'events', eventId), {
        attendees: increment(-1),
      });
    }

    return;
  } catch (error) {
    console.error('Error cancelling registration:', error);
    throw new Error('No se pudo cancelar el registro');
  }
};
