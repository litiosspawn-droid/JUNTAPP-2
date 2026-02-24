import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';

// Configuración de Firebase Admin SDK (debería estar en variables de entorno)
const FIREBASE_SERVER_KEY = process.env.FIREBASE_SERVER_KEY;

if (!FIREBASE_SERVER_KEY) {
  console.warn('FIREBASE_SERVER_KEY not configured - push notifications will not work');
}

export async function POST(request: NextRequest) {
  try {
    const { userId, type, payload } = await request.json();

    if (!userId || !payload) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, payload' },
        { status: 400 }
      );
    }

    // Verificar preferencias del usuario
    const shouldSend = await checkNotificationPreferences(userId, type);
    if (!shouldSend) {
      return NextResponse.json(
        { success: true, message: 'Notification skipped due to user preferences' },
        { status: 200 }
      );
    }

    // Obtener token FCM del usuario
    const userDoc = await getDoc(doc(db, 'fcmTokens', userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User FCM token not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const fcmToken = userData?.token;

    if (!fcmToken) {
      return NextResponse.json(
        { error: 'FCM token not found for user' },
        { status: 404 }
      );
    }

    // Enviar notificación via FCM
    const result = await sendFCMNotification(fcmToken, payload);

    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verificar si el usuario quiere recibir este tipo de notificación
async function checkNotificationPreferences(userId: string, type: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'fcmTokens', userId));
    if (!userDoc.exists()) return false;

    const preferences = userDoc.data()?.preferences || {};

    switch (type) {
      case 'event_reminder':
        return preferences.eventReminders !== false;
      case 'chat_message':
        return preferences.chatMessages !== false;
      case 'new_event':
        return preferences.newEvents === true;
      case 'event_update':
        return preferences.eventUpdates !== false;
      default:
        return true;
    }
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    return false;
  }
}

// Enviar notificación via Firebase Cloud Messaging
async function sendFCMNotification(token: string, payload: any): Promise<boolean> {
  try {
    if (!FIREBASE_SERVER_KEY) {
      console.warn('Firebase server key not configured');
      return false;
    }

    const fcmPayload = {
      to: token,
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon-192x192.png',
        badge: payload.badge || '/icon-192x192.png',
        click_action: payload.url || '/',
      },
      data: payload.data || {},
    };

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${FIREBASE_SERVER_KEY}`,
      },
      body: JSON.stringify(fcmPayload),
    });

    if (!response.ok) {
      console.error('FCM API error:', response.status, await response.text());
      return false;
    }

    const result = await response.json();
    console.log('FCM notification sent:', result);

    return result.success === 1 || result.failure === 0;
  } catch (error) {
    console.error('Error sending FCM notification:', error);
    return false;
  }
}
