import { useState, useEffect } from 'react';
import { messaging } from '@/lib/firebase/client';
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
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    eventReminders: true,
    chatMessages: true,
    newEvents: false,
    eventUpdates: true,
  });

  // Solicitar permiso de notificaciones
  const requestPermission = async () => {
    try {
      if (!messaging) {
        console.warn('FCM not supported');
        return false;
      }

      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult === 'granted') {
        await registerServiceWorker();
        await getFCMToken();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
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
      if (!messaging || !user) return;

      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (currentToken) {
        setToken(currentToken);
        await saveTokenToFirestore(currentToken);
        console.log('FCM token obtained:', currentToken);
      } else {
        console.log('No registration token available.');
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
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

  // Inicializar permisos al cargar
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
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
