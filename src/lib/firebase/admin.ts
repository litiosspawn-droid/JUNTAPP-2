import * as admin from 'firebase-admin';

// Verificar si ya está inicializado
let app: admin.app.App | null = null;
let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;
let messaging: admin.messaging.Messaging | null = null;

const isInitialized =
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (isInitialized) {
  if (admin.apps.length > 0) {
    app = admin.apps[0];
  } else {
    // Usar variables de entorno para inicializar
    const serviceAccount = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }

  db = admin.firestore();
  auth = admin.auth();
  
  try {
    messaging = admin.messaging();
  } catch (error) {
    console.warn('⚠️ Firebase Messaging not available:', error);
    messaging = null;
  }
} else {
  // Crear stubs para cuando no hay credenciales (durante el build)
  console.warn('⚠️ Firebase Admin SDK: Credenciales no disponibles. Algunas funcionalidades estarán deshabilitadas.');

  const createStub = () => new Proxy({}, {
    get: () => createStub(),
    apply: () => createStub(),
  });

  db = createStub() as admin.firestore.Firestore;
  auth = createStub() as admin.auth.Auth;
  messaging = createStub() as admin.messaging.Messaging;
}

export { app, db, auth, messaging };
export default admin;
