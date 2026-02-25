/**
 * Firebase Cloud Functions para JuntApp
 * 
 * Funciones:
 * - recordatoriosEventos: Envía recordatorios 24hs antes del evento
 * - notificarNuevosAsistentes: Notifica al organizador cuando alguien se registra
 * - limpiarNotificacionesViejas: Limpia notificaciones de más de 30 días
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Inicializar Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Scheduled Function: Enviar recordatorios 24 horas antes de los eventos
 * Se ejecuta cada hora
 */
export const recordatoriosEventos = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async () => {
    console.log('🔔 Iniciando envío de recordatorios de eventos...');

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);
    tomorrow.setHours(0, 0, 0, 0);

    console.log('📅 Buscando eventos entre:', tomorrow.toISOString(), 'y', tomorrowEnd.toISOString());

    try {
      // Buscar eventos en las próximas 24 horas
      const eventsSnapshot = await db.collection('events')
        .where('date', '>=', tomorrow.toISOString().split('T')[0])
        .where('date', '<=', tomorrowEnd.toISOString().split('T')[0])
        .where('status', '==', 'active')
        .get();

      if (eventsSnapshot.empty) {
        console.log('✅ No hay eventos en las próximas 24 horas');
        return null;
      }

      console.log(`📋 Encontrados ${eventsSnapshot.size} eventos`);

      let totalNotified = 0;

      // Procesar cada evento
      for (const eventDoc of eventsSnapshot.docs) {
        const event = eventDoc.data();
        const eventId = eventDoc.id;

        console.log(`📍 Procesando evento: ${event.title}`);

        // Obtener asistentes confirmados
        const attendeesSnapshot = await db.collection('attendees')
          .where('eventId', '==', eventId)
          .where('status', '==', 'confirmed')
          .get();

        if (attendeesSnapshot.empty) {
          console.log(`  ⚠️ Sin asistentes confirmados`);
          continue;
        }

        console.log(`  👥 ${attendeesSnapshot.size} asistentes confirmados`);

        // Enviar recordatorio a cada asistente
        for (const attendeeDoc of attendeesSnapshot.docs) {
          const attendee = attendeeDoc.data();
          const userId = attendee.userId;

          // Verificar si ya recibió recordatorio
          const existingReminder = await db.collection('notifications')
            .where('eventId', '==', eventId)
            .where('userId', '==', userId)
            .where('type', '==', 'event_reminder_24h')
            .limit(1)
            .get();

          if (!existingReminder.empty) {
            console.log(`  ℹ️ Usuario ${userId} ya recibió recordatorio`);
            continue;
          }

          // Crear notificación en Firestore
          await db.collection('notifications').add({
            userId,
            eventId,
            type: 'event_reminder_24h',
            title: '¡Recordatorio de Evento!',
            message: `Mañana es "${event.title}" a las ${event.time || ''}. ¡No te lo pierdas!`,
            eventTitle: event.title,
            eventDate: event.date,
            eventTime: event.time,
            eventAddress: event.address,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Intentar enviar push notification
          try {
            const userDoc = await db.collection('users').doc(userId).get();
            const user = userDoc.data();

            if (user?.pushToken) {
              await messaging.send({
                token: user.pushToken,
                notification: {
                  title: '¡Recordatorio de Evento!',
                  body: `Mañana es "${event.title}" a las ${event.time}`,
                },
                data: {
                  eventId,
                  type: 'event_reminder_24h',
                },
              });
              console.log(`  ✅ Push enviado a ${userId}`);
            }
          } catch (error) {
            console.error(`  ⚠️ Error enviando push a ${userId}:`, error);
          }

          totalNotified++;
        }
      }

      console.log(`✅ Recordatorios completados. Total notificados: ${totalNotified}`);
      return null;
    } catch (error) {
      console.error('❌ Error en recordatorios:', error);
      return null;
    }
  });

/**
 * Scheduled Function: Enviar resumen semanal de eventos
 * Se ejecuta todos los lunes a las 9 AM
 */
export const resumenSemanal = functions.pubsub
  .schedule('0 9 * * MON')
  .onRun(async () => {
    console.log('📊 Generando resumen semanal de eventos...');

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    try {
      // Obtener todos los usuarios
      const usersSnapshot = await db.collection('users').get();
      
      let totalSent = 0;

      for (const userDoc of usersSnapshot.docs) {
        const user = userDoc.data();
        const userId = userDoc.id;

        // Skip si no quiere notificaciones
        if (user.notificationsEnabled === false) {
          continue;
        }

        // Buscar eventos de la próxima semana en su zona (radio 50km)
        // Esto es simplificado - en producción usar geohash
        const eventsSnapshot = await db.collection('events')
          .where('date', '>=', now.toISOString().split('T')[0])
          .where('date', '<=', nextWeek.toISOString().split('T')[0])
          .where('status', '==', 'active')
          .limit(5)
          .get();

        if (eventsSnapshot.empty) {
          continue;
        }

        const eventList = eventsSnapshot.docs.map(doc => {
          const event = doc.data();
          return `- ${event.title} (${event.date})`;
        }).join('\n');

        // Crear notificación
        await db.collection('notifications').add({
          userId,
          type: 'weekly_summary',
          title: '🎉 Eventos esta semana',
          message: `Hay ${eventsSnapshot.size} eventos interesantes:\n\n${eventList}`,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        totalSent++;
      }

      console.log(`✅ Resumen semanal enviado a ${totalSent} usuarios`);
      return null;
    } catch (error) {
      console.error('❌ Error en resumen semanal:', error);
      return null;
    }
  });

/**
 * Trigger: Notificar al organizador cuando alguien se registra
 */
export const notificarNuevoAsistente = functions.firestore
  .document('attendees/{attendeeId}')
  .onCreate(async (snap, context) => {
    const attendee = snap.data();
    
    if (attendee.status !== 'confirmed') {
      return null;
    }

    try {
      // Obtener evento
      const eventDoc = await db.collection('events').doc(attendee.eventId).get();
      const event = eventDoc.data();

      if (!event) {
        return null;
      }

      // Notificar al organizador
      await db.collection('notifications').add({
        userId: event.createdBy,
        eventId: attendee.eventId,
        type: 'new_attendee',
        title: '¡Nuevo asistente!',
        message: `${attendee.userName} se registró en "${event.title}"`,
        attendeeName: attendee.userName,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Organizador notificado de nuevo asistente`);
      return null;
    } catch (error) {
      console.error('❌ Error notificando organizador:', error);
      return null;
    }
  });

/**
 * Trigger: Notificar cuando hay un lugar disponible (de waitlist)
 */
export const notificarLugarDisponible = functions.firestore
  .document('attendees/{attendeeId}')
  .onDelete(async (snap, context) => {
    const deletedAttendee = snap.data();
    
    if (deletedAttendee.status !== 'confirmed') {
      return null;
    }

    try {
      // Obtener evento
      const eventDoc = await db.collection('events').doc(deletedAttendee.eventId).get();
      const event = eventDoc.data();

      if (!event || !event.maxAttendees) {
        return null;
      }

      // Buscar alguien en waitlist
      const waitlistSnapshot = await db.collection('attendees')
        .where('eventId', '==', deletedAttendee.eventId)
        .where('status', '==', 'waitlist')
        .orderBy('joinedAt', 'asc')
        .limit(1)
        .get();

      if (waitlistSnapshot.empty) {
        return null;
      }

      const waitlistUser = waitlistSnapshot.docs[0].data();

      // Notificar al primero en waitlist
      await db.collection('notifications').add({
        userId: waitlistUser.userId,
        eventId: deletedAttendee.eventId,
        type: 'spot_available',
        title: '¡Lugar disponible!',
        message: `Se liberó un lugar para "${event.title}". ¡Registrate ahora!`,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Notificado usuario en waitlist`);
      return null;
    } catch (error) {
      console.error('❌ Error notificando waitlist:', error);
      return null;
    }
  });

/**
 * Scheduled Function: Limpiar notificaciones viejas (> 30 días)
 * Se ejecuta todos los días a las 3 AM
 */
export const limpiarNotificacionesViejas = functions.pubsub
  .schedule('0 3 * * *')
  .onRun(async () => {
    console.log('🧹 Limpiando notificaciones viejas...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const oldNotifications = await db.collection('notifications')
        .where('createdAt', '<', thirtyDaysAgo)
        .limit(1000)
        .get();

      const batch = db.batch();
      oldNotifications.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`✅ Eliminadas ${oldNotifications.size} notificaciones viejas`);
      return null;
    } catch (error) {
      console.error('❌ Error limpiando notificaciones:', error);
      return null;
    }
  });

/**
 * API Endpoint: Enviar recordatorio manual (para testing)
 */
export const enviarRecordatorioManual = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado');
  }

  const { eventId } = data;

  if (!eventId) {
    throw new functions.https.HttpsError('invalid-argument', 'eventId requerido');
  }

  try {
    const eventDoc = await db.collection('events').doc(eventId).get();
    const event = eventDoc.data();

    if (!event) {
      throw new functions.https.HttpsError('not-found', 'Evento no encontrado');
    }

    // Verificar permisos
    if (event.createdBy !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'No tenés permisos');
    }

    // Obtener asistentes
    const attendeesSnapshot = await db.collection('attendees')
      .where('eventId', '==', eventId)
      .where('status', '==', 'confirmed')
      .get();

    let sent = 0;

    for (const attendeeDoc of attendeesSnapshot.docs) {
      const attendee = attendeeDoc.data();

      await db.collection('notifications').add({
        userId: attendee.userId,
        eventId,
        type: 'manual_reminder',
        title: `Recordatorio de ${event.title}`,
        message: `El organizador te recuerda: ${event.title} es el ${event.date} a las ${event.time}`,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      sent++;
    }

    console.log(`✅ Recordatorio manual enviado a ${sent} personas`);
    return { success: true, sent };
  } catch (error) {
    console.error('❌ Error en recordatorio manual:', error);
    throw new functions.https.HttpsError('internal', 'Error enviando recordatorio');
  }
});
