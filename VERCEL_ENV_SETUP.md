# 🔐 Configuración de Variables de Entorno - Vercel

## Pasos para configurar las variables en Vercel

### 1. Ir al proyecto en Vercel
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto: `juntapp-2`

### 2. Abrir configuración de variables
1. Haz clic en **Settings** (pestaña superior)
2. En el menú lateral, haz clic en **Environment Variables**
3. Haz clic en **Add New**

### 3. Agregar las siguientes variables

#### 🔴 Firebase Admin (Server-side - PRODUCCIÓN)

| Variable | Valor |
|----------|-------|
| `FIREBASE_ADMIN_PROJECT_ID` | `juntapp-arg` |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@juntapp-arg.iam.gserviceaccount.com` |
| `FIREBASE_ADMIN_PRIVATE_KEY` | *(Ver abajo)* |

**⚠️ IMPORTANTE - Firebase Private Key:**

El formato debe ser exactamente así (todo en una línea, con `\n` literales):

```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
```

**Para obtener la nueva key:**
1. Ve a [Firebase Console](https://console.firebase.google.com/project/juntapp-arg/settings/serviceaccounts/adminsdk)
2. Haz clic en **Generate new private key**
3. Descarga el archivo JSON
4. Abre el archivo y copia el contenido de `private_key`
5. Reemplaza los saltos de línea reales con `\n` (literal)

**Ejemplo de conversión:**
```bash
# En tu terminal (Git Bash o WSL):
cat firebase-adminsdk.json | jq -r '.private_key' | sed ':a;N;$!ba;s/\n/\\n/g'
```

O manualmente:
- Original: 
  ```
  -----BEGIN PRIVATE KEY-----
  MIIEvgIBADAN...
  -----END PRIVATE KEY-----
  ```
- Convertido: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADAN...\n-----END PRIVATE KEY-----\n`

---

#### 🟠 API Keys

| Variable | Valor |
|----------|-------|
| `LOCATIONIQ_API_KEY` | *(Tu nueva key de LocationIQ)* |
| `MAPS_API_KEY` | *(Tu nueva key de Google Maps)* |

**LocationIQ:**
1. Ve a https://locationiq.com/account
2. Copia tu API key (o genera una nueva)
3. Pega en Vercel

**Google Maps:**
1. Ve a https://console.cloud.google.com/apis/credentials
2. Crea una nueva API key
3. Restringe a tu dominio: `https://juntapp-2.vercel.app`
4. Habilita las APIs necesarias:
   - Maps JavaScript API
   - Geocoding API
   - Places API

---

#### 🟡 Cloudinary

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `dexqbcqbc` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `juntapp_images` (o uno nuevo firmado) |

**Recomendación:** Crea un upload preset **firmado** en Cloudinary:
1. Ve a https://cloudinary.com/console
2. Settings > Upload presets > Add upload preset
3. Firma: **Signed**
4. Copia el nombre y actualiza en Vercel

---

#### 🔵 Firebase Client (NEXT_PUBLIC_*)

Estas variables son públicas (se exponen en el navegador):

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyBJdxUGCzU1SsPAJ_4IeqSGBCr3fFfLWGI` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `juntapp-arg.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `juntapp-arg` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `juntapp-arg.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `143012406410` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:143012406410:web:ffa18973b3dc085a913973` |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | `https://juntapp-arg-default-rtdb.firebaseio.com` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-27CLC2S10K` |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | *(Tu VAPID key de Firebase Cloud Messaging)* |

---

#### 🟣 Autonoma API (Opcional)

| Variable | Valor |
|----------|-------|
| `AUTONOMA_CLIENT_ID` | *(Tu nuevo client ID)* |
| `AUTONOMA_SECRET_ID` | *(Tu nuevo secret ID)* |

---

#### ⚙️ Configuración de App

| Variable | Valor | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | `https://juntapp-2.vercel.app` | Production |
| `API_BASE_URL` | `https://juntapp-2.vercel.app/api` | Production |
| `API_TIMEOUT` | `10000` | Production |
| `APP_ENVIRONMENT` | `production` | Production |
| `APP_NAME` | `JuntApp` | Production |
| `APP_VERSION` | `1.0.0` | Production |
| `ENABLE_ANALYTICS` | `true` | Production |
| `ENABLE_CRASH_REPORTING` | `false` | Production |
| `ENABLE_DEBUG_MODE` | `false` | Production |

---

### 4. Guardar y desplegar

1. Después de agregar todas las variables, haz clic en **Save**
2. Vercel te pedirá hacer un nuevo deploy para aplicar los cambios
3. Ve a **Deployments** y haz clic en **Redeploy** en el último deploy
4. Espera a que el deploy termine

---

## ✅ Verificación

Después del deploy, verifica que todo funciona:

1. **Homepage:** https://juntapp-2.vercel.app
2. **Eventos:** https://juntapp-2.vercel.app/eventos
3. **Mapa:** https://juntapp-2.vercel.app/mapa
4. **Crear evento:** https://juntapp-2.vercel.app/crear

### Verificar logs:
1. Ve a Vercel > Project > Functions
2. Revisa los logs para errores de Firebase o API keys

---

## 🔒 Seguridad

### Variables que NUNCA deben ser públicas:
- ❌ `FIREBASE_ADMIN_PRIVATE_KEY`
- ❌ `LOCATIONIQ_API_KEY`
- ❌ `MAPS_API_KEY`
- ❌ `AUTONOMA_SECRET_ID`

### Variables que PUEDEN ser públicas (NEXT_PUBLIC_*):
- ✅ `NEXT_PUBLIC_FIREBASE_*` (necesarias para el cliente)
- ✅ `NEXT_PUBLIC_CLOUDINARY_*` (necesarias para uploads)
- ✅ `NEXT_PUBLIC_APP_URL`

---

## 🆘 Solución de Problemas

### Error: "Firebase Admin SDK failed to initialize"
- Verifica que `FIREBASE_ADMIN_PRIVATE_KEY` tenga el formato correcto (todo en una línea con `\n`)
- Verifica que el email coincida con el proyecto

### Error: "LocationIQ API key invalid"
- Regenera la key en LocationIQ
- Verifica que no tenga restricciones de dominio

### Error: "Cloudinary upload failed"
- Verifica que el cloud name sea correcto
- Si usas upload preset firmado, necesitas configurar la firma en el backend

---

**Última actualización:** 25 de febrero de 2026
