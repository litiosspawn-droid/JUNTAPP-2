'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase/client'
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { Header, Footer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ArrowLeft,
  Save,
  MapPin,
  Calendar,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { CATEGORIES, SUBCATEGORIES, type Category, CATEGORY_DESCRIPTIONS } from '@/lib/firebase/events'
import { useToast } from '@/hooks/use-toast'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/map-view').then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-lg bg-muted flex items-center justify-center">
      <MapPin className="h-8 w-8 text-muted-foreground" />
    </div>
  ),
})

interface Event {
  id: string
  title: string
  description: string
  category: Category
  subcategory?: string
  date: string
  time: string
  address: string
  lat: number
  lng: number
  flyerUrl?: string
  tags?: string[]
}

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isCreator, setIsCreator] = useState(false)
  const [formData, setFormData] = useState<Omit<Event, 'id'>>({
    title: '',
    description: '',
    category: 'Otros',
    date: '',
    time: '',
    address: '',
    lat: -34.6037,
    lng: -58.3816,
  })

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', params.id as string))
        if (!eventDoc.exists()) {
          setError('Evento no encontrado')
          return
        }

        const data = eventDoc.data()
        
        // Check if user is creator
        if (user && (data.createdBy !== user.uid && data.creatorId !== user.uid)) {
          setError('No tienes permiso para editar este evento')
          setIsCreator(false)
          return
        }
        
        setIsCreator(true)
        setFormData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'Otros',
          subcategory: data.subcategory || '',
          date: data.date?.toDate?.()?.toISOString().split('T')[0] || data.date || '',
          time: data.time || '',
          address: data.address || '',
          lat: data.lat || -34.6037,
          lng: data.lng || -58.3816,
          flyerUrl: data.flyerUrl,
          tags: data.tags || [],
        })
      } catch (err: any) {
        console.error('Error fetching event:', err)
        setError(err.message || 'Error al cargar el evento')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params.id, user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      await updateDoc(doc(db, 'events', params.id as string), {
        ...formData,
        updatedAt: Timestamp.now(),
      })
      
      toast.success('Evento actualizado', {
        description: 'Los cambios han sido guardados exitosamente',
      })
      
      router.push(`/events/${params.id}`)
    } catch (err: any) {
      console.error('Error updating event:', err)
      toast.error('Error al guardar', {
        description: err.message || 'No se pudo actualizar el evento',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando evento...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !isCreator) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{error || 'No tienes permiso para editar este evento'}</p>
              <Button onClick={() => router.push(`/events/${params.id}`)}>
                Volver al evento
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => router.push(`/events/${params.id}`)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al evento
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Editar Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Nombre del evento"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Descripción del evento"
                    rows={5}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: Category) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.category && (
                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_DESCRIPTIONS[formData.category]}
                    </p>
                  )}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Hora *
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Dirección *
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    placeholder="Dirección del evento"
                  />
                </div>

                {/* Map */}
                <div className="space-y-2">
                  <Label>Ubicación en el mapa *</Label>
                  <p className="text-xs text-muted-foreground">
                    Haz clic en el mapa para ajustar la ubicación exacta
                  </p>
                  <div className="h-64 rounded-lg overflow-hidden border">
                    <MapView
                      center={[formData.lat, formData.lng]}
                      zoom={15}
                      interactive={true}
                      onMapClick={(latlng) => {
                        setFormData({
                          ...formData,
                          lat: latlng.lat,
                          lng: latlng.lng,
                        })
                      }}
                      selectedLocation={[formData.lat, formData.lng]}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">
                      Lat: {formData.lat.toFixed(6)}, Lng: {formData.lng.toFixed(6)}
                    </Badge>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/events/${params.id}`)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
