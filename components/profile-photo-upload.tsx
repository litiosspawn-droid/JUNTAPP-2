"use client"

import { useState, useRef } from 'react'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/lib/firebase/client'

interface ProfilePhotoUploadProps {
  currentPhotoURL?: string | null
  displayName?: string
  onPhotoUpdate: (photoURL: string | null) => void
  userId: string
}

export function ProfilePhotoUpload({
  currentPhotoURL,
  displayName,
  onPhotoUpdate,
  userId
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Solo se permiten archivos de imagen'
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return 'La imagen no puede superar los 5MB'
    }

    return null
  }

  const uploadPhoto = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      // Delete existing photo if it exists
      if (currentPhotoURL && currentPhotoURL.includes('firebasestorage')) {
        try {
          const oldPhotoRef = ref(storage, currentPhotoURL)
          await deleteObject(oldPhotoRef)
        } catch (deleteError) {
          console.warn('Error deleting old photo:', deleteError)
          // Continue with upload even if delete fails
        }
      }

      // Upload new photo
      const fileName = `profile-photos/${userId}/${Date.now()}-${file.name}`
      const storageRef = ref(storage, fileName)

      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      onPhotoUpdate(downloadURL)
    } catch (error) {
      console.error('Error uploading photo:', error)
      setError('Error al subir la foto. Inténtalo de nuevo.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    await uploadPhoto(file)
  }

  const handleRemovePhoto = async () => {
    if (!currentPhotoURL) return

    setIsUploading(true)
    setError(null)

    try {
      // Delete photo from storage
      if (currentPhotoURL.includes('firebasestorage')) {
        const photoRef = ref(storage, currentPhotoURL)
        await deleteObject(photoRef)
      }

      onPhotoUpdate(null)
    } catch (error) {
      console.error('Error removing photo:', error)
      setError('Error al eliminar la foto. Inténtalo de nuevo.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={currentPhotoURL || undefined} />
            <AvatarFallback className="text-lg">
              {displayName?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={isUploading}
            className="gap-2"
          >
            <Camera className="h-4 w-4" />
            Cambiar foto
          </Button>

          {currentPhotoURL && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemovePhoto}
              disabled={isUploading}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <Alert className="border-destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground">
        <p>Formatos permitidos: JPG, PNG, GIF</p>
        <p>Tamaño máximo: 5MB</p>
      </div>
    </div>
  )
}
