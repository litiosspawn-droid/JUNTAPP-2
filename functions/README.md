# Firebase Cloud Functions - JuntApp

## Funciones Implementadas

### 1. **recordatoriosEventos** ⏰
- **Trigger:** Cada 1 hora
- **Descripción:** Envía recordatorios automáticos 24 horas antes de los eventos
- **Acciones:**
  - Busca eventos en las próximas 24 horas
  - Obtiene asistentes confirmados
  - Crea notificaciones en Firestore
  - Envía push notifications (si tienen token)
  - Evita duplicados

### 2. **resumenSemanal** 📊
- **Trigger:** Todos los lunes a las 9 AM
- **Descripción:** Envía resumen semanal de eventos próximos
- **Acciones:**
  - Busca eventos de la próxima semana
  - Envía resumen a todos los usuarios
  - Máximo 5 eventos por usuario

### 3. **notificarNuevoAsistente** 👥
- **Trigger:** Cuando se crea un registro en `attendees`
- **Descripción:** Notifica al organizador cuando alguien se registra
- **Acciones:**
  - Verifica que sea confirmación real
  - Notifica al creador del evento

### 4. **notificarLugarDisponible** 🎫
- **Trigger:** Cuando se cancela un registro confirmado
- **Descripción:** Avisa al primero en waitlist si hay lugar
- **Acciones:**
  - Busca primer usuario en waitlist
  - Notifica lugar disponible

### 5. **limpiarNotificacionesViejas** 🧹
- **Trigger:** Todos los días a las 3 AM
- **Descripción:** Limpia notificaciones de más de 30 días
- **Acciones:**
  - Elimina notificaciones viejas
  - Batch de 1000 por ejecución

### 6. **enviarRecordatorioManual** 📤
- **Trigger:** HTTPS Callable Function
- **Descripción:** Permite a organizadores enviar recordatorio manual
- **Uso:**
```javascript
const sendReminder = httpsCallable(functions, 'enviarRecordatorioManual');
await sendReminder({ eventId: 'xxx' });
```

---

## Instalación y Deploy

### 1. Instalar dependencias
```bash
cd functions
npm install
```

### 2. Configurar Firebase
```bash
firebase login
firebase init functions
```

### 3. Deploy
```bash
npm run deploy
```

### 4. Ver logs
```bash
npm run logs
```

---

## Variables de Entorno

Las funciones usan Firebase Admin SDK que se configura automáticamente con:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

---

## Testing Local

```bash
npm run serve
```

Luego usar el URL local para testing.

---

## Índices de Firestore

Los índices necesarios se crean automáticamente o se pueden crear con:
```bash
firebase deploy --only firestore:indexes
```

---

## Costos Estimados

- **recordatoriosEventos:** 24 ejecuciones/día
- **resumenSemanal:** 1 ejecución/semana
- **limpiarNotificacionesViejas:** 1 ejecución/día
- **Triggers:** Variables según actividad

Free tier incluye:
- 2M de invocaciones/mes
- 400,000 GB-segundos de cómputo
- 200,000 segundos de CPU

---

## Monitoreo

Ver en Firebase Console:
- Functions → Dashboard
- Logs → Cloud Logging

---

## Troubleshooting

### Funciones no se ejecutan
1. Verificar que estén deployadas: `firebase functions:list`
2. Ver logs: `firebase functions:log`
3. Verificar permisos de Firestore

### Error de permisos
```bash
firebase functions:secrets:set FIREBASE_CONFIG
```

---

## Seguridad

- Todas las funciones verifican autenticación
- HTTPS functions validan `context.auth`
- Firestore rules deben restringir acceso

---

## Próximas Mejoras

- [ ] Emails con SendGrid
- [ ] SMS con Twilio
- [ ] Notificaciones push nativas
- [ ] Analytics de notificaciones
- [ ] A/B testing de mensajes
