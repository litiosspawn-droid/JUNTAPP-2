"use client"

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileImage, AlertCircle } from 'lucide-react'
import { CATEGORIES, CATEGORY_DESCRIPTIONS, type Category } from '@/lib/firebase/events'

interface EventBasicInfoProps {
  title: string
  category: Category | ''
  description: string
  onTitleChange: (title: string) => void
  onCategoryChange: (category: Category) => void
  onDescriptionChange: (description: string) => void
  errors: {
    title?: string
    category?: string
    description?: string
  }
  touched: { [key: string]: boolean }
  onFieldBlur: (field: string) => void
}

export function EventBasicInfo({
  title,
  category,
  description,
  onTitleChange,
  onCategoryChange,
  onDescriptionChange,
  errors,
  touched,
  onFieldBlur,
}: EventBasicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          Información básica del evento
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Event Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Título del evento <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Ej: Concierto de Jazz en Plaza Dorrego"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={() => onFieldBlur('title')}
            className={touched.title && errors.title ? 'border-red-500' : ''}
          />
          {touched.title && errors.title && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                {errors.title}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Event Category */}
        <div className="space-y-2">
          <Label htmlFor="category">
            Categoría <span className="text-red-500">*</span>
          </Label>
          <Select
            value={category}
            onValueChange={(value) => onCategoryChange(value as Category)}
          >
            <SelectTrigger
              id="category"
              className={touched.category && errors.category ? 'border-red-500' : ''}
              onBlur={() => onFieldBlur('category')}
            >
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  <div className="flex flex-col">
                    <span className="font-medium">{cat}</span>
                    {CATEGORY_DESCRIPTIONS[cat] && (
                      <span className="text-xs text-muted-foreground">
                        {CATEGORY_DESCRIPTIONS[cat]}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {touched.category && errors.category && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                {errors.category}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Event Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Descripción <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe tu evento con detalle. ¿Qué actividades incluirá? ¿Qué deben llevar los asistentes? ¿Hay requisitos especiales?"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            onBlur={() => onFieldBlur('description')}
            rows={6}
            className={touched.description && errors.description ? 'border-red-500' : ''}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{description.length}/1000 caracteres</span>
            <span>Mínimo 50 caracteres</span>
          </div>
          {touched.description && errors.description && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                {errors.description}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
