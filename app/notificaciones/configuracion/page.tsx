'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { withAuth } from '@/hoc/withAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell, Mail, Smartphone, Clock, Calendar } from 'lucide-react'
import { useUnifiedToast } from '@/hooks/use-unified-toast'
import { db } from '@/lib/firebase/client'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

function NotificationSettingsPageContent() {
  const { user } = useAuth()
  const toast = useUnifiedToast()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    reminderTime: '24h', // '1h', '24h', '1week'
    weeklySummary: true,
    newAttendeeAlerts: true,
    eventUpdates: true,
  })

  useEffect(() => {
    if (!user) return

    const loadSettings = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setSettings({
            emailNotifications: data.emailNotifications ?? true,
            pushNotifications: data.pushNotifications ?? true,
            eventReminders: data.eventReminders ?? true,
            reminderTime: data.reminderTime ?? '24h',
            weeklySummary: data.weeklySummary ?? true,
            newAttendeeAlerts: data.newAttendeeAlerts ?? true,
            eventUpdates: data.eventUpdates ?? true,
          })
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }

    loadSettings()
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...settings,
        updatedAt: new Date(),
      })

      toast.success('Configuración guardada', {
        description: 'Tus preferencias de notificación fueron actualizadas',
      })
    } catch (error) {
      toast.error('Error al guardar', {
        description: 'No se pudo actualizar la configuración',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPushPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('No soportado', {
        description: 'Tu navegador no soporta notificaciones push',
      })
      return
    }

    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      toast.success('Notificaciones activadas', {
        description: 'Ahora recibirás notificaciones push',
      })
      
      // Guardar token para Firebase Cloud Messaging
      // Esto requiere configurar firebase-messaging-sw.js
    }
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configuración de Notificaciones</h1>
          <p className="text-muted-foreground">
            Gestioná cómo y cuándo querés recibir notificaciones
          </p>
        </div>

        <div className="space-y-6">
          {/* Notificaciones Push */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <CardTitle>Notificaciones Push</CardTitle>
              </div>
              <CardDescription>
                Recibí notificaciones en tu dispositivo incluso cuando no estás en la app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleRequestPushPermission}
                variant="outline"
                className="w-full gap-2"
              >
                <Bell className="h-4 w-4" />
                Activar Notificaciones Push
              </Button>
            </CardContent>
          </Card>

          {/* Preferencias Generales */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Preferencias</CardTitle>
              </div>
              <CardDescription>
                Elegí qué tipo de notificaciones querés recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Notificaciones por Email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Recibí recordatorios y actualizaciones por email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              {/* Event Reminders */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recordatorios de Eventos
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Recibí un recordatorio antes de tus eventos
                  </p>
                </div>
                <Switch
                  checked={settings.eventReminders}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, eventReminders: checked })
                  }
                />
              </div>

              {/* Reminder Time */}
              {settings.eventReminders && (
                <div className="space-y-2 pl-6">
                  <Label className="text-sm">Cuándo enviar recordatorio</Label>
                  <Select
                    value={settings.reminderTime}
                    onValueChange={(value) =>
                      setSettings({ ...settings, reminderTime: value })
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hora antes</SelectItem>
                      <SelectItem value="24h">24 horas antes</SelectItem>
                      <SelectItem value="1week">1 semana antes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Weekly Summary */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Resumen Semanal
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Recibí un resumen de eventos cada lunes
                  </p>
                </div>
                <Switch
                  checked={settings.weeklySummary}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, weeklySummary: checked })
                  }
                />
              </div>

              {/* New Attendee Alerts */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Nuevos Asistentes</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones cuando alguien se registra en tus eventos
                  </p>
                </div>
                <Switch
                  checked={settings.newAttendeeAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, newAttendeeAlerts: checked })
                  }
                />
              </div>

              {/* Event Updates */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Actualizaciones de Eventos</Label>
                  <p className="text-sm text-muted-foreground">
                    Cambios de fecha, cancelaciones, etc.
                  </p>
                </div>
                <Switch
                  checked={settings.eventUpdates}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, eventUpdates: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default withAuth(NotificationSettingsPageContent);
