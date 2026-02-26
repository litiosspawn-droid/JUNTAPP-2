import * as admin from 'firebase-admin';

// Verificar si ya está inicializado
let app: admin.app.App | null = null;
let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;
let _messaging: admin.messaging.Messaging | null = null;

// Validar que las credenciales sean reales (no placeholders)
const isValidCredential = (value: string | undefined): boolean => {
  if (!value) return false;
  // Verificar que no sea un placeholder
  if (value.includes('tu-') || value.includes('TU_') || value.includes('your-') || value.includes('YOUR_')) {
    return false;
  }
  // Verificar que tenga formato de private key válido
  if (value.includes('-----BEGIN PRIVATE KEY-----') && !value.includes('TU_PRIVATE_KEY')) {
    return true;
  }
  return false;
};

const hasValidCredentials =
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
  isValidCredential(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

let isInitialized = hasValidCredentials;

if (hasValidCredentials) {
  if (admin.apps.length > 0) {
    app = admin.apps[0];
  } else {
    // Usar variables de entorno para inicializar
    const serviceAccount = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    try {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    } catch (error) {
      console.error('❌ Firebase Admin SDK initialization failed:', error);
      // Caer a stubs si falla la inicialización
      isInitialized = false;
    }
  }

  if (app) {
    db = admin.firestore();
    auth = admin.auth();

    try {
      _messaging = admin.messaging();
    } catch (error) {
      console.warn('⚠️ Firebase Messaging not available:', error);
      _messaging = null;
    }
  }
}

// Crear stubs para cuando no hay credenciales (durante el build o desarrollo)
const createStub = (): any => new Proxy({}, {
  get: () => createStub(),
  apply: () => createStub(),
});

if (!isInitialized) {
  console.warn('⚠️ Firebase Admin SDK: Credenciales no disponibles. Algunas funcionalidades estarán deshabilitadas.');
  db = createStub() as admin.firestore.Firestore;
  auth = createStub() as admin.auth.Auth;
  _messaging = createStub() as admin.messaging.Messaging;
}

// Exportar messaging como función para evitar errores de tipo
export const messaging = _messaging;

export { app, db, auth };
export type { admin };
export default admin;
