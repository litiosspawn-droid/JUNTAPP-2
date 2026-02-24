"use client"

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X, FileImage, AlertCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploaderProps {
  flyerUrl: string | null
  onImageUpload: (file: File) => Promise<string>
  onImageRemove: () => void
  errors: {
    flyer?: string
  }
  touched: { [key: string]: boolean }
  onFieldBlur: (field: string) => void
  maxSizeMB?: number
  acceptedTypes?: string[]
}

export function ImageUploader({
  flyerUrl,
  onImageUpload,
  onImageRemove,
  errors,
  touched,
  onFieldBlur,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setUploadError(`Tipo de archivo no válido. Aceptamos: ${acceptedTypes.join(', ')}`)
      return
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setUploadError(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB`)
      return
    }

    setUploadError(null)
    setIsUploading(true)

    try {
      const uploadedUrl = await onImageUpload(file)
      // The parent component will handle setting the flyerUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      setUploadError('Error al subir la imagen. Inténtalo de nuevo.')
    } finally {
      setIsUploading(false)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onImageUpload, acceptedTypes, maxSizeMB])

  const handleRemoveImage = useCallback(() => {
    onImageRemove()
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onImageRemove])

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          Imagen del evento
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Seleccionar imagen del evento"
        />

        {/* Upload area */}
        {flyerUrl ? (
          <div className="space-y-4">
            {/* Image preview */}
            <div className="relative aspect-[16/10] rounded-lg overflow-hidden border">
              <Image
                src={flyerUrl}
                alt="Vista previa del flyer del evento"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
                aria-label="Eliminar imagen"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Success message */}
            <Alert className="border-green-200 bg-green-50">
              <FileImage className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Imagen subida correctamente
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Upload placeholder */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer hover:bg-muted/50 ${
                isUploading ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onClick={handleBrowseClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleBrowseClick()
                }
              }}
              aria-label="Haz clic para seleccionar una imagen del evento"
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Haz clic para subir una imagen</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WebP hasta {maxSizeMB}MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Alternative upload button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleBrowseClick}
              disabled={isUploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Seleccionar archivo
            </Button>
          </div>
        )}

        {/* Upload error */}
        {uploadError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              {uploadError}
            </AlertDescription>
          </Alert>
        )}

        {/* Form validation error */}
        {touched.flyer && errors.flyer && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              {errors.flyer}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Usa una imagen horizontal de alta calidad</p>
          <p>• Formatos aceptados: JPEG, PNG, WebP</p>
          <p>• Tamaño máximo: {maxSizeMB}MB</p>
          <p>• Resolución recomendada: 1920x1080px o similar</p>
        </div>
      </CardContent>
    </Card>
  )
}
