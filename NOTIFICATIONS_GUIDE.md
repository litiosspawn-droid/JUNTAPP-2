# 🔔 Guía de Notificaciones Push - JuntApp

## ✅ Configuración Completada

Las notificaciones push están completamente configuradas y listas para usar en JuntApp.

---

## 📋 Componentes Instalados

### 1. **Service Worker** (`public/firebase-messaging-sw.js`)
- Maneja notificaciones en segundo plano
- Muestra notificaciones cuando el usuario no está en la app
- Maneja clicks en notificaciones
- Abre la URL específica al hacer click

### 2. **Hook Personalizado** (`src/hooks/use-notifications.ts`)
- `requestPermission()` - Solicita permiso al usuario
- `getFCMToken()` - Obtiene y guarda el token FCM
- `updatePreferences()` - Actualiza preferencias del usuario
- `onMessage()` - Escucha mensajes en primer plano

### 3. **Componente de Prueba** (`src/components/notification-test.tsx`)
- UI para habilitar notificaciones
- Toggle switches para preferencias
- Botón para enviar notificación de prueba
- Muestra estado del token y permisos

### 4. **Página de Configuración** (`app/notificaciones/page.tsx`)
- Página completa para gestionar notificaciones
- Información sobre cada tipo de notificación
- Accesible desde `/notificaciones`

---

## 🧪 Cómo Probar las Notificaciones

### Opción 1: Desde la Página de Notificaciones

```bash
pnpm run dev
```

1. Abrir navegador en `http://localhost:3000`
2. Iniciar sesión con un usuario
3. Ir a `/notificaciones`
4. Click en "Habilitar Notificaciones"
5. Aceptar el permiso del navegador
6. Click en "🧪 Enviar Notificación de Prueba"

### Opción 2: Desde la Consola del Navegador

```javascript
// 1. Verificar si está soportado
console.log('FCM soportado:', 'Notification' in window && 'serviceWorker' in navigator)

// 2. Solicitar permiso
const permission = await Notification.requestPermission()
console.log('Permiso:', permission)

// 3. Obtener token (desde la app)
// El token se guarda automáticamente en Firestore en fcmTokens/{userId}
```

---

## 📬 Enviar Notificaciones

### Desde la API Route

```typescript
// POST /api/notifications/send
const response = await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id-from-firestore',
    type: 'event_reminder', // event_reminder | chat_message | new_event | event_update
    payload: {
      title: 'Título de la notificación',
      body: 'Cuerpo del mensaje',
      icon: '/icon-192x192.png',
      url: '/events/event-id', // URL a abrir al hacer click
      data: {
        eventId: 'event-id',
        type: 'reminder',
      },
    },
  }),
})

const result = await response.json()
console.log(result) // { success: true }
```

### Tipos de Notificaciones Disponibles

| Tipo | Descripción | Ejemplo de Uso |
|------|-------------|----------------|
| `event_reminder` | Recordatorio de evento | 1 hora antes del evento |
| `chat_message` | Nuevo mensaje en chat | Alguien respondió en el chat |
| `new_event` | Nuevo evento cercano | Evento creado en la zona del usuario |
| `event_update` | Actualización de evento | Cambio de fecha/lugar |

---

## 🔧 Configuración en Producción (Vercel)

### Variables de Entorno Requeridas

Agregá estas variables en **Vercel Dashboard → Settings → Environment Variables**:

```env
# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID="juntapp-arg"
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-fbsvc@juntapp-arg.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# VAPID Key para Web Push
NEXT_PUBLIC_FIREBASE_VAPID_KEY="BD6uEw9EPO6s1Rmbu_Ta98YIj4TT-VBAMqi6FVWjDFf14GCdZyHXjxPy2yLMOGGAwMHjA-v5rurxFIt6002QU7M"
```

### Deploy de las Reglas de Firestore

```bash
firebase deploy --only firestore:rules
```

---

## 📊 Estructura de Datos en Firestore

### Colección: `fcmTokens`

```typescript
// fcmTokens/{userId}
{
  token: string,           // FCM token del dispositivo
  userId: string,          // ID del usuario
  platform: 'web',         // Plataforma: web | ios | android
  preferences: {           // Preferencias de notificación
    eventReminders: boolean,
    chatMessages: boolean,
    newEvents: boolean,
    eventUpdates: boolean,
  },
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

---

## 🐛 Troubleshooting

### "FCM not supported"
- Verificar que el navegador sea compatible (Chrome, Firefox, Edge)
- Asegurarse de estar en `https://` o `localhost`
- Verificar que el service worker esté registrado

### "Permission denied"
- El usuario denegó el permiso. Debe cambiarlo en configuración del navegador
- Chrome: `Configuración → Privacidad y seguridad → Configuración de sitios → Notificaciones`

### "Token no se guarda en Firestore"
- Verificar que el usuario esté autenticado
- Revisar reglas de Firestore para `fcmTokens`
- Verificar consola del navegador para errores

### "Notificación no llega en segundo plano"
- Verificar que el service worker esté activo
- Revisar logs del service worker en `chrome://serviceworker-internals`
- Asegurarse de que la API route use Firebase Admin SDK

---

## 📚 Recursos Adicionales

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notification)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## ✨ Mejores Prácticas

1. **Solicitar permiso en contexto**: No pedir permiso apenas carga la app. Esperar a que el usuario realice una acción relevante.

2. **Personalizar notificaciones**: Usar el nombre del usuario y detalles específicos del evento.

3. **No spamear**: Respetar las preferencias del usuario y no enviar notificaciones innecesarias.

4. **Proveer valor**: Cada notificación debe tener un propósito claro y útil para el usuario.

5. **Permitir opt-out**: Siempre dar la opción de deshabilitar notificaciones fácilmente.

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0.0
