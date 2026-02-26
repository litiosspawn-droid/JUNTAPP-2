'use client'

import { Header, Footer } from '@/components/layout'
import { withAuth } from '@/hoc/withAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Calendar, Users, MessageCircle, Settings } from 'lucide-react'
import Link from 'next/link'

function NotificationsPageContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Bell className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-3xl font-bold">Centro de Notificaciones</h1>
            <p className="text-muted-foreground">
              Gestioná todas tus notificaciones en un solo lugar
            </p>
          </div>

          <div className="grid gap-4">
            <Link href="/notificaciones/configuracion">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Configuración</CardTitle>
                    <CardDescription>
                      Elegí qué notificaciones recibir y cuándo
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Recordatorios de Eventos</CardTitle>
                    <CardDescription>
                      No te pierdas ningún evento
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Recibí avisos 24 horas antes de tus eventos confirmados. 
                  Configurable en la sección de ajustes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Actividad de Eventos</CardTitle>
                    <CardDescription>
                      Seguí la actividad de tus eventos
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Notificaciones cuando alguien se registra en tus eventos 
                  o hay actualizaciones importantes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Mensajes del Chat</CardTitle>
                    <CardDescription>
                      Mantente conectado con tu comunidad
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Recibí notificaciones cuando alguien responde en el chat 
                  de tus eventos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default withAuth(NotificationsPageContent)
