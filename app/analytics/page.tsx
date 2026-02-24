"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Download,
  RefreshCw,
  Eye,
  Heart,
  MessageCircle,
  Star
} from 'lucide-react'
import { format, subDays, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

// Mock data - in real implementation, fetch from analytics service
const mockAnalytics = {
  overview: {
    totalEvents: 1247,
    totalUsers: 5832,
    totalAttendees: 45291,
    totalInteractions: 12847,
    growthRate: 12.5,
    activeUsersToday: 423,
    eventsToday: 23,
    avgRating: 4.2,
    recentSignups: 156
  },
  eventsByCategory: [
    { category: 'Música', count: 342, percentage: 27.4 },
    { category: 'Deporte', count: 298, percentage: 23.9 },
    { category: 'Arte & Cultura', count: 187, percentage: 15.0 },
    { category: 'Gastronomía', count: 156, percentage: 12.5 },
    { category: 'Tecnología', count: 134, percentage: 10.7 },
    { category: 'Bienestar', count: 87, percentage: 7.0 },
    { category: 'Otros', count: 43, percentage: 3.5 }
  ],
  userEngagement: {
    dailyActive: [423, 456, 389, 523, 467, 512, 489],
    weeklyActive: [2834, 3124, 2956, 3245, 3189, 3342, 3218],
    monthlyActive: [12456, 13234, 12890, 13654, 13421, 13892, 14234]
  },
  topEvents: [
    {
      id: '1',
      title: 'Festival de Jazz 2024',
      category: 'Música',
      attendees: 1250,
      rating: 4.8,
      interactions: 456,
      location: 'Buenos Aires'
    },
    {
      id: '2',
      title: 'Maratón Ciudad',
      category: 'Deporte',
      attendees: 980,
      rating: 4.6,
      interactions: 389,
      location: 'Córdoba'
    },
    {
      id: '3',
      title: 'Expo Tech 2024',
      category: 'Tecnología',
      attendees: 756,
      rating: 4.4,
      interactions: 567,
      location: 'Rosario'
    }
  ],
  geographicData: [
    { city: 'Buenos Aires', events: 456, users: 2341, percentage: 40.1 },
    { city: 'Córdoba', events: 234, users: 1234, percentage: 21.1 },
    { city: 'Rosario', events: 187, users: 987, percentage: 16.8 },
    { city: 'Mendoza', events: 123, users: 654, percentage: 11.2 },
    { city: 'Tucumán', events: 89, users: 432, percentage: 7.4 },
    { city: 'Otros', events: 158, users: 1184, percentage: 3.4 }
  ],
  timeSeries: {
    events: [
      { date: '2024-11-01', count: 12 },
      { date: '2024-11-02', count: 18 },
      { date: '2024-11-03', count: 15 },
      { date: '2024-11-04', count: 22 },
      { date: '2024-11-05', count: 19 },
      { date: '2024-11-06', count: 25 },
      { date: '2024-11-07', count: 21 }
    ],
    users: [
      { date: '2024-11-01', count: 234 },
      { date: '2024-11-02', count: 256 },
      { date: '2024-11-03', count: 289 },
      { date: '2024-11-04', count: 312 },
      { date: '2024-11-05', count: 298 },
      { date: '2024-11-06', count: 334 },
      { date: '2024-11-07', count: 321 }
    ]
  }
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [loading, setLoading] = useState(false)

  const refreshData = async () => {
    setLoading(true)
    // In real implementation, fetch fresh data
    setTimeout(() => setLoading(false), 1000)
  }

  const exportData = () => {
    // In real implementation, generate and download CSV/Excel
    console.log('Exporting analytics data...')
    alert('Datos exportados (funcionalidad simulada)')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Métricas y estadísticas de Juntapp
            </p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
                <SelectItem value="90d">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>

            <Button onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Eventos Totales</p>
                  <p className="text-2xl font-bold">{mockAnalytics.overview.totalEvents.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{mockAnalytics.overview.growthRate}% este mes
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuarios Activos</p>
                  <p className="text-2xl font-bold">{mockAnalytics.overview.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {mockAnalytics.overview.activeUsersToday} hoy
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Asistentes</p>
                  <p className="text-2xl font-bold">{mockAnalytics.overview.totalAttendees.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    Total acumulado
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rating Promedio</p>
                  <p className="text-2xl font-bold">{mockAnalytics.overview.avgRating}/5.0</p>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= Math.round(mockAnalytics.overview.avgRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="geographic">Geográfico</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Crecimiento Semanal</CardTitle>
                  <CardDescription>Eventos y usuarios nuevos por semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Eventos esta semana:</span>
                      <Badge variant="default">{mockAnalytics.overview.eventsToday}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Usuarios activos:</span>
                      <Badge variant="secondary">{mockAnalytics.overview.activeUsersToday}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tasa de crecimiento:</span>
                      <Badge variant="outline" className="text-green-600">
                        +{mockAnalytics.overview.growthRate}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interacciones Totales</CardTitle>
                  <CardDescription>Comentarios, likes y asistencias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary mb-2">
                      {mockAnalytics.overview.totalInteractions.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      interacciones en total
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Eventos por Categoría</CardTitle>
                  <CardDescription>Distribución de eventos por tipo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAnalytics.eventsByCategory.map((item) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Eventos Más Populares</CardTitle>
                  <CardDescription>Top eventos por asistencia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.topEvents.map((event, index) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{event.attendees}</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= Math.round(event.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usuarios Activos</CardTitle>
                  <CardDescription>Actividad diaria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600 mb-2">
                      {mockAnalytics.overview.activeUsersToday}
                    </p>
                    <p className="text-sm text-muted-foreground">usuarios activos hoy</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Crecimiento</CardTitle>
                  <CardDescription>Usuarios nuevos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      +{mockAnalytics.overview.recentSignups}
                    </p>
                    <p className="text-sm text-muted-foreground">este mes</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement</CardTitle>
                  <CardDescription>Interacciones promedio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600 mb-2">
                      {Math.round(mockAnalytics.overview.totalInteractions / mockAnalytics.overview.totalUsers)}
                    </p>
                    <p className="text-sm text-muted-foreground">por usuario</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Geographic Tab */}
          <TabsContent value="geographic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución Geográfica</CardTitle>
                <CardDescription>Eventos y usuarios por ciudad</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.geographicData.map((item) => (
                    <div key={item.city} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.city}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.users.toLocaleString()} usuarios
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.events} eventos</p>
                        <Badge variant="outline">{item.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Engagement</CardTitle>
                <CardDescription>Interacciones y participación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(mockAnalytics.overview.totalInteractions / mockAnalytics.overview.totalEvents)}
                    </p>
                    <p className="text-sm text-muted-foreground">visualizaciones por evento</p>
                  </div>

                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">
                      {Math.round(mockAnalytics.overview.totalInteractions * 0.3)}
                    </p>
                    <p className="text-sm text-muted-foreground">likes totales</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(mockAnalytics.overview.totalInteractions * 0.2)}
                    </p>
                    <p className="text-sm text-muted-foreground">comentarios totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
