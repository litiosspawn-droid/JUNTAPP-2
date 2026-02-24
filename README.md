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
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Mapas**: React Leaflet
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
   
   Edita `.env.local` con tus credenciales de Firebase:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
   ```

4. **Configurar Firebase**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Crea un nuevo proyecto
   - Habilita Authentication → Google Sign-In
   - Crea base de datos Firestore
   - Configura Storage para imágenes
   - Copia las credenciales a `.env.local`

5. **Iniciar desarrollo**
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
│   └── page.tsx           # Página principal
├── components/             # Componentes React
│   ├── chat/              # Componente de chat
│   ├── ui/                # UI components (shadcn/ui)
│   ├── layout.tsx         # Header y Footer
│   ├── event-card.tsx     # Tarjeta de evento
│   └── map-view.tsx       # Vista de mapa
├── lib/                   # Utilidades
│   └── firebase/          # Servicios de Firebase
│       ├── auth.ts         # Autenticación
│       ├── events.ts       # CRUD de eventos
│       ├── chat.ts        # Chat y reacciones
│       └── client.ts      # Configuración de Firebase
├── hooks/                 # Hooks personalizados
│   └── use-events.ts     # Hook para cargar eventos
└── contexts/              # Contextos de React
    └── AuthContext.tsx   # Contexto de autenticación
```

## 🔧 Funcionalidades Principales

### Autenticación
- Login con Google
- Gestión de perfil de usuario
- Estado persistente

### Eventos
- Crear eventos con imagen
- Listar eventos por categoría
- Detalle completo con chat
- Confirmar asistencia

### Chat
- Mensajes en tiempo real (polling)
- Reacciones con emojis
- Reportar mensajes

### Mapa
- Visualización de eventos
- Filtrado por categoría
- Interacción con marcadores

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

---

**Desarrollado con ❤️ para la comunidad local**
