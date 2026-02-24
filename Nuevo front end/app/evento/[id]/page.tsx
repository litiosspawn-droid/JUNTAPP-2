"use client"

import { use } from "react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  MOCK_EVENTS,
  MOCK_CHAT_MESSAGES,
  CATEGORY_COLORS,
} from "@/lib/mock-data"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Send,
  CheckCircle2,
} from "lucide-react"

const MapView = dynamic(
  () => import("@/components/map-view").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-lg bg-muted" />
    ),
  }
)

export default function EventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const event = MOCK_EVENTS.find((e) => e.id === Number(id))

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center px-4">
          <h1 className="text-2xl font-bold text-foreground">Evento no encontrado</h1>
          <p className="mt-2 text-muted-foreground">El evento que buscas no existe.</p>
          <Link href="/">
            <Button className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        {/* Back link */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a eventos
        </Link>

        {/* Flyer */}
        <div className="relative mb-6 aspect-[2/1] w-full overflow-hidden rounded-xl">
          <Image
            src={event.flyerUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-4 left-4">
            <Badge className={`${CATEGORY_COLORS[event.category]} text-sm px-3 py-1`}>
              {event.category}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl text-balance">
                {event.title}
              </h1>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            </div>

            {/* Details */}
            <Card>
              <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(event.date).toLocaleDateString("es-AR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">Fecha</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {event.time}hs
                    </p>
                    <p className="text-xs text-muted-foreground">Hora</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {event.address}
                    </p>
                    <p className="text-xs text-muted-foreground">Dirección</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {event.attendees} personas
                    </p>
                    <p className="text-xs text-muted-foreground">Asistentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <div>
              <h2 className="mb-3 text-lg font-semibold text-foreground">Ubicación</h2>
              <MapView
                events={[event]}
                center={[event.lat, event.lng]}
                zoom={15}
                className="h-64 w-full"
                interactive={false}
              />
            </div>

            {/* Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chat del evento</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
                  {MOCK_CHAT_MESSAGES.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {msg.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {msg.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {msg.timestamp}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm leading-relaxed text-foreground">
                          {msg.text}
                        </p>
                        {msg.reactions.length > 0 && (
                          <div className="mt-1 flex gap-1">
                            {msg.reactions.map((reaction, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                              >
                                {reaction.emoji} {reaction.count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Input placeholder="Escribe un mensaje..." className="flex-1" />
                  <Button size="icon" className="shrink-0">
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Enviar mensaje</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <Button size="lg" className="w-full gap-2 text-base">
              <CheckCircle2 className="h-5 w-5" />
              Asistir
            </Button>

            <Card>
              <CardContent className="p-4">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Asistentes destacados</h3>
                <div className="flex flex-col gap-2">
                  {["Ana M.", "Carlos R.", "Lucía F.", "Pedro L."].map((name) => (
                    <div key={name} className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">{name}</span>
                    </div>
                  ))}
                  <p className="mt-1 text-xs text-muted-foreground">
                    y {event.attendees - 4} más
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
