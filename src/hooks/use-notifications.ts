/**
 * Hook para notificaciones push
 */

import { useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  initializeMessaging,
  registerFCMToken,
  unregisterFCMToken,
  onForegroundMessage,
  showLocalNotification,
  scheduleEventReminder,
  cancelEventReminders,
} from '@/lib/notifications'
import type { NotificationPayload } from '@/lib/notifications'

interface UseNotificationsReturn {
  isSupported: boolean
  permission: NotificationPermission
  requestPermission: () => Promise<boolean>
  sendNotification: (payload: NotificationPayload) => void
  scheduleReminder: (
    eventId: string,
    eventTitle: string,
    eventDate: Date,
    reminderTime: '1h' | '24h' | '1week'
  ) => void
  cancelReminder: (eventId: string) => void
}

/**
 * Hook para gestionar notificaciones push
 */
export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth()

  // Verificar soporte
  const isSupported = typeof window !== 'undefined' && 'Notification' in window

  // Obtener permiso actual
  const permission: NotificationPermission = isSupported
    ? Notification.permission
    : 'denied'

  // Solicitar permiso
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    const result = await Notification.requestPermission()
    return result === 'granted'
  }, [isSupported])

  // Inicializar al montar
  useEffect(() => {
    if (!user || !isSupported) return

    // Inicializar messaging
    initializeMessaging().then((messaging) => {
      if (messaging && user) {
        registerFCMToken(user)
      }
    })

    // Suscribirse a mensajes en foreground
    const unsubscribe = onForegroundMessage((payload) => {
      showLocalNotification(payload)
    })

    return () => {
      unsubscribe()
    }
  }, [user, isSupported])

  // Enviar notificación local
  const sendNotification = useCallback((payload: NotificationPayload) => {
    showLocalNotification(payload)
  }, [])

  // Programar recordatorio
  const scheduleReminder = useCallback(
    (
      eventId: string,
      eventTitle: string,
      eventDate: Date,
      reminderTime: '1h' | '24h' | '1week'
    ) => {
      scheduleEventReminder(eventId, eventTitle, eventDate, reminderTime)
    },
    []
  )

  // Cancelar recordatorio
  const cancelReminder = useCallback((eventId: string) => {
    cancelEventReminders(eventId)
  }, [])

  // Cleanup al logout
  useEffect(() => {
    if (!user) {
      // User logged out - unregister token
      return () => {
        // Cleanup logic if needed
      }
    }
  }, [user])

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    scheduleReminder,
    cancelReminder,
  }
}
