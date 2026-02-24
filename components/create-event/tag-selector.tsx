"use client"

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Tag, Plus } from 'lucide-react'
import { POPULAR_TAGS } from '@/lib/firebase/events'

interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  maxTags?: number
}

export function TagSelector({
  selectedTags,
  onTagsChange,
  maxTags = 10
}: TagSelectorProps) {
  const [customTag, setCustomTag] = useState('')

  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (!trimmedTag) return

    if (selectedTags.length >= maxTags) {
      alert(`Máximo ${maxTags} etiquetas permitidas`)
      return
    }

    if (!selectedTags.includes(trimmedTag)) {
      onTagsChange([...selectedTags, trimmedTag])
    }
  }, [selectedTags, onTagsChange, maxTags])

  const removeTag = useCallback((tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove))
  }, [selectedTags, onTagsChange])

  const handleCustomTagSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (customTag.trim()) {
      addTag(customTag.trim())
      setCustomTag('')
    }
  }, [customTag, addTag])

  const handlePopularTagClick = useCallback((tag: string) => {
    addTag(tag)
  }, [addTag])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Etiquetas del evento
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Selected tags */}
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <Label>Etiquetas seleccionadas ({selectedTags.length}/{maxTags})</Label>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="default" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    aria-label={`Eliminar etiqueta ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Custom tag input */}
        <div className="space-y-2">
          <Label htmlFor="custom-tag">Añadir etiqueta personalizada</Label>
          <form onSubmit={handleCustomTagSubmit} className="flex gap-2">
            <Input
              id="custom-tag"
              placeholder="Ej: rock, gratis, al aire libre..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              disabled={selectedTags.length >= maxTags}
              maxLength={20}
            />
            <Button
              type="submit"
              variant="outline"
              disabled={!customTag.trim() || selectedTags.length >= maxTags}
              className="flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Añadir</span>
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            Máximo 20 caracteres por etiqueta
          </p>
        </div>

        {/* Popular tags */}
        <div className="space-y-2">
          <Label>Etiquetas populares</Label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.filter(tag => !selectedTags.includes(tag.toLowerCase())).map((tag) => (
              <Button
                key={tag}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePopularTagClick(tag)}
                disabled={selectedTags.length >= maxTags}
                className="h-8"
              >
                {tag}
              </Button>
            ))}
          </div>
          {selectedTags.length >= maxTags && (
            <p className="text-xs text-muted-foreground text-orange-600">
              Has alcanzado el límite máximo de etiquetas
            </p>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Las etiquetas ayudan a que tu evento sea más fácil de encontrar</p>
          <p>• Usa palabras clave relevantes (ej: música, gratis, al aire libre)</p>
          <p>• Máximo {maxTags} etiquetas por evento</p>
        </div>
      </CardContent>
    </Card>
  )
}
