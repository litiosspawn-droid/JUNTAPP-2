'use client'

import { useState, useEffect } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Bell, BellOff, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function NotificationTest() {
  const {
    token,
    permission,
    preferences,
    requestPermission,
    updatePreferences,
    isSupported,
  } = useNotifications()

  const { toast } = useToast()
  const [testing, setTesting] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const addDebug = (msg: string) => {
    setDebugInfo(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const handleRequestPermission = async () => {
    const result = await requestPermission()
    
    if (result) {
      toast({
        title: '¡Permiso concedido!',
        description: 'Las notificaciones push están habilitadas',
      })
    } else {
      toast({
        title: 'Permiso denegado',
        description: 'No se pudo habilitar las notificaciones',
        variant: 'destructive',
      })
    }
  }

  const handleTestNotification = async () => {
    if (!token) {
      toast({
        title: 'Sin token FCM',
        description: 'Primero debes habilitar las notificaciones',
        variant: 'destructive',
      })
      return
    }

    setTesting(true)
    
    try {
      // Enviar notificación de prueba a la API
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user', // Esto debería ser el user ID real
          type: 'event_reminder',
          payload: {
            title: '🧪 Notificación de Prueba',
            body: '¡Las notificaciones push están funcionando correctamente!',
            icon: '/icon-192x192.png',
            url: '/',
            data: { type: 'test', timestamp: new Date().toISOString() },
          },
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: '¡Prueba exitosa!',
          description: 'La notificación fue enviada correctamente',
        })
      } else {
        throw new Error(result.error || 'Error al enviar notificación')
      }
    } catch (error: any) {
      toast({
        title: 'Error en la prueba',
        description: error.message || 'No se pudo enviar la notificación de prueba',
        variant: 'destructive',
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configuración de Notificaciones Push
        </CardTitle>
        <CardDescription>
          Gestiona las notificaciones push de JuntApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!mounted ? (
          <div className="text-center text-muted-foreground py-4">
            Cargando configuración de notificaciones...
          </div>
        ) : (
          <>
            {/* Estado del soporte */}
            <div className="flex items-center gap-2">
              {isSupported ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Soportado en este navegador</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">No soportado en este navegador</span>
                </div>
              )}
            </div>

            {/* Estado del permiso */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${
                permission === 'granted' ? 'text-green-600' :
                permission === 'denied' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {permission === 'granted' ? <CheckCircle className="h-4 w-4" /> :
                 permission === 'denied' ? <AlertCircle className="h-4 w-4" /> :
                 <BellOff className="h-4 w-4" />}
                <span className="text-sm">
                  Permiso: {
                    permission === 'granted' ? 'Concedido' :
                    permission === 'denied' ? 'Denegado' :
                    'Pendiente'
                  }
                </span>
              </div>
            </div>

            {/* Token FCM */}
            {token && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Token FCM:</label>
                <code className="block p-2 bg-muted rounded text-xs break-all">
                  {token.substring(0, 50)}...
                </code>
              </div>
            )}

            {/* Botón de habilitar */}
            {permission !== 'granted' && (
              <Button
                onClick={handleRequestPermission}
                disabled={!isSupported}
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Habilitar Notificaciones
              </Button>
            )}

            {/* Preferencias */}
            {permission === 'granted' && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">Preferencias de Notificación</h4>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Recordatorios de Eventos</label>
                        <p className="text-xs text-muted-foreground">
                          Recibí recordatorios antes de tus eventos
                        </p>
                      </div>
                      <Switch
                        checked={preferences.eventReminders}
                        onCheckedChange={(checked) =>
                          updatePreferences({ eventReminders: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Mensajes del Chat</label>
                        <p className="text-xs text-muted-foreground">
                          Notificaciones cuando recibas mensajes
                        </p>
                      </div>
                      <Switch
                        checked={preferences.chatMessages}
                        onCheckedChange={(checked) =>
                          updatePreferences({ chatMessages: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Nuevos Eventos</label>
                        <p className="text-xs text-muted-foreground">
                          Eventos nuevos cerca de tu ubicación
                        </p>
                      </div>
                      <Switch
                        checked={preferences.newEvents}
                        onCheckedChange={(checked) =>
                          updatePreferences({ newEvents: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Actualizaciones de Eventos</label>
                        <p className="text-xs text-muted-foreground">
                          Cambios en eventos a los que asistís
                        </p>
                      </div>
                      <Switch
                        checked={preferences.eventUpdates}
                        onCheckedChange={(checked) =>
                          updatePreferences({ eventUpdates: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Botón de prueba */}
                <Button
                  onClick={handleTestNotification}
                  disabled={testing || !token}
                  variant="outline"
                  className="w-full"
                >
                  {testing ? 'Enviando...' : '🧪 Enviar Notificación de Prueba'}
                </Button>
              </div>
            )}

            {/* Debug Info */}
            <div className="mt-4 p-3 bg-muted rounded-md text-xs space-y-1">
              <h5 className="font-semibold mb-2">🔍 Debug:</h5>
              <p><strong>Soportado:</strong> {isSupported ? '✅ Sí' : '❌ No'}</p>
              <p><strong>Permiso:</strong> {permission}</p>
              <p><strong>Token:</strong> {token ? token.substring(0, 30) + '...' : 'Sin token'}</p>
              <p><strong>VAPID Key:</strong> {process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ? '✅ Configurada' : '❌ No configurada'}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
