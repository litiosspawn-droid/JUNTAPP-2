'use client'

import { NotificationTest } from '@/components/notification-test'
import { Header, Footer } from '@/components/layout'

export default function NotificationsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Notificaciones Push</h1>
            <p className="text-muted-foreground">
              Configurá las notificaciones para recibir actualizaciones de tus eventos
            </p>
          </div>

          <NotificationTest />

          {/* Información adicional */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">📅 Recordatorios de Eventos</h3>
              <p className="text-sm text-muted-foreground">
                Recibí notificaciones antes de que comiencen tus eventos. Te avisaremos con tiempo para que no te los pierdas.
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">💬 Mensajes del Chat</h3>
              <p className="text-sm text-muted-foreground">
                Entérate cuando alguien responda en el chat de tus eventos. Mantente conectado con tu comunidad.
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">🎉 Nuevos Eventos</h3>
              <p className="text-sm text-muted-foreground">
                Descubrí eventos nuevos cerca de tu ubicación. Explorá lo que pasa en tu zona.
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">⚠️ Actualizaciones</h3>
              <p className="text-sm text-muted-foreground">
                Recibí alertas cuando haya cambios importantes en eventos a los que confirmaste asistencia.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
