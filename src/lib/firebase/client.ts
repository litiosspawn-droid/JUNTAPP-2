import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase solo si no hay una instancia ya
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Inicializar Firebase Cloud Messaging (solo en cliente)
let messaging: ReturnType<typeof getMessaging> | null = null;

// Función para obtener messaging (lazy loading)
export const getFCMMessaging = async (): Promise<typeof messaging> => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const supported = await isSupported();
    if (supported && !messaging) {
      messaging = getMessaging(app);
    }
    return messaging;
  } catch (error) {
    console.warn('FCM not supported:', error);
    return null;
  }
};

// Intentar inicializar messaging inmediatamente en el cliente
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        messaging = getMessaging(app);
        console.log('[Firebase] FCM initialized');
      } else {
        console.log('[Firebase] FCM not supported in this browser');
      }
    })
    .catch((error) => {
      console.warn('[Firebase] FCM initialization error:', error);
    });
}

export { app, auth, db, storage, messaging };
