"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_COLORS, type Event } from "@/lib/mock-data"

export function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/evento/${event.id}`}>
      <Card className="group overflow-hidden border-border transition-all hover:shadow-lg hover:-translate-y-1 py-0">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={event.flyerUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge className={CATEGORY_COLORS[event.category]}>
              {event.category}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 text-base font-semibold leading-tight text-foreground text-pretty line-clamp-2">
            {event.title}
          </h3>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>
                {new Date(event.date).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "short",
                })} - {event.time}hs
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>{event.attendees} asistentes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
