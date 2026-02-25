import { messaging } from '@/lib/firebase/client';
import { getToken } from 'firebase/messaging';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  data?: Record<string, any>;
}

export interface NotificationOptions {
  userId: string;
  type: 'event_reminder' | 'chat_message' | 'new_event' | 'event_update';
  payload: NotificationPayload;
}

// Enviar notificación push a un usuario específico
export async function sendPushNotification(options: NotificationOptions): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

// Enviar notificación de recordatorio de evento
export async function sendEventReminder(
  userId: string,
  eventTitle: string,
  eventTime: string,
  eventId: string
): Promise<boolean> {
  const payload: NotificationPayload = {
    title: 'Recordatorio de evento',
    body: `${eventTitle} comienza en ${eventTime}`,
    icon: '/icon-192x192.png',
    tag: `event-${eventId}`,
    url: `/evento/${eventId}`,
    data: { eventId, type: 'reminder' },
  };

  return sendPushNotification({
    userId,
    type: 'event_reminder',
    payload,
  });
}

// Enviar notificación de nuevo mensaje en chat
export async function sendChatMessageNotification(
  userId: string,
  senderName: string,
  messagePreview: string,
  eventId: string
): Promise<boolean> {
  const payload: NotificationPayload = {
    title: `Mensaje de ${senderName}`,
    body: messagePreview.length > 50 ? `${messagePreview.substring(0, 47)}...` : messagePreview,
    icon: '/icon-192x192.png',
    tag: `chat-${eventId}`,
    url: `/evento/${eventId}?tab=chat`,
    data: { eventId, type: 'chat' },
  };

  return sendPushNotification({
    userId,
    type: 'chat_message',
    payload,
  });
}

// Enviar notificación de nuevo evento cercano
export async function sendNewEventNotification(
  userId: string,
  eventTitle: string,
  eventCategory: string,
  eventDistance: string,
  eventId: string
): Promise<boolean> {
  const payload: NotificationPayload = {
    title: 'Nuevo evento cerca de ti',
    body: `${eventTitle} (${eventCategory}) - ${eventDistance}`,
    icon: '/icon-192x192.png',
    tag: `new-event-${eventId}`,
    url: `/evento/${eventId}`,
    data: { eventId, type: 'new_event' },
  };

  return sendPushNotification({
    userId,
    type: 'new_event',
    payload,
  });
}

// Enviar notificación de actualización de evento
export async function sendEventUpdateNotification(
  userId: string,
  eventTitle: string,
  updateType: string,
  eventId: string
): Promise<boolean> {
  const payload: NotificationPayload = {
    title: 'Actualización de evento',
    body: `${eventTitle}: ${updateType}`,
    icon: '/icon-192x192.png',
    tag: `update-${eventId}`,
    url: `/evento/${eventId}`,
    data: { eventId, type: 'update' },
  };

  return sendPushNotification({
    userId,
    type: 'event_update',
    payload,
  });
}

// Verificar si las notificaciones están soportadas
export function isNotificationSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// Obtener token FCM actual (útil para debugging)
export async function getCurrentFCMToken(): Promise<string | null> {
  try {
    if (!messaging) return null;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}
