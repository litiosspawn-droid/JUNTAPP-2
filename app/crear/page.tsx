'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Header, Footer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { X, Upload, MapPin, Calendar, Clock, FileImage, AlertCircle, CheckCircle, Tag, Plus as PlusIcon, Search, Loader2 } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { createEvent, CATEGORIES, SUBCATEGORIES, POPULAR_TAGS, CATEGORY_DESCRIPTIONS, type Category } from '@/lib/firebase/events'
import { useToast } from '@/hooks/use-toast'
import dynamic from "next/dynamic"

const MapView = dynamic(() => import("@/components/map-view").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-lg bg-muted flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2" />
        <p>Cargando mapa...</p>
      </div>
    </div>
  ),
})

interface FormErrors {
  title?: string
  category?: string
  date?: string
  time?: string
  address?: string
  lat?: string
  lng?: string
  description?: string
  flyer?: string
}

interface ValidationState {
  isValid: boolean
  errors: FormErrors
  touched: { [key: string]: boolean }
}

export default function CreateEventPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [eventCreated, setEventCreated] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    category: '' as Category,
    subcategory: '',
    tags: [] as string[],
    date: '',
    time: '',
    address: '',
    description: '',
    lat: -34.6037, // Default: Buenos Aires
    lng: -58.3816,
  })
  const [flyerFile, setFlyerFile] = useState<File | null>(null)

  const [validation, setValidation] = useState<ValidationState>({
    isValid: false,
    errors: {},
    touched: {}
  })

  // Redirigir cuando el evento se crea exitosamente
  useEffect(() => {
    if (eventCreated) {
      router.push('/')
    }
  }, [eventCreated, router])

  // Redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!user && !loading) {
      // Mostrar mensaje y redirigir a login
      alert('Debes iniciar sesión para crear un evento')
      router.push('/login')
    }
  }, [user, loading, router])

  // Validación en tiempo real
  useEffect(() => {
    const errors: FormErrors = {}
    let isValid = true

    if (formData.title.length < 3) {
      errors.title = 'El título debe tener al menos 3 caracteres'
      isValid = false
    }

    if (!formData.category) {
      errors.category = 'Debes seleccionar una categoría'
      isValid = false
    }

    if (!formData.date) {
      errors.date = 'La fecha es obligatoria'
      isValid = false
    } else {
      const eventDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (eventDate < today) {
        errors.date = 'La fecha no puede ser anterior a hoy'
        isValid = false
      }
    }

    if (!formData.time) {
      errors.time = 'La hora es obligatoria'
      isValid = false
    }

    if (formData.address.length < 5) {
      errors.address = 'La dirección debe tener al menos 5 caracteres'
      isValid = false
    }

    if (!formData.lat || !formData.lng || isNaN(formData.lat) || isNaN(formData.lng)) {
      errors.lat = 'Debes seleccionar una ubicación en el mapa'
      isValid = false
    }

    if (formData.description.length < 10) {
      errors.description = 'La descripción debe tener al menos 10 caracteres'
      isValid = false
    }

    if (flyerFile) {
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (flyerFile.size > maxSize) {
        errors.flyer = 'El archivo no puede superar los 5MB'
        isValid = false
      }
      if (!flyerFile.type.startsWith('image/')) {
        errors.flyer = 'Solo se permiten archivos de imagen'
        isValid = false
      }
    }

    setValidation(prev => ({
      ...prev,
      isValid,
      errors
    }))
  }, [formData, flyerFile])

  // Preview del flyer
  useEffect(() => {
    if (flyerFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFlyerPreview(e.target?.result as string)
      }
      reader.readAsDataURL(flyerFile)
    } else {
      setFlyerPreview(null)
    }
  }, [flyerFile])

  // Función de geocoding
  const handleGeocodeAddress = useCallback(async (address: string) => {
    if (!address.trim()) return null

    setIsGeocoding(true)
    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al geocodificar la dirección')
      }

      const data = await response.json()
      
      if (data.lat && data.lon) {
        setFormData(prev => ({
          ...prev,
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lon),
          address: data.display_name || address,
        }))
        
        toast({
          title: 'Ubicación encontrada',
          description: `Coordenadas: ${data.lat}, ${data.lon}`,
        })
        
        return { lat: parseFloat(data.lat), lng: parseFloat(data.lon) }
      }
      
      return null
    } catch (error) {
      console.error('Error geocoding address:', error)
      toast({
        title: 'Error de geocoding',
        description: error instanceof Error ? error.message : 'No se pudo geocodificar la dirección',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsGeocoding(false)
    }
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Marcar todos los campos como touched para mostrar errores
    setValidation(prev => ({
      ...prev,
      touched: {
        title: true,
        category: true,
        date: true,
        time: true,
        address: true,
        description: true,
        flyer: true
      }
    }))

    if (!validation.isValid) {
      return
    }

    setLoading(true)
    setProgress(0)

    try {
      setCurrentStep('Preparando datos...')
      setProgress(10)

      const eventData = {
        ...formData,
        attendees: 0,
        flyerUrl: flyerFile ? '' : '/images/placeholder-event.jpg',
        // Calcular expiración del chat (2 días después del evento)
        chatExpiration: new Date(new Date(formData.date + 'T' + formData.time).getTime() + 2 * 24 * 60 * 60 * 1000)
      }

      setCurrentStep('Subiendo imagen...')
      setProgress(30)

      // Añadir timeout para evitar que se quede atascado
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Tiempo de espera agotado')), 30000)
      })

      setCurrentStep('Guardando evento...')
      setProgress(60)

      const result = await Promise.race([
        createEvent(eventData, flyerFile || undefined, user?.uid),
        timeoutPromise
      ]) as Promise<string>

      setCurrentStep('Finalizando...')
      setProgress(100)

      console.log('Evento creado con ID:', result)
      setEventCreated(true)
    } catch (error) {
      console.error('Error creating event:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el evento. Inténtalo de nuevo.'
      alert(errorMessage)
    } finally {
      setLoading(false)
      setProgress(0)
      setCurrentStep('')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setValidation(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: true }
    }))
  }

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFlyerFile(file)
    setValidation(prev => ({
      ...prev,
      touched: { ...prev.touched, flyer: true }
    }))
  }

  const removeFlyer = () => {
    setFlyerFile(null)
    setFlyerPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFieldError = (field: string) => {
    return validation.touched[field] ? validation.errors[field as keyof FormErrors] : undefined
  }

  const getCompletionPercentage = () => {
    let completed = 0
    const total = 6

    if (formData.title.length >= 3) completed++
    if (formData.category) completed++
    if (formData.subcategory) completed++
    if (formData.date) completed++
    if (formData.time) completed++
    if (formData.address.length >= 5) completed++
    if (formData.description.length >= 10) completed++

    return Math.round((completed / total) * 100)
  }

  // Si no hay usuario autenticado, mostrar mensaje de acceso denegado
  if (!user && !loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Acceso Requerido</h2>
                <p className="text-muted-foreground mb-6">
                  Debes iniciar sesión para crear un evento en JuntApp
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Volver al Inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Crear Nuevo Evento
          </h1>
          <p className="text-muted-foreground">
            Comparte tu evento con la comunidad local
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progreso del formulario</span>
            <span className="text-sm text-muted-foreground">{getCompletionPercentage()}%</span>
          </div>
          <Progress value={getCompletionPercentage()} className="h-2" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulario */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Detalles del Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Título */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2">
                      Título del Evento *
                      {getFieldError('title') && <AlertCircle className="h-4 w-4 text-destructive" />}
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Ej: Festival Electrónica Urbana"
                      className={getFieldError('title') ? 'border-destructive' : ''}
                    />
                    {getFieldError('title') && (
                      <p className="text-sm text-destructive">{getFieldError('title')}</p>
                    )}
                  </div>

                  {/* Categoría */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="flex items-center gap-2">
                      Categoría *
                      {getFieldError('category') && <AlertCircle className="h-4 w-4 text-destructive" />}
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value as Category)}
                    >
                      <SelectTrigger className={getFieldError('category') ? 'border-destructive' : ''}>
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
                    {getFieldError('category') && (
                      <p className="text-sm text-destructive">{getFieldError('category')}</p>
                    )}
                    {formData.category && (
                      <p className="text-xs text-muted-foreground">
                        {CATEGORY_DESCRIPTIONS[formData.category]}
                      </p>
                    )}
                  </div>

                  {/* Subcategoría */}
                  {formData.category && SUBCATEGORIES[formData.category] && (
                    <div className="space-y-2">
                      <Label htmlFor="subcategory" className="flex items-center gap-2">
                        Subcategoría
                        <span className="text-xs text-muted-foreground">(opcional)</span>
                      </Label>
                      <Select
                        value={formData.subcategory}
                        onValueChange={(value) => handleInputChange('subcategory', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una subcategoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Ninguna</SelectItem>
                          {SUBCATEGORIES[formData.category].map((subcategory) => (
                            <SelectItem key={subcategory} value={subcategory}>
                              {subcategory}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                      <span className="text-xs text-muted-foreground">(máximo 5)</span>
                    </Label>

                    {/* Tags seleccionados */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-destructive"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Tags populares */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Tags populares:</p>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_TAGS.filter(tag => !formData.tags.includes(tag)).slice(0, 10).map((tag) => (
                          <Button
                            key={tag}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => addTag(tag)}
                            disabled={formData.tags.length >= 5}
                          >
                            <PlusIcon className="h-3 w-3 mr-1" />
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Fecha y Hora */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="flex items-center gap-2">
                        Fecha *
                        {getFieldError('date') && <AlertCircle className="h-4 w-4 text-destructive" />}
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className={getFieldError('date') ? 'border-destructive' : ''}
                      />
                      {getFieldError('date') && (
                        <p className="text-sm text-destructive">{getFieldError('date')}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time" className="flex items-center gap-2">
                        Hora *
                        {getFieldError('time') && <AlertCircle className="h-4 w-4 text-destructive" />}
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        className={getFieldError('time') ? 'border-destructive' : ''}
                      />
                      {getFieldError('time') && (
                        <p className="text-sm text-destructive">{getFieldError('time')}</p>
                      )}
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Dirección *
                      {getFieldError('address') && <AlertCircle className="h-4 w-4 text-destructive" />}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        onBlur={() => handleFieldBlur('address')}
                        placeholder="Ej: Av. Corrientes 3456, Buenos Aires"
                        className={getFieldError('address') ? 'border-destructive' : ''}
                        disabled={isGeocoding}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleGeocodeAddress(formData.address)}
                        disabled={!formData.address.trim() || isGeocoding}
                        className="flex-shrink-0"
                      >
                        {isGeocoding ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline ml-2">Buscar</span>
                      </Button>
                    </div>
                    {getFieldError('address') && (
                      <p className="text-sm text-destructive">{getFieldError('address')}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Haz clic en "Buscar" para obtener las coordenadas automáticamente
                    </p>
                  </div>

                  {/* Mapa para selección de ubicación */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Ubicación en el Mapa *
                      {getFieldError('lat') && <AlertCircle className="h-4 w-4 text-destructive" />}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Haz clic en el mapa para seleccionar la ubicación exacta del evento
                    </p>
                    <div className="relative h-64 rounded-lg overflow-hidden border">
                      <MapView
                        center={formData.lat && formData.lng ? [formData.lat, formData.lng] : [-34.6037, -58.3816]}
                        zoom={15}
                        className="h-full w-full"
                        onMapClick={(latlng) => {
                          handleInputChange('lat', latlng.lat)
                          handleInputChange('lng', latlng.lng)
                        }}
                        selectedLocation={formData.lat && formData.lng ? [formData.lat, formData.lng] : undefined}
                        showUserLocation={false}
                      />
                    </div>
                    {formData.lat && formData.lng && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        Coordenadas: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                      </div>
                    )}
                    {(getFieldError('lat') || getFieldError('lng')) && (
                      <p className="text-sm text-destructive">
                        {getFieldError('lat') || getFieldError('lng')}
                      </p>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2">
                      Descripción *
                      {getFieldError('description') && <AlertCircle className="h-4 w-4 text-destructive" />}
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe tu evento, incluye información importante para los asistentes..."
                      rows={4}
                      className={getFieldError('description') ? 'border-destructive' : ''}
                    />
                    {getFieldError('description') && (
                      <p className="text-sm text-destructive">{getFieldError('description')}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formData.description.length}/500 caracteres
                    </p>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !validation.isValid}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Crear Evento
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview y Flyer */}
          <div className="space-y-6">
            {/* Flyer Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  Flyer del Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!flyerPreview ? (
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Subir flyer</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      PNG, JPG o GIF hasta 5MB
                    </p>
                    <Button type="button" variant="outline">
                      Elegir archivo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={flyerPreview}
                        alt="Preview del flyer"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeFlyer}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileImage className="h-4 w-4" />
                      {flyerFile?.name} ({(flyerFile?.size || 0) / 1024 / 1024}MB)
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {getFieldError('flyer') && (
                  <Alert className="border-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{getFieldError('flyer')}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Progress Indicator */}
            {loading && (
              <Card>
                <CardHeader>
                  <CardTitle>Creando evento...</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{currentStep}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                    Por favor espera...
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview del evento */}
            {formData.title && (
              <Card>
                <CardHeader>
                  <CardTitle>Vista previa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 space-y-3">
                    {flyerPreview ? (
                      <img
                        src={flyerPreview}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-24 bg-muted rounded flex items-center justify-center">
                        <FileImage className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold">{formData.title || 'Título del evento'}</h3>
                      {formData.category && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge>{formData.category}</Badge>
                          {formData.subcategory && (
                            <Badge variant="outline">{formData.subcategory}</Badge>
                          )}
                        </div>
                      )}
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {formData.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {formData.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{formData.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {(formData.date || formData.time) && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formData.date ? new Date(formData.date).toLocaleDateString('es-AR') : 'Fecha'}
                          {formData.time && ` a las ${formData.time}hs`}
                        </span>
                      </div>
                    )}

                    {formData.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{formData.address}</span>
                      </div>
                    )}

                    {formData.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {formData.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
