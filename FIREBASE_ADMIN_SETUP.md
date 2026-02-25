# 🔔 Configuración de Notificaciones Push - Firebase Admin SDK

## Configuración Completada

El proyecto ahora está configurado con **Firebase Admin SDK** para enviar notificaciones push usando las credenciales del service account.

## ✅ Cambios Realizados

### 1. Variables de Entorno Agregadas
Se agregaron las siguientes variables a `.env.local`:

```env
FIREBASE_ADMIN_PROJECT_ID="juntapp-arg"
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-fbsvc@juntapp-arg.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 2. Nuevos Archivos Creados

- `src/lib/firebase/admin.ts` - Configuración del Firebase Admin SDK
- `.env.local.example` - Plantilla de variables de entorno
- `FIREBASE_ADMIN_SETUP.md` - Este archivo

### 3. Archivos Actualizados

- `app/api/notifications/send/route.ts` - Ahora usa el Admin SDK en lugar de la API legacy
- `.gitignore` - Ahora ignora archivos `*-firebase-adminsdk-*.json`

### 4. Dependencias Instaladas

```bash
pnpm add firebase-admin
```

## 🚀 Cómo Funciona

### Envío de Notificaciones

La API ahora usa el método `messaging.send()` del Admin SDK:

```typescript
import { messaging } from '@/lib/firebase/admin';

const message: admin.messaging.Message = {
  token: userFCMToken,
  notification: {
    title: 'Título',
    body: 'Mensaje',
  },
  webpush: {
    fcmOptions: {
      link: '/url-destino',
    },
  },
};

await messaging.send(message);
```

## 📋 Requisitos para Producción

### En Vercel

Debes agregar las siguientes **Environment Variables** en el dashboard de Vercel:

1. `FIREBASE_ADMIN_PROJECT_ID`
2. `FIREBASE_ADMIN_CLIENT_EMAIL`
3. `FIREBASE_ADMIN_PRIVATE_KEY` (con los saltos de línea como `\n`)
4. `NEXT_PUBLIC_FIREBASE_VAPID_KEY` (ver instrucciones abajo)

**Importante:** En Vercel, el private key debe estar en una sola línea con `\n` para los saltos.

### Generar VAPID Key para Web Push

Las notificaciones push en web requieren una VAPID key. Para generarla:

1. **Usando la Firebase CLI** (recomendado):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase experimental:functions:secret:set FIREBASE_VAPID_KEY
   ```

2. **O manualmente con Node.js**:
   ```bash
   node -e "const crypto = require('crypto'); const key = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' }); console.log('VAPID_KEY:', key.privateKey.export({ type: 'sec1', format: 'pem' }).toString('base64'));"
   ```

3. **O usar un generador online**:
   - https://tools.reactpowerups.com/vapid-key-generator/
   - https://github.com/google/web-push-codelab

Luego agrega la key generada a `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY="tu-vapid-key-aqui"
```

### Formato del Private Key

El private key debe tener los saltos de línea escapados:

```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...\n-----END PRIVATE KEY-----\n
```

## 🔒 Seguridad

- ✅ El archivo JSON del service account está en `.gitignore`
- ✅ Las credenciales están en variables de entorno
- ✅ El token de Vercel OIDC fue eliminado
- ⚠️ **Importante:** Rotar las credenciales si fueron comprometidas

## 🧪 Testing

Para probar las notificaciones:

1. Inicia la app en desarrollo: `pnpm run dev`
2. Registra un usuario y obtén su token FCM
3. Guarda el token en la colección `fcmTokens/{userId}`
4. Haz un POST a `/api/notifications/send` con:

```json
{
  "userId": "user-id",
  "type": "event_reminder",
  "payload": {
    "title": "Recordatorio",
    "body": "Tu evento comienza pronto",
    "url": "/evento/123"
  }
}
```

## 📚 Recursos

- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [FCM Message Format](https://firebase.google.com/docs/reference/admin/node/admin.messaging.Message)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
