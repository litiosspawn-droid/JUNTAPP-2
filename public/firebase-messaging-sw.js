// Service Worker para Firebase Cloud Messaging
// Este archivo debe estar en public/firebase-messaging-sw.js

// Importar Firebase SDKs
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuración de Firebase (hardcoded - se actualiza en build si es necesario)
const firebaseConfig = {
  apiKey: "AIzaSyBJdxUGCzU1SsPAJ_4IeqSGBCr3fFfLWGI",
  authDomain: "juntapp-arg.firebaseapp.com",
  projectId: "juntapp-arg",
  storageBucket: "juntapp-arg.firebasestorage.app",
  messagingSenderId: "143012406410",
  appId: "1:143012406410:web:ffa18973b3dc085a913973",
};

try {
  // Inicializar Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Obtener instancia de messaging
  const messaging = firebase.messaging();
  
  // Manejar notificaciones en segundo plano
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
    const notificationTitle = payload.notification?.title || 'JuntApp - Nueva notificación';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      image: payload.notification?.image,
      data: payload.data || {},
      tag: payload.data?.tag || 'default',
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'Abrir' },
        { action: 'close', title: 'Cerrar' }
      ],
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
  
  // Manejar clicks en notificaciones
  self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click:', event);
  
    event.notification.close();
  
    const urlToOpen = event.notification.data?.url || '/';
  
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // Verificar si ya hay una ventana abierta con la URL
        for (let client of windowClients) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            client.focus();
            // Si hay datos adicionales, enviarlos a la ventana
            if (event.notification.data) {
              client.postMessage({
                type: 'NOTIFICATION_CLICK',
                data: event.notification.data,
              });
            }
            return client;
          }
        }
  
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  });
  
  // Manejar mensajes de la aplicación principal
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('[firebase-messaging-sw.js] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });
  
  console.log('[firebase-messaging-sw.js] Service Worker initialized successfully');
  
} catch (error) {
  console.error('[firebase-messaging-sw.js] Initialization error:', error);
}
