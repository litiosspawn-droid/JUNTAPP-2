# JuntApp - Descubre eventos locales

Una aplicación web para descubrir, crear y compartir eventos locales en tu comunidad.

## 🚀 Características

- **Autenticación con Google** - Login seguro y fácil
- **Creación de eventos** - Formulario completo para crear eventos
- **Mapa interactivo** - Visualización geográfica de eventos
- **Chat en tiempo real** - Conversación para cada evento
- **Filtrado por categorías** - Música, Deporte, After, Reunión
- **Diseño responsive** - Funciona en todos los dispositivos
- **Base de datos real** - Firebase Firestore y Storage

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Lucide React
- **Backend**: Firebase (Firestore, Authentication, Storage, Admin SDK)
- **Mapas**: React Leaflet, LocationIQ (geocoding)
- **Imágenes**: Cloudinary
- **Despliegue**: Vercel

## 📋 Requisitos

- Node.js 18+
- npm o pnpm
- Cuenta de Firebase

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd juntapp
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.local.example .env.local
   ```

   Edita `.env.local` con tus credenciales:
   ```env
   # Firebase Client
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
   
   # Firebase Admin SDK (Server-side)
   FIREBASE_ADMIN_PROJECT_ID=tu_project_id
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu_proyecto.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   
   # LocationIQ (Geocoding)
   LOCATIONIQ_API_KEY=tu_locationiq_token
   
   # Cloudinary (Imágenes)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
   ```

4. **Configurar Firebase**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Crea un nuevo proyecto
   - Habilita Authentication → Google Sign-In
   - Crea base de datos Firestore
   - Configura Storage para imágenes
   - Genera una Service Account para el Admin SDK:
     - Project Settings → Service Accounts → Generate New Private Key
     - Copia las credenciales en `.env.local`
   - Copia las credenciales a `.env.local`

5. **Configurar LocationIQ** (opcional - para geocoding)
   - Ve a [LocationIQ](https://locationiq.com/)
   - Crea una cuenta gratuita
   - Obtené tu API key
   - Agregala a `.env.local` como `LOCATIONIQ_API_KEY`

6. **Configurar Cloudinary** (para imágenes)
   - Ve a [Cloudinary](https://cloudinary.com/)
   - Crea una cuenta gratuita
   - Crea un upload preset
   - Copia las credenciales a `.env.local`

7. **Iniciar desarrollo**
   ```bash
   pnpm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
juntapp/
├── app/                    # Páginas de Next.js
│   ├── crear/             # Formulario crear evento
│   ├── evento/[id]/        # Detalle de evento
│   ├── mapa/              # Mapa de eventos
│   ├── perfil/             # Perfil de usuario
│   ├── api/               # API routes (notificaciones, geocode)
│   └── page.tsx           # Página principal
├── components/             # Componentes React
│   ├── chat/              # Componente de chat
│   ├── create-event/      # Componentes del formulario
│   ├── map/               # Componentes de mapa
│   ├── profile/           # Componentes de perfil
│   ├── ui/                # UI components (shadcn/ui)
│   ├── layout.tsx         # Header y Footer
│   ├── event-card.tsx     # Tarjeta de evento
│   └── map-view.tsx       # Vista de mapa
├── contexts/              # Contextos de React
│   └── AuthContext.tsx    # Contexto de autenticación
├── hooks/                 # Hooks personalizados
│   ├── use-events.ts      # Hook para cargar eventos
│   ├── use-geolocation.ts # Hook de geolocalización
│   └── use-notifications.ts # Hook de notificaciones
├── lib/                   # Utilidades
│   ├── firebase/          # Servicios de Firebase
│   │   ├── admin.ts       # Firebase Admin SDK
│   │   ├── auth.ts        # Autenticación
│   │   ├── events.ts      # CRUD de eventos
│   │   ├── users.ts       # Gestión de usuarios
│   │   └── client.ts      # Configuración de Firebase
│   ├── cloudinary.ts      # Upload de imágenes
│   ├── geofirestore.ts    # GeoQueries
│   ├── locationiq.ts      # Geocoding
│   └── notifications.ts   # Notificaciones push
└── types/                 # Tipos TypeScript
    └── index.ts           # Tipos globales
```

## 🔧 Funcionalidades Principales

### Autenticación
- Login con Google
- Gestión de perfil de usuario
- Estado persistente
- Roles de usuario (admin, user)

### Eventos
- Crear eventos con imagen (Cloudinary)
- Listar eventos por categoría
- Detalle completo con chat
- Confirmar asistencia
- Sistema de ratings
- Geocoding de direcciones (LocationIQ)

### Chat
- Mensajes en tiempo real (polling)
- Reacciones con emojis
- Reportar mensajes

### Mapa
- Visualización de eventos
- Filtrado por categoría
- Interacción con marcadores
- Geolocalización del usuario

### Notificaciones Push
- Recordatorios de eventos
- Mensajes del chat
- Actualizaciones de eventos
- Nuevos eventos cercanos

## 🚀 Despliegue

1. **Build para producción**
   ```bash
   pnpm run build
   ```

2. **Desplegar en Vercel**
   ```bash
   pnpm run deploy
   ```

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama de feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit de cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT.

## 🆘 Soporte

Si tienes algún problema o sugerencia:

1. Revisa los [Issues](https://github.com/tu-usuario/juntapp/issues)
2. Crea un nuevo issue describiendo el problema
3. Contribuye con una Pull Request si puedes solucionarlo

## 🔗 Enlaces de Interés

- [Firebase Console](https://console.firebase.google.com/)
- [LocationIQ Dashboard](https://locationiq.com/account)
- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Documentación Firebase Admin SDK](FIREBASE_ADMIN_SETUP.md)

---

**Desarrollado con ❤️ para la comunidad local**
