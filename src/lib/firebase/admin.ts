import * as admin from 'firebase-admin';

// Verificar si ya está inicializado
let app: admin.app.App;

if (admin.apps.length > 0) {
  app = admin.apps[0];
} else {
  // Usar variables de entorno para inicializar
  const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  // Validar que todas las credenciales estén presentes
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.warn('⚠️ Firebase Admin SDK: Credenciales incompletas. Algunas funcionalidades no estarán disponibles.');
    console.warn('Variables faltantes:', {
      projectId: !!serviceAccount.projectId,
      clientEmail: !!serviceAccount.clientEmail,
      privateKey: !!serviceAccount.privateKey,
    });
  }

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();
const messaging = admin.messaging();

export { app, db, auth, messaging };
export default admin;
