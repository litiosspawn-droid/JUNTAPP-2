import { NextRequest, NextResponse } from 'next/server';
import * as admin from '@/lib/firebase/admin';
import { db, messaging } from '@/lib/firebase/admin';
import { checkRateLimit, RATE_LIMITS, RateLimitError } from '@/lib/rate-limit-server';

export async function POST(request: NextRequest) {
  try {
    const { userId, type, payload } = await request.json();

    if (!userId || !payload) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, payload' },
        { status: 400 }
      );
    }

    // Check rate limit
    try {
      await checkRateLimit(userId, 'SEND_NOTIFICATION', RATE_LIMITS.SEND_NOTIFICATION);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return NextResponse.json(
          { error: error.message, retryAfter: error.retryAfter },
          { status: 429 }
        );
      }
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
    const userDoc = await db.collection('fcmTokens').doc(userId).get();
    if (!userDoc.exists) {
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

    // Enviar notificación via Firebase Admin SDK
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
    const userDoc = await db.collection('fcmTokens').doc(userId).get();
    if (!userDoc.exists) return false;

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

// Enviar notificación via Firebase Cloud Messaging usando Admin SDK
async function sendFCMNotification(token: string, payload: any): Promise<boolean> {
  try {
    const message: admin.messaging.Message = {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      webpush: {
        headers: {
          icon: payload.icon || '/icon-192x192.png',
          badge: payload.badge || '/icon-192x192.png',
        },
        fcmOptions: {
          link: payload.url || '/',
        },
      },
      data: payload.data || {},
    };

    const response = await messaging.send(message);
    console.log('FCM notification sent:', response);

    return true;
  } catch (error) {
    console.error('Error sending FCM notification:', error);
    return false;
  }
}
