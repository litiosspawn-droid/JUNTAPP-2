"use client"

import { useEffect } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Users, Star, TrendingUp, Edit, UserPlus, UserMinus, Globe, MessageCircle } from 'lucide-react'
import { Header, Footer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EventCard } from '@/components/event-card'
import { useUserProfile } from '@/hooks/use-user-profile'
import { useAuth } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ProfilePageProps {
  userId: string
}

export function ProfilePage({ userId }: ProfilePageProps) {
  const { user: currentUser } = useAuth()
  const {
    profile,
    stats,
    createdEvents,
    attendingEvents,
    loading,
    error,
    isFollowingUser,
    checkFollowing,
    toggleFollow,
  } = useUserProfile(userId)

  // Verificar estado de seguimiento cuando cambia el usuario actual
  useEffect(() => {
    if (currentUser && currentUser.uid !== userId) {
      checkFollowing(currentUser.uid)
    }
  }, [currentUser, userId, checkFollowing])

  // Mostrar error si el usuario no existe
  if (!loading && error) {
    notFound()
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile header skeleton */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-muted rounded-full animate-pulse" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="h-8 bg-muted rounded w-48 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                    <div className="h-16 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 text-center">
                    <div className="h-8 bg-muted rounded w-16 mx-auto mb-2 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-20 mx-auto animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // No profile found
  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
              <Users className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Usuario no encontrado</h1>
            <p className="text-muted-foreground mb-6">
              El perfil que buscas no existe o ha sido eliminado.
            </p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const isOwnProfile = currentUser?.uid === userId
  const joinedDate = stats?.joinedDate ? formatDistanceToNow(stats.joinedDate, { addSuffix: true, locale: es }) : ''

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.photoURL} alt={profile.displayName || 'Usuario'} />
                    <AvatarFallback className="text-2xl">
                      {(profile.displayName || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-bold">{profile.displayName || 'Usuario'}</h1>
                        {profile.isVerified && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="w-3 h-3" />
                            Verificado
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Se unió {joinedDate}
                        </span>
                        {profile.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {profile.location}
                          </span>
                        )}
                      </div>

                      {profile.bio && (
                        <p className="text-muted-foreground mb-4">{profile.bio}</p>
                      )}

                      {profile.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline text-sm"
                        >
                          <Globe className="w-4 h-4" />
                          {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {isOwnProfile ? (
                        <Link href="/perfil/editar">
                          <Button variant="outline" className="gap-2">
                            <Edit className="w-4 h-4" />
                            Editar perfil
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          onClick={() => currentUser && toggleFollow(currentUser.uid)}
                          variant={isFollowingUser ? "outline" : "default"}
                          className="gap-2"
                        >
                          {isFollowingUser ? (
                            <>
                              <UserMinus className="w-4 h-4" />
                              Dejar de seguir
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4" />
                              Seguir
                            </>
                          )}
                        </Button>
                      )}

                      {!isOwnProfile && (
                        <Button variant="outline" className="gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Mensaje
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalEventsCreated}</div>
                  <div className="text-sm text-muted-foreground">Eventos creados</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalEventsAttended}</div>
                  <div className="text-sm text-muted-foreground">Eventos asistidos</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalFollowers}</div>
                  <div className="text-sm text-muted-foreground">Seguidores</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                    <Star className="w-4 h-4" />
                    {stats.reputation}
                  </div>
                  <div className="text-sm text-muted-foreground">Reputación</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Events Tabs */}
          <Tabs defaultValue="created" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="created" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Eventos creados ({createdEvents.length})
              </TabsTrigger>
              <TabsTrigger value="attending" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Eventos asistiendo ({attendingEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="created" className="mt-6">
              {createdEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No hay eventos creados</h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile
                        ? '¡Crea tu primer evento para compartirlo con la comunidad!'
                        : 'Este usuario aún no ha creado ningún evento.'
                      }
                    </p>
                    {isOwnProfile && (
                      <Link href="/crear" className="mt-4 inline-block">
                        <Button>Crear evento</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {createdEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="attending" className="mt-6">
              {attendingEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No hay eventos asistiendo</h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile
                        ? '¡Explora eventos cerca de ti y únete a la comunidad!'
                        : 'Este usuario aún no ha confirmado asistencia a ningún evento.'
                      }
                    </p>
                    {!isOwnProfile && (
                      <Link href="/mapa" className="mt-4 inline-block">
                        <Button>Explorar eventos</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {attendingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
