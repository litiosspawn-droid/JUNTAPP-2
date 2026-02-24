"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CATEGORIES } from "@/lib/mock-data"
import { Upload, CalendarDays, Clock, MapPin, Send } from "lucide-react"

const DraggableMap = dynamic(
  () => import("@/components/map-view").then((mod) => mod.DraggableMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-lg bg-muted" />
    ),
  }
)

export default function CrearPage() {
  const [preview, setPreview] = useState<string | null>(null)
  const [lat, setLat] = useState(-34.6037)
  const [lng, setLng] = useState(-58.3816)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Crear nuevo evento
          </h1>
          <p className="mt-1 text-muted-foreground">
            Completa los detalles para publicar tu evento.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalles del evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              {/* Title */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" placeholder="Nombre de tu evento" />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">Categoría</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Flyer upload */}
              <div className="flex flex-col gap-2">
                <Label>Flyer del evento</Label>
                <div
                  className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-8 transition-colors hover:bg-muted"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
                  }}
                >
                  {preview ? (
                    <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-md">
                      <Image
                        src={preview}
                        alt="Preview del flyer"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Haz click para subir una imagen
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG o WEBP (max 5MB)
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="date">Fecha</Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="date" type="date" className="pl-9" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="time">Hora</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="time" type="time" className="pl-9" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="address">Dirección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="address" placeholder="Dirección del evento" className="pl-9" />
                </div>
              </div>

              {/* Map */}
              <div className="flex flex-col gap-2">
                <Label>Ubicación en el mapa</Label>
                <p className="text-xs text-muted-foreground">
                  Arrastra el marcador para ajustar la ubicación exacta.
                </p>
                <DraggableMap
                  className="h-64 w-full"
                  onPositionChange={(newLat, newLng) => {
                    setLat(newLat)
                    setLng(newLng)
                  }}
                />
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Lat: {lat.toFixed(4)}</span>
                  <span>Lng: {lng.toFixed(4)}</span>
                </div>
              </div>

              {/* Submit */}
              <Button type="button" size="lg" className="gap-2">
                <Send className="h-4 w-4" />
                Publicar evento
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
