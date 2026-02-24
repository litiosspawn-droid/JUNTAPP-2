'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Settings, LogOut, User, Mail } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { logoutUser, getUserProfile } from '@/lib/firebase/auth'
import { getEvents, type Event } from '@/lib/firebase/events'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userEvents, setUserEvents] = useState<Event[]>([])
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    if (!user && !loading) {
      router.push('/')
      return
    }

    const loadUserData = async () => {
      if (!user) return

      try {
        const [profile, events] = await Promise.all([
          getUserProfile(user.uid),
          getEvents()
        ])
        
        setUserProfile(profile)
        
        // Filter events created by this user
        const userCreatedEvents = events.filter(event => 
          event.createdBy === user.uid
        )
        setUserEvents(userCreatedEvents)
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoadingProfile(false)
      }
    }

    loadUserData()
  }, [user, loading])

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading || loadingProfile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p>Cargando perfil...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4">
                    <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-foreground">
                        {user.displayName?.[0] || user.email?.[0] || 'U'}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">
                    {user.displayName || 'Usuario'}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {user.email}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userProfile?.bio && (
                    <div>
                      <h4 className="font-medium mb-2">Biografía</h4>
                      <p className="text-sm text-muted-foreground">
                        {userProfile.bio}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Eventos creados</span>
                      <span className="font-medium">{userEvents.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Miembro desde</span>
                      <span className="font-medium">
                        {userProfile?.createdAt?.toDate?.().toLocaleDateString('es-AR') || 
                         new Date().toLocaleDateString('es-AR')
                        }
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <Button variant="outline" className="w-full gap-2">
                      <Settings className="h-4 w-4" />
                      Editar Perfil
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full gap-2 text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User's events */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Mis Eventos Creados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No has creado eventos</h3>
                      <p className="text-muted-foreground mb-6">
                        Comienza creando tu primer evento para compartir con la comunidad
                      </p>
                      <Button onClick={() => router.push('/crear')} className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Crear Primer Evento
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userEvents.map((event) => (
                        <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg mb-1">{event.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {new Date(event.date).toLocaleDateString('es-AR', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{event.time}hs</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{event.attendees} asistentes</span>
                                </div>
                              </div>
                            </div>
                            <Badge>{event.category}</Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{event.address}</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              {event.description}
                            </p>
                          </div>

                          <div className="flex gap-2 pt-3 border-t">
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
