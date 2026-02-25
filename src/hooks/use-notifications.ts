import { useState, useEffect } from 'react';
import { messaging, getFCMMessaging } from '@/lib/firebase/client';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationPreferences {
  eventReminders: boolean;
  chatMessages: boolean;
  newEvents: boolean;
  eventUpdates: boolean;
}

export function useNotifications() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    eventReminders: true,
    chatMessages: true,
    newEvents: false,
    eventUpdates: true,
  });

  // Solicitar permiso de notificaciones
  const requestPermission = async () => {
    try {
      // Verificar soporte del navegador
      if (!('Notification' in window)) {
        console.warn('Este navegador no soporta notificaciones');
        return false;
      }

      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      setLoading(false);

      if (permissionResult === 'granted') {
        console.log('[Notificaciones] Permiso concedido');
        await registerServiceWorker();
        await getFCMToken();
        return true;
      } else if (permissionResult === 'denied') {
        console.warn('[Notificaciones] Permiso denegado');
      } else {
        console.log('[Notificaciones] Permiso pendiente');
      }

      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setLoading(false);
      return false;
    }
  };

  // Registrar service worker
  const registerServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  // Obtener token FCM
  const getFCMToken = async () => {
    try {
      if (!user) {
        console.log('[Notificaciones] Usuario no autenticado');
        return;
      }

      const fcmMessaging = await getFCMMessaging();
      
      if (!fcmMessaging) {
        console.warn('[Notificaciones] FCM no disponible');
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      
      if (!vapidKey) {
        console.error('[Notificaciones] VAPID key no configurada');
        return;
      }

      const currentToken = await getToken(fcmMessaging, {
        vapidKey: vapidKey,
      });

      if (currentToken) {
        setToken(currentToken);
        await saveTokenToFirestore(currentToken);
        console.log('[Notificaciones] Token FCM obtenido:', currentToken.substring(0, 20) + '...');
      } else {
        console.log('[Notificaciones] No hay token de registro disponible');
      }
    } catch (error) {
      console.error('[Notificaciones] Error obteniendo token FCM:', error);
    }
  };

  // Guardar token en Firestore
  const saveTokenToFirestore = async (fcmToken: string) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'fcmTokens', user.uid), {
        token: fcmToken,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences,
      }, { merge: true });
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  };

  // Actualizar preferencias
  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);

    if (user && token) {
      try {
        await updateDoc(doc(db, 'fcmTokens', user.uid), {
          preferences: updatedPreferences,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error('Error updating notification preferences:', error);
      }
    }
  };

  // Escuchar mensajes en primer plano
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);

      // Mostrar notificación nativa del navegador
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'Nueva notificación', {
          body: payload.notification?.body,
          icon: '/icon-192x192.png',
          tag: payload.data?.tag || 'default',
        });
      }
    });

    return unsubscribe;
  }, []);

  // Inicializar permisos y verificar soporte al cargar
  useEffect(() => {
    const initNotifications = async () => {
      if ('Notification' in window) {
        setPermission(Notification.permission);
        
        // Verificar si FCM está soportado
        const fcmMessaging = await getFCMMessaging();
        console.log('[Notificaciones] FCM disponible:', !!fcmMessaging);
      } else {
        console.warn('[Notificaciones] API de notificaciones no soportada');
      }
      setLoading(false);
    };

    initNotifications();
  }, []);

  // Obtener token cuando el usuario se autentica
  useEffect(() => {
    if (user && permission === 'granted') {
      getFCMToken();
    }
  }, [user, permission]);

  return {
    token,
    permission,
    preferences,
    requestPermission,
    updatePreferences,
    isSupported: !!messaging,
  };
}
