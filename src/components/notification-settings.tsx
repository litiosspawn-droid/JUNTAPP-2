"use client"

import { useState } from 'react'
import { Bell, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/hooks/use-notifications'
import { useAuth } from '@/contexts/AuthContext'

export function NotificationSettings() {
  const { user } = useAuth()
  const {
    permission,
    preferences,
    requestPermission,
    updatePreferences,
    isSupported,
    token
  } = useNotifications()

  const [isRequesting, setIsRequesting] = useState(false)

  const handleRequestPermission = async () => {
    setIsRequesting(true)
    const granted = await requestPermission()
    setIsRequesting(false)

    if (granted) {
      alert('¡Permiso de notificaciones concedido! Ahora recibirás notificaciones.')
    } else {
      alert('Permiso de notificaciones denegado. Puedes activarlo más tarde desde la configuración del navegador.')
    }
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Activadas', variant: 'default' as const, color: 'text-green-600' }
      case 'denied':
        return { text: 'Bloqueadas', variant: 'destructive' as const, color: 'text-red-600' }
      default:
        return { text: 'No solicitadas', variant: 'secondary' as const, color: 'text-yellow-600' }
    }
  }

  const status = getPermissionStatus()

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Inicia sesión para configurar tus preferencias de notificación
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Las notificaciones push no están soportadas en este navegador
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones Push
        </CardTitle>
        <CardDescription>
          Configura qué notificaciones quieres recibir
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Estado de permisos */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="font-medium">Estado de permisos</div>
            <div className={`text-sm ${status.color}`}>
              {status.text}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {token && (
              <Badge variant="outline" className="text-xs">
                Token activo
              </Badge>
            )}
            {permission !== 'granted' && (
              <Button
                onClick={handleRequestPermission}
                disabled={isRequesting}
                size="sm"
              >
                {isRequesting ? 'Solicitando...' : 'Activar'}
              </Button>
            )}
          </div>
        </div>

        {permission === 'granted' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Settings className="h-4 w-4" />
              Preferencias de notificación
            </div>

            {/* Recordatorios de eventos */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="event-reminders" className="text-base">
                  Recordatorios de eventos
                </Label>
                <div className="text-sm text-muted-foreground">
                  Recibe notificaciones antes de que comiencen tus eventos
                </div>
              </div>
              <Switch
                id="event-reminders"
                checked={preferences.eventReminders}
                onCheckedChange={(checked) =>
                  updatePreferences({ eventReminders: checked })
                }
              />
            </div>

            {/* Mensajes del chat */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="chat-messages" className="text-base">
                  Mensajes del chat
                </Label>
                <div className="text-sm text-muted-foreground">
                  Notificaciones cuando recibes mensajes en eventos
                </div>
              </div>
              <Switch
                id="chat-messages"
                checked={preferences.chatMessages}
                onCheckedChange={(checked) =>
                  updatePreferences({ chatMessages: checked })
                }
              />
            </div>

            {/* Nuevos eventos */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-events" className="text-base">
                  Nuevos eventos
                </Label>
                <div className="text-sm text-muted-foreground">
                  Descubre eventos nuevos cerca de tu ubicación
                </div>
              </div>
              <Switch
                id="new-events"
                checked={preferences.newEvents}
                onCheckedChange={(checked) =>
                  updatePreferences({ newEvents: checked })
                }
              />
            </div>

            {/* Actualizaciones de eventos */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="event-updates" className="text-base">
                  Actualizaciones de eventos
                </Label>
                <div className="text-sm text-muted-foreground">
                  Cambios en eventos a los que estás inscrito
                </div>
              </div>
              <Switch
                id="event-updates"
                checked={preferences.eventUpdates}
                onCheckedChange={(checked) =>
                  updatePreferences({ eventUpdates: checked })
                }
              />
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Las notificaciones aparecen incluso cuando la app está cerrada</div>
          <div>• Puedes cambiar estos ajustes en cualquier momento</div>
          <div>• Respeta la privacidad: nunca compartimos tu información</div>
        </div>
      </CardContent>
    </Card>
  )
}
