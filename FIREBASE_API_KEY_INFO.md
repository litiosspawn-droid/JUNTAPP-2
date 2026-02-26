# 🔐 Firebase API Keys - Aclaración de Seguridad

## ✅ Las Firebase API Keys SON PÚBLICAS por Diseño

### ¿Por qué?

Las API keys de Firebase **NO son secretos** y están diseñadas para ser expuestas en el cliente porque:

1. **Se usan en el navegador/app** - Necesitan ser accesibles desde el código client-side
2. **No otorgan acceso directo a datos** - La seguridad está en las **Security Rules**
3. **Son específicas del proyecto** - Solo permiten acceder al proyecto configurado

### 🔒 ¿Dónde está la seguridad real?

La seguridad de Firebase está en las **Security Rules**:

| Capa | Protección |
|------|-----------|
| **Firestore Rules** | Controla quién puede leer/escribir cada documento |
| **Storage Rules** | Controla quién puede subir/bajar archivos |
| **Auth Rules** | Controla autenticación y roles |
| **App Check** | Verifica que las peticiones vengan de tu app legítima |

### 📚 Documentación Oficial

> "Las API keys de Firebase son datos públicos y no deben considerarse secretos. No otorgan por sí solas acceso a datos sensibles."
> 
> — [Firebase Documentation: API Keys](https://firebase.google.com/docs/projects/api-keys)

---

## ⚠️ Lo que SÍ es SECRETO en Firebase

### 🔴 NUNCA expongas:

| Credential | Por qué | Dónde va |
|------------|---------|----------|
| **Firebase Admin Private Key** | Da acceso TOTAL al proyecto | Solo servidor (.env) |
| **Service Account JSON** | Credenciales de administrador | Solo servidor (.env) |
| **Database URL con token** | Acceso directo a la DB | Solo servidor (.env) |

### ✅ Puedes exponer (son públicas por diseño):

| Credential | Ubicación |
|------------|-----------|
| Firebase API Key | Cliente (código) |
| Auth Domain | Cliente |
| Project ID | Cliente |
| Storage Bucket | Cliente |
| Messaging Sender ID | Cliente |
| App ID | Cliente |

---

## 🛡️ Mejores Prácticas para Firebase

### 1. Security Rules Fuertes

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo el dueño puede leer/escribir sus datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Eventos: lectura pública, escritura solo autenticados
    match /events/{eventId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.creatorId;
    }
  }
}
```

### 2. Restringir API Key en Google Cloud

Aunque la API key es pública, puedes restringir su uso:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Selecciona tu API key
3. Agrega restricciones:
   - **HTTP referrers**: `https://juntapp-2.vercel.app`
   - **APIs**: Solo las que necesitas (Maps, etc.)

### 3. Firebase App Check (Recomendado)

App Check verifica que las peticiones vengan de tu app legítima:

```typescript
// src/lib/firebase/app.ts
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('tu-recaptcha-site-key'),
  isTokenAutoRefreshEnabled: true,
});
```

### 4. Monitoreo de Uso

Revisa el uso de tu API key regularmente:

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Firebase Console > Usage
3. Configura alertas de uso inusual

---

## 🚨 ¿Cuándo preocuparse?

### NO preocuparse si:
- ✅ La API key está en código público (GitHub)
- ✅ La API key está en el service worker
- ✅ La API key está en el frontend

### SÍ preocuparse si:
- ❌ Firebase Admin Private Key está expuesta
- ❌ Service Account JSON está en el repo
- ❌ Security Rules están en modo `allow read, write: if true`
- ❌ No hay validación de datos en el backend

---

## 📊 Resumen de Credenciales en JuntApp

### Archivos con credenciales públicas (✅ SEGURO):

| Archivo | Credenciales | Estado |
|---------|-------------|--------|
| `public/firebase-messaging-sw.js` | Firebase API Key | ✅ Seguro (pública por diseño) |
| `.env.local` | `NEXT_PUBLIC_FIREBASE_*` | ✅ Seguro (públicas por diseño) |
| `src/lib/firebase/config.ts` | Firebase config | ✅ Seguro (públicas por diseño) |

### Archivos con credenciales secretas (🔴 PELIGROSO):

| Archivo | Credential | Estado | Acción |
|---------|-----------|--------|--------|
| `.env.local` | `FIREBASE_ADMIN_PRIVATE_KEY` | ✅ Removida | Rotar en Firebase Console |

---

## 🔗 Recursos Útiles

- [Firebase API Keys Documentation](https://firebase.google.com/docs/projects/api-keys)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [OWASP Firebase Security](https://cheatsheetseries.owasp.org/cheatsheets/Firebase_Cheatsheet.html)

---

## ✅ Conclusión

**La Firebase API Key en `public/firebase-messaging-sw.js` NO es un riesgo de seguridad** porque:

1. Las API keys de Firebase son públicas por diseño
2. La seguridad está en las Security Rules
3. No otorga acceso a datos sensibles por sí sola

**LO QUE SÍ DEBES ROTAR:**
- Firebase Admin Private Key (esa SÍ es secreta)
- Google Maps API Key (puede tener costos si la abusan)
- LocationIQ API Key (tiene límites de uso)

---

**Fecha:** 25 de febrero de 2026  
**Referencia:** [Firebase API Keys](https://firebase.google.com/docs/projects/api-keys)
