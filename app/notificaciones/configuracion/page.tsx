'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { withAuth } from '@/hoc/withAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, Mail, Clock, Calendar } from 'lucide-react'
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
    reminderTime: '24h',
    weeklySummary: false,
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
            weeklySummary: data.weeklySummary ?? false,
            newAttendeeAlerts: data.newAttendeeAlerts ?? true,
            eventUpdates: data.eventUpdates ?? true,
          })
        }
      } catch (error) {
        toast.error('Error al cargar configuración')
      }
    }

    loadSettings()
  }, [user, toast])

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...settings,
        updatedAt: new Date(),
      })

      toast.success('Configuración guardada')
    } catch (error) {
      toast.error('Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPushPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Tu navegador no soporta notificaciones push')
      return
    }

    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      toast.success('Notificaciones activadas')
      setSettings({ ...settings, pushNotifications: true })
    }
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notificaciones</h1>
          <p className="text-muted-foreground">
            Gestioná cómo y cuándo recibir notificaciones
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notificaciones Push</CardTitle>
              </div>
              <CardDescription>
                Recibí notificaciones en tu dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleRequestPushPermission}
                variant={settings.pushNotifications ? 'default' : 'outline'}
                className="w-full gap-2"
              >
                <Bell className="h-4 w-4" />
                {settings.pushNotifications ? 'Activadas' : 'Activar'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferencias</CardTitle>
              <CardDescription>
                Elegí qué notificaciones recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Notificaciones por Email
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Recordatorios y actualizaciones por email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recordatorios de Eventos
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Avisos antes de tus eventos
                  </p>
                </div>
                <Switch
                  checked={settings.eventReminders}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, eventReminders: checked })
                  }
                />
              </div>

              {settings.eventReminders && (
                <div className="space-y-2 pl-6">
                  <Label className="text-sm">Cuándo enviar</Label>
                  <div className="flex gap-2">
                    {['1h', '24h', '1week'].map((time) => (
                      <Button
                        key={time}
                        variant={settings.reminderTime === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSettings({ ...settings, reminderTime: time })}
                      >
                        {time === '1h' ? '1 hora' : time === '24h' ? '24 horas' : '1 semana'}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Resumen Semanal
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Eventos cada lunes
                  </p>
                </div>
                <Switch
                  checked={settings.weeklySummary}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, weeklySummary: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nuevos Asistentes</Label>
                  <p className="text-sm text-muted-foreground">
                    Cuando alguien se registra en tus eventos
                  </p>
                </div>
                <Switch
                  checked={settings.newAttendeeAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, newAttendeeAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Actualizaciones</Label>
                  <p className="text-sm text-muted-foreground">
                    Cambios en eventos
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

export default withAuth(NotificationSettingsPageContent)
