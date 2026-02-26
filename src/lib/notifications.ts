/**
 * Servicio de Notificaciones Push Mejorado
 * 
 * Características:
 * - Firebase Cloud Messaging (FCM)
 * - Notificaciones locales programadas
 * - Recordatorios de eventos
 * - Gestión de tokens
 */

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging'
import { db } from './firebase/client'
import { doc, setDoc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore'
import type { User } from 'firebase/auth'

// ============================================================================
// Constants
// ============================================================================

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ''
const SW_URL = '/firebase-messaging-sw.js'

// ============================================================================
// Types
// ============================================================================

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: {
    url?: string
    eventId?: string
    type: 'event_reminder' | 'new_attendee' | 'chat_message' | 'event_update'
  }
}

export interface ScheduledNotification {
  id: string
  title: string
  body: string
  scheduledAt: Date
  data?: NotificationPayload['data']
}

// ============================================================================
// FCM Setup
// ============================================================================

let messaging: Messaging | null = null

/**
 * Inicializa Firebase Messaging
 */
export async function initializeMessaging(): Promise<Messaging | null> {
  if (typeof window === 'undefined') {
    return null
  }

  if (!('Notification' in window)) {
    console.warn('Push notifications not supported')
    return null
  }

  try {
    const permission = await Notification.requestPermission()
    
    if (permission !== 'granted') {
      console.log('Notification permission denied')
      return null
    }

    // Import Firebase messaging
    const { getMessaging } = await import('firebase/messaging')
    
    // Initialize messaging
    const messagingInstance = getMessaging()
    messaging = messagingInstance

    return messagingInstance
  } catch (error) {
    console.error('Error initializing messaging:', error)
    return null
  }
}

/**
 * Obtiene el token FCM del usuario
 */
export async function getFCMToken(): Promise<string | null> {
  if (!messaging) {
    await initializeMessaging()
  }

  if (!messaging) {
    return null
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.ready,
    })

    return token || null
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

/**
 * Registra el token FCM en Firestore
 */
export async function registerFCMToken(user: User): Promise<void> {
  const token = await getFCMToken()
  
  if (!token) {
    console.warn('No FCM token available')
    return
  }

  try {
    const userRef = doc(db, 'fcmTokens', user.uid)
    await setDoc(
      userRef,
      {
        token,
        userId: user.uid,
        platform: 'web',
        createdAt: new Date(),
        lastUsed: new Date(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error registering FCM token:', error)
  }
}

/**
 * Elimina el token FCM al logout
 */
export async function unregisterFCMToken(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'fcmTokens', userId))
  } catch (error) {
    console.error('Error unregistering FCM token:', error)
  }
}

/**
 * Escucha mensajes en primer plano
 */
export function onForegroundMessage(callback: (payload: NotificationPayload) => void) {
  if (!messaging) {
    return () => {}
  }

  return onMessage(messaging, (payload) => {
    const notification = payload.notification as NotificationPayload
    
    if (notification) {
      callback(notification)
    }
  })
}

// ============================================================================
// Local Notifications
// ============================================================================

/**
 * Muestra una notificación local
 */
export function showLocalNotification(payload: NotificationPayload) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  const notification = new Notification(payload.title, {
    body: payload.body,
    icon: payload.icon || '/icon-192x192.png',
    badge: payload.badge || '/icon-192x192.png',
    data: payload.data,
    requireInteraction: true,
    tag: payload.data?.eventId || 'default',
  })

  notification.onclick = () => {
    if (payload.data?.url) {
      window.open(payload.data.url, '_blank')
    }
    notification.close()
  }
}

// ============================================================================
// Scheduled Notifications
// ============================================================================

const SCHEDULED_KEY = 'scheduled_notifications'

/**
 * Programa una notificación local
 */
export function scheduleNotification(notification: ScheduledNotification): void {
  const scheduled: ScheduledNotification[] = getScheduledNotifications()
  scheduled.push(notification)
  localStorage.setItem(SCHEDULED_KEY, JSON.stringify(scheduled))

  // Programar con setTimeout
  const delay = notification.scheduledAt.getTime() - Date.now()
  
  if (delay > 0) {
    setTimeout(() => {
      showLocalNotification({
        title: notification.title,
        body: notification.body,
        data: notification.data,
      })
      // Remover de la lista
      removeScheduledNotification(notification.id)
    }, delay)
  }
}

/**
 * Obtiene notificaciones programadas
 */
export function getScheduledNotifications(): ScheduledNotification[] {
  const stored = localStorage.getItem(SCHEDULED_KEY)
  if (!stored) return []
  
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * Remueve una notificación programada
 */
function removeScheduledNotification(id: string): void {
  const scheduled = getScheduledNotifications()
  const filtered = scheduled.filter((n) => n.id !== id)
  localStorage.setItem(SCHEDULED_KEY, JSON.stringify(filtered))
}

/**
 * Programa recordatorio de evento
 */
export function scheduleEventReminder(
  eventId: string,
  eventTitle: string,
  eventDate: Date,
  reminderTime: '1h' | '24h' | '1week'
): void {
  const now = new Date()
  let hoursBefore = 24

  if (reminderTime === '1h') hoursBefore = 1
  if (reminderTime === '1week') hoursBefore = 168

  const reminderDate = new Date(eventDate.getTime() - hoursBefore * 60 * 60 * 1000)

  // Solo programar si es en el futuro
  if (reminderDate > now) {
    scheduleNotification({
      id: `reminder-${eventId}`,
      title: '📅 Recordatorio de Evento',
      body: `El evento "${eventTitle}" comienza en ${hoursBefore === 1 ? '1 hora' : hoursBefore === 24 ? '24 horas' : '1 semana'}`,
      scheduledAt: reminderDate,
      data: {
        eventId,
        url: `/events/${eventId}`,
        type: 'event_reminder',
      },
    })
  }
}

/**
 * Cancela recordatorios de un evento
 */
export function cancelEventReminders(eventId: string): void {
  const scheduled = getScheduledNotifications()
  const filtered = scheduled.filter(
    (n) => n.id !== `reminder-${eventId}`
  )
  localStorage.setItem(SCHEDULED_KEY, JSON.stringify(filtered))
}

// ============================================================================
// Notification Preferences
// ============================================================================

export interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  eventReminders: boolean
  reminderTime: '1h' | '24h' | '1week'
  weeklySummary: boolean
  newAttendeeAlerts: boolean
  eventUpdates: boolean
  chatMessages: boolean
}

/**
 * Obtiene preferencias del usuario
 */
export async function getUserNotificationPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  try {
    // Implementar con llamada a Firestore
    return null
  } catch {
    return null
  }
}

/**
 * Actualiza preferencias del usuario
 */
export async function updateUserNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> {
  try {
    // Implementar con llamada a Firestore
  } catch (error) {
    console.error('Error updating preferences:', error)
  }
}
