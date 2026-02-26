'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users,
  Calendar,
  TrendingUp,
  Shield,
  Search,
  Ban,
  CheckCircle,
  AlertTriangle,
  Settings,
  BarChart3,
  Loader2
} from 'lucide-react'
import { useUnifiedToast } from '@/hooks/use-unified-toast'

interface AdminStats {
  totalUsers: number
  totalEvents: number
  reportedEvents: number
  bannedUsers: number
  recentSignups: number
  activeEvents: number
}

interface AdminUser {
  uid: string
  displayName: string
  email: string
  isVerified: boolean
  isBanned: boolean
  role: 'user' | 'admin'
  eventsCreated: number
  createdAt: Date
  lastLogin?: Date
}

interface AdminEvent {
  id: string
  title: string
  creator: string
  status: 'reported' | 'active' | 'removed'
  reports: number
  attendees: number
}

function AdminPageContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const toast = useUnifiedToast()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (!authLoading && user) {
      loadAdminData()
    }
  }, [user, authLoading, router])

  const loadAdminData = async () => {
    try {
      setLoading(true)

      setStats({
        totalUsers: 1247,
        totalEvents: 89,
        reportedEvents: 3,
        bannedUsers: 12,
        recentSignups: 45,
        activeEvents: 67
      })

      setUsers([
        {
          uid: 'user-1',
          displayName: 'María García',
          email: 'maria@example.com',
          isVerified: true,
          isBanned: false,
          role: 'user',
          eventsCreated: 5,
          createdAt: new Date('2024-01-15'),
          lastLogin: new Date('2024-12-10')
        },
        {
          uid: 'user-2',
          displayName: 'Carlos Rodríguez',
          email: 'carlos@example.com',
          isVerified: false,
          isBanned: true,
          role: 'user',
          eventsCreated: 2,
          createdAt: new Date('2024-02-20'),
          lastLogin: new Date('2024-11-15')
        }
      ])

      setEvents([
        {
          id: 'event-1',
          title: 'Concierto Problemático',
          creator: 'María García',
          status: 'reported',
          reports: 3,
          attendees: 45
        }
      ])

    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: 'ban' | 'unban' | 'promote' | 'demote') => {
    try {
      setUsers(users.map(u =>
        u.uid === userId
          ? {
              ...u,
              isBanned: action === 'ban' ? true : action === 'unban' ? false : u.isBanned,
              role: action === 'promote' ? 'admin' : action === 'demote' ? 'user' : u.role
            }
          : u
      ))

      toast.success('Usuario actualizado', {
        description: `Usuario ${action === 'ban' ? 'baneado' : action === 'unban' ? 'desbaneado' : action === 'promote' ? 'promovido' : 'degradado'} exitosamente`
      })
    } catch (error) {
      console.error(`Error ${action}ing user:`, error)
      toast.error('Error al actualizar usuario')
    }
  }

  const handleEventAction = async (eventId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      setEvents(events.filter(e => e.id !== eventId))

      toast.success('Evento actualizado', {
        description: `Evento ${action === 'approve' ? 'aprobado' : action === 'reject' ? 'rechazado' : 'eliminado'} exitosamente`
      })
    } catch (error) {
      console.error(`Error ${action}ing event:`, error)
      toast.error('Error al actualizar evento')
    }
  }

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-center">
              Cargando...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Panel de Administración
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona usuarios, eventos y configuraciones del sistema
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Usuarios totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalEvents}</p>
                    <p className="text-sm text-muted-foreground">Eventos totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.reportedEvents}</p>
                    <p className="text-sm text-muted-foreground">Eventos reportados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.recentSignups}</p>
                    <p className="text-sm text-muted-foreground">Nuevos usuarios</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Eventos
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Reportes
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                  Administra usuarios, roles y permisos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="user-search">Buscar usuarios</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="user-search"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.uid} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} />
                          <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.displayName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={user.isVerified ? "default" : "secondary"}>
                              {user.isVerified ? "Verificado" : "No verificado"}
                            </Badge>
                            <Badge variant={user.role === 'admin' ? "destructive" : "outline"}>
                              {user.role === 'admin' ? "Admin" : "Usuario"}
                            </Badge>
                            {user.isBanned && (
                              <Badge variant="destructive">Baneado</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {user.isBanned ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.uid, 'unban')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Desbanear
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUserAction(user.uid, 'ban')}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Banear
                          </Button>
                        )}

                        {user.role === 'user' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.uid, 'promote')}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Promover
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.uid, 'demote')}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Degradar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderación de Eventos</CardTitle>
                <CardDescription>
                  Revisa y modera eventos reportados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">Por: {event.creator}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={event.status === 'reported' ? "destructive" : "default"}>
                            {event.status === 'reported' ? `${event.reports} reportes` : 'Activo'}
                          </Badge>
                          <Badge variant="outline">{event.attendees} asistentes</Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEventAction(event.id, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprobar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEventAction(event.id, 'reject')}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleEventAction(event.id, 'delete')}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reportes del Sistema</CardTitle>
                <CardDescription>
                  Estadísticas y reportes del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Estadísticas Generales
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Usuarios activos hoy:</span>
                        <span className="font-medium">127</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Eventos creados hoy:</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reportes pendientes:</span>
                        <span className="font-medium text-red-600">3</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Acciones Recientes</h3>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-muted rounded">
                        <p>Usuario "Carlos" baneado por spam</p>
                        <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p>Evento "Fiesta X" aprobado</p>
                        <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <CardDescription>
                  Configura parámetros globales del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="max-events">Máximo eventos por usuario</Label>
                    <Select defaultValue="10">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 eventos</SelectItem>
                        <SelectItem value="10">10 eventos</SelectItem>
                        <SelectItem value="25">25 eventos</SelectItem>
                        <SelectItem value="50">50 eventos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moderation">Moderación automática</Label>
                    <Select defaultValue="manual">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automática</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="hybrid">Híbrida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button>Guardar Configuración</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminPageContent
