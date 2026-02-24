'use client'

import { useState, useEffect } from 'react'
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventCard } from '@/components/event-card'
import { Search, Users, Calendar, MapPin, Globe, Trophy } from "lucide-react"
import { getAllUsers, getAllEvents, type UserProfile, type Event } from '@/lib/firebase/community'

export default function ComunidadPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        setLoading(true)
        console.log('🌍 Loading community data...')

        const [usersData, eventsData] = await Promise.all([
          getAllUsers(),
          getAllEvents()
        ])

        console.log('✅ Community data loaded:', { users: usersData.length, events: eventsData.length })

        setUsers(usersData)
        setAllEvents(eventsData)
      } catch (error) {
        console.error('❌ Error loading community data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCommunityData()
  }, [])

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get events for selected user
  const userEvents = selectedUser
    ? allEvents.filter(event => event.createdBy === selectedUser.uid)
    : []

  // Calculate community stats
  const communityStats = {
    totalUsers: users.length,
    totalEvents: allEvents.length,
    activeUsers: users.filter(user => {
      const userEvents = allEvents.filter(event => event.createdBy === user.uid)
      return userEvents.length > 0
    }).length,
    totalAttendees: allEvents.reduce((sum, event) => sum + (Number(event.attendees) || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p>Cargando comunidad...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Comunidad JuntApp</h1>
            </div>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Conecta con la comunidad local, descubre eventos y conoce a otros organizadores
            </p>

            {/* Community Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">{communityStats.totalUsers}</div>
                <div className="text-sm opacity-90">Miembros</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">{communityStats.totalEvents}</div>
                <div className="text-sm opacity-90">Eventos</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">{communityStats.activeUsers}</div>
                <div className="text-sm opacity-90">Organizadores</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">{communityStats.totalAttendees}</div>
                <div className="text-sm opacity-90">Asistencias</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Miembros ({users.length})
                </TabsTrigger>
                <TabsTrigger value="events" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Todos los Eventos ({allEvents.length})
                </TabsTrigger>
              </TabsList>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar miembros..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <TabsContent value="users">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredUsers.map((user) => {
                    const userEventCount = allEvents.filter(event => event.createdBy === user.uid).length
                    const userAttendeeCount = allEvents
                      .filter(event => event.createdBy === user.uid)
                      .reduce((sum, event) => sum + (Number(event.attendees) || 0), 0)

                    return (
                      <Card key={user.uid} className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => setSelectedUser(user)}>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.photoURL} />
                              <AvatarFallback>
                                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{user.displayName || 'Usuario'}</h3>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>

                          {user.bio && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {user.bio}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{userEventCount}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{userAttendeeCount}</span>
                              </div>
                            </div>
                            {user.location && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span className="text-xs">{user.location}</span>
                              </div>
                            )}
                          </div>

                          {userEventCount > 0 && (
                            <Badge variant="secondary" className="mt-2">
                              Organizador Activo
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {filteredUsers.length === 0 && searchQuery && (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No se encontraron miembros</h3>
                    <p className="text-muted-foreground">
                      Intenta con otros términos de búsqueda
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="events">
                {allEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No hay eventos aún</h3>
                    <p className="text-muted-foreground mb-6">
                      ¡Sé el primero en crear un evento para la comunidad!
                    </p>
                    <Button onClick={() => window.location.href = '/crear'}>
                      Crear Evento
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {allEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedUser.photoURL} />
                      <AvatarFallback className="text-2xl">
                        {(selectedUser.displayName || selectedUser.email || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{selectedUser.displayName || 'Usuario'}</CardTitle>
                      <p className="text-muted-foreground">{selectedUser.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedUser(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedUser.bio && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Biografía</h4>
                    <p className="text-muted-foreground">{selectedUser.bio}</p>
                  </div>
                )}

                {selectedUser.website && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Sitio web</h4>
                    <a
                      href={selectedUser.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selectedUser.website}
                    </a>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="font-medium mb-3">Eventos de {selectedUser.displayName || 'este usuario'}</h4>
                  {userEvents.length === 0 ? (
                    <p className="text-muted-foreground">Aún no ha creado eventos</p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {userEvents.slice(0, 6).map((event) => (
                        <div key={event.id} className="border rounded-lg p-3">
                          <h5 className="font-medium text-sm mb-1">{event.title}</h5>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(event.date).toLocaleDateString('es-AR')}</span>
                          </div>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {event.category}
                          </Badge>
                        </div>
                      ))}
                      {userEvents.length > 6 && (
                        <div className="border rounded-lg p-3 text-center">
                          <p className="text-sm text-muted-foreground">
                            +{userEvents.length - 6} eventos más
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
