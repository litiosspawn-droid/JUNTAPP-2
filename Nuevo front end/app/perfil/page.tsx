"use client"

import { Header, Footer } from "@/components/layout"
import { EventCard } from "@/components/event-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { MOCK_EVENTS, MOCK_USER } from "@/lib/mock-data"
import { CalendarDays, MapPin } from "lucide-react"

export default function PerfilPage() {
  const createdEvents = MOCK_EVENTS.filter((e) =>
    MOCK_USER.eventsCreated.includes(e.id)
  )
  const attendingEvents = MOCK_EVENTS.filter((e) =>
    MOCK_USER.eventsAttending.includes(e.id)
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        {/* Profile header */}
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {MOCK_USER.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {MOCK_USER.name}
              </h1>
              <p className="text-center text-muted-foreground leading-relaxed sm:text-left">
                {MOCK_USER.bio}
              </p>
              <div className="flex gap-4 mt-1">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>{createdEvents.length} eventos creados</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{attendingEvents.length} asistencias</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="created">
          <TabsList className="mb-4">
            <TabsTrigger value="created">Mis eventos</TabsTrigger>
            <TabsTrigger value="attending">Eventos que asisto</TabsTrigger>
          </TabsList>

          <TabsContent value="created">
            {createdEvents.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {createdEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg font-medium text-foreground">
                  No has creado eventos
                </p>
                <p className="text-muted-foreground">
                  Crea tu primer evento y compártelo con la comunidad.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="attending">
            {attendingEvents.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {attendingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-lg font-medium text-foreground">
                  No asistes a ningún evento
                </p>
                <p className="text-muted-foreground">
                  Explora eventos y marca tu asistencia.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
