'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Settings, LogOut, User, Mail, Trophy, Globe } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { logoutUser, getUserProfile } from '@/lib/firebase/auth'
import { getEvents, type Event } from '@/lib/firebase/events'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

  // Calculate profile completion
  const getProfileCompletion = () => {
    const fields = [
      userProfile?.displayName,
      userProfile?.bio,
      userProfile?.location,
      userProfile?.website,
      userProfile?.photoURL
    ]
    const completed = fields.filter(Boolean).length
    return Math.round((completed / fields.length) * 100)
  }

  const profileCompletion = getProfileCompletion()

  // Achievement badges based on activity
  const getAchievements = () => {
    const achievements = []
    
    if (userEvents.length >= 1) achievements.push({ name: 'Primer Evento', icon: '🎉', color: 'bg-yellow-500' })
    if (userEvents.length >= 5) achievements.push({ name: 'Organizador Activo', icon: '⭐', color: 'bg-blue-500' })
    if (userEvents.length >= 10) achievements.push({ name: 'Experto en Eventos', icon: '🏆', color: 'bg-purple-500' })
    if (profileCompletion >= 80) achievements.push({ name: 'Perfil Completo', icon: '✅', color: 'bg-green-500' })
    
    return achievements
  }

  const achievements = getAchievements()

  // Get user level based on activity
  const getUserLevel = () => {
    const totalActivity = userEvents.length * 10 // 10 points per event
    if (totalActivity >= 100) return { level: 5, title: 'Experto', color: 'text-purple-600' }
    if (totalActivity >= 50) return { level: 4, title: 'Avanzado', color: 'text-blue-600' }
    if (totalActivity >= 25) return { level: 3, title: 'Intermedio', color: 'text-green-600' }
    if (totalActivity >= 10) return { level: 2, title: 'Principiante', color: 'text-yellow-600' }
    return { level: 1, title: 'Nuevo', color: 'text-gray-600' }
  }

  const userLevel = getUserLevel()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Profile Completion Banner */}
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Completitud del perfil</span>
                  <span className="text-sm font-bold">{profileCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
                {profileCompletion < 100 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Completa tu perfil para desbloquear más funciones
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile info */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 relative">
                    <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                      <AvatarImage src={userProfile?.photoURL} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                        {user.displayName?.[0] || user.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border-2 border-background">
                      <div className={`w-4 h-4 rounded-full ${userLevel.color.replace('text-', 'bg-')}`}></div>
                    </div>
                  </div>
                  <CardTitle className="text-xl">
                    {user.displayName || 'Usuario'}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm mb-2">
                    {user.email}
                  </p>
                  <div className={`text-sm font-medium ${userLevel.color}`}>
                    Nivel {userLevel.level}: {userLevel.title}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Achievements */}
                  {achievements.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Logros
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {achievements.map((achievement, index) => (
                          <div
                            key={index}
                            className={`${achievement.color} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1`}
                          >
                            <span>{achievement.icon}</span>
                            <span>{achievement.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {userProfile?.bio && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Biografía
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {userProfile.bio}
                      </p>
                    </div>
                  )}

                  {userProfile?.website && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Sitio web
                      </h4>
                      <a
                        href={userProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {userProfile.website}
                      </a>
                    </div>
                  )}

                  {userProfile?.location && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Ubicación
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{userProfile.location}</span>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-sm">Estadísticas</h4>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{userEvents.length}</div>
                        <div className="text-xs text-muted-foreground">Eventos creados</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-xs text-muted-foreground">Seguidores</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Miembro desde</span>
                        <span className="font-medium">
                          {userProfile?.createdAt?.toDate?.().toLocaleDateString('es-AR') ||
                           new Date().toLocaleDateString('es-AR')
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <Button variant="outline" className="w-full gap-2" onClick={() => router.push('/profile/edit')}>
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
