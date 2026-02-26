# =============================================================================
# 🚨 SECURITY CHECKLIST - JuntApp
# =============================================================================
# Este archivo contiene los pasos CRÍTICOS de seguridad que debes seguir
# =============================================================================

## ⚠️ URGENTE: Credenciales Expuestas

Las siguientes credenciales estuvieron expuestas en el repositorio y deben ser ROTADAS:

### 1. 🔴 Firebase Admin Private Key (CRÍTICO)
**Estado anterior:** Expuesta en `.env.local`

**Acción requerida:**
1. Ve a: https://console.firebase.google.com/project/juntapp-arg/settings/serviceaccounts/adminsdk
2. Haz clic en "Generate new private key"
3. Descarga el nuevo archivo JSON
4. Guarda el archivo en un lugar SEGURO (no en el repositorio)
5. La key anterior se revoca automáticamente

**Nuevo archivo recomendado:** `firebase-adminsdk.json` (agregado al .gitignore)

---

### 2. 🟠 Google Maps API Key
**Key expuesta:** `AIzaSyBJdxUGCzU1SsPAJ_4IeqSGBCr3fFfLWGI`

**Acción requerida:**
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Busca la key expuesta
3. Elimínala o haz clic en "Restrict key"
4. Crea una nueva key con restricciones:
   - HTTP referrers: `https://juntapp-2.vercel.app`
   - APIs: Maps JavaScript API, Geocoding API

**Nueva key:** Reemplaza en `.env.local` y variables de Vercel

---

### 3. 🟠 LocationIQ API Key
**Key expuesta:** `pk.cf35f3c52e4442bcd363756cd3945f67`

**Acción requerida:**
1. Ve a: https://locationiq.com/account
2. Haz clic en "Reset token" o genera una nueva key
3. Reemplaza en `.env.local`

---

### 4. 🟡 Cloudinary Credentials
**Cloud Name:** `dexqbcqbc`
**Upload Preset:** `juntapp_images`

**Acción requerida:**
1. Ve a: https://cloudinary.com/console
2. Settings > Security > Reset API Key
3. Opcional: Crea un nuevo Upload Preset firmado

---

### 5. 🟡 Autonoma API Credentials
**Client ID:** `cmm0tgceo0fe5018bh7k4la5v`
**Secret:** `f73ea919b2a8da4d60684354c8ecd5f1006c2ef1d3e8fb311bdf9fcc60e91fcb...`

**Acción requerida:**
1. Contacta a Autonoma para revocar credenciales
2. Genera nuevas credenciales

---

## ✅ Configuración Segura

### Variables de Entorno en Vercel

Configura estas variables en Vercel (Project Settings > Environment Variables):

```
# Firebase Admin (PRODUCCIÓN)
FIREBASE_ADMIN_PROJECT_ID=juntapp-arg
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@juntapp-arg.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# API Keys
LOCATIONIQ_API_KEY=pk.xxxxxxxxxxxxxxxxxxxx
MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dexqbcqbc
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=juntapp_images_signed

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=juntapp-arg.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=juntapp-arg
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=juntapp-arg.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=143012406410
NEXT_PUBLIC_FIREBASE_APP_ID=1:143012406410:web:ffa18973b3dc085a913973
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://juntapp-arg-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-27CLC2S10K
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BD6uEw9EPO6s1Rmbu_Ta98YIj4TT-VBAMqi6FVWjDFf14GCdZyHXjxPy2yLMOGGAwMHjA-v5rurxFIt6002QU7M
```

---

## 🔒 Mejores Prácticas

### 1. NUNCA hagas commit de:
- [ ] `.env.local`
- [ ] `.env.production`
- [ ] Archivos `*-firebase-adminsdk-*.json`
- [ ] Cualquier archivo con credenciales

### 2. Verifica antes de cada commit:
```bash
# Verifica qué archivos se van a commitear
git status

# Verifica si hay secrets expuestos
git log --all --full-history -- "*.env*"
git log --all --full-history -- "*-firebase-adminsdk*"
```

### 3. Usa herramientas de detección de secrets:
```bash
# Install gitleaks
npm install -g gitleaks

# Escanea el repositorio
gitleaks detect --source . -v
```

### 4. Firestore Security Rules:
- [ ] Revisa `firestore.rules` regularmente
- [ ] Testea las rules con Firebase Emulator
- [ ] Nunca uses `allow read, write: if true;` en producción

### 5. Storage Security Rules:
- [ ] Revisa `storage.rules`
- [ ] Limita el tamaño de archivos subidos
- [ ] Valida tipos de archivo

---

## 🚨 Si encuentras credenciales expuestas:

1. **NO PANIC** - Mantén la calma
2. **ROTA** - Revoca y genera nuevas credenciales inmediatamente
3. **AUDITA** - Revisa logs de actividad sospechosa
4. **DOCUMENTA** - Registra el incidente
5. **PREVIENE** - Implementa medidas para evitar recurrencia

---

## 📋 Checklist de Seguridad Semanal

- [ ] Verificar que `.env.local` no está en git
- [ ] Revisar logs de Firebase Auth
- [ ] Revisar logs de Firestore (lecturas/escrituras inusuales)
- [ ] Verificar cuotas de API (Google Maps, LocationIQ, Cloudinary)
- [ ] Actualizar dependencias (`npm audit`)
- [ ] Revisar Firestore Security Rules
- [ ] Backup de la base de datos

---

## 🔗 Recursos Útiles

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Gitleaks - Secret Detection](https://github.com/gitleaks/gitleaks)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Última actualización:** 25 de febrero de 2026  
**Próxima revisión de seguridad:** 4 de marzo de 2026
