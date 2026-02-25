'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Repeat2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RecurrenceConfig {
  isRecurring: boolean
  pattern: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'none'
  endDate?: string
  count?: number
}

interface RecurrenceConfigProps {
  value: RecurrenceConfig
  onChange: (config: RecurrenceConfig) => void
}

const PATTERNS = [
  { value: 'none', label: 'No repetir', icon: '📅' },
  { value: 'daily', label: 'Diario', icon: '📆' },
  { value: 'weekly', label: 'Semanal', icon: '📅' },
  { value: 'biweekly', label: 'Cada 2 semanas', icon: '📆' },
  { value: 'monthly', label: 'Mensual', icon: '🗓️' },
]

export function RecurrenceConfigForm({ value, onChange }: RecurrenceConfigProps) {
  const [showAdvanced, setShowAdvanced] = useState(value.isRecurring && value.pattern !== 'none')

  const handlePatternChange = (pattern: string) => {
    const isRecurring = pattern !== 'none'
    onChange({
      isRecurring,
      pattern: pattern as any,
      endDate: value.endDate,
      count: value.count || 10,
    })
    setShowAdvanced(isRecurring)
  }

  const handleEndDateChange = (endDate: string) => {
    onChange({
      ...value,
      endDate,
    })
  }

  const handleCountChange = (count: number) => {
    onChange({
      ...value,
      count,
    })
  }

  const getPreview = () => {
    if (!value.isRecurring || value.pattern === 'none') return null

    const patternText = PATTERNS.find(p => p.value === value.pattern)?.label
    const countText = value.count ? `(${value.count} veces)` : ''
    
    return `Se repetirá ${patternText?.toLowerCase()} ${countText}`.trim()
  }

  return (
    <Card className={cn('transition-all', value.isRecurring && 'border-primary/50')}>
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Repeat2 className="h-5 w-5 text-primary" />
          <Label className="text-base font-semibold">Repetición del evento</Label>
        </div>

        {/* Selector de patrón */}
        <div className="space-y-2">
          <Label>Frecuencia</Label>
          <Select
            value={value.pattern}
            onValueChange={handlePatternChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar frecuencia" />
            </SelectTrigger>
            <SelectContent>
              {PATTERNS.map((pattern) => (
                <SelectItem key={pattern.value} value={pattern.value}>
                  <span className="flex items-center gap-2">
                    <span>{pattern.icon}</span>
                    {pattern.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Opciones avanzadas */}
        {showAdvanced && value.pattern !== 'none' && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            {/* Fecha de fin */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha de fin de la recurrencia (opcional)
              </Label>
              <Input
                type="date"
                value={value.endDate || ''}
                onChange={(e) => handleEndDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                Dejá vacío si no hay fecha de fin
              </p>
            </div>

            {/* Cantidad de repeticiones */}
            <div className="space-y-2">
              <Label>Cantidad máxima de repeticiones</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={2}
                  max={52}
                  value={value.count || 10}
                  onChange={(e) => handleCountChange(parseInt(e.target.value) || 10)}
                  className="w-24"
                />
                <div className="flex items-center gap-1">
                  {[5, 10, 20, 52].map((count) => (
                    <Badge
                      key={count}
                      variant={value.count === count ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleCountChange(count)}
                    >
                      {count}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Máximo 52 repeticiones (1 año de eventos semanales)
              </p>
            </div>

            {/* Preview */}
            {getPreview() && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  {getPreview()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reset button */}
        {value.isRecurring && (
          <button
            type="button"
            onClick={() => {
              onChange({
                isRecurring: false,
                pattern: 'none',
              })
              setShowAdvanced(false)
            }}
            className="flex items-center gap-1 text-sm text-destructive hover:underline"
          >
            <X className="h-3 w-3" />
            Quitar repetición
          </button>
        )}
      </CardContent>
    </Card>
  )
}

// Helper para calcular fechas de recurrencia
export function calculateRecurringDates(
  startDate: string,
  pattern: string,
  count: number,
  endDate?: string
): string[] {
  const dates: string[] = []
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null
  let current = new Date(start)
  
  for (let i = 0; i < count; i++) {
    if (end && current > end) break
    
    dates.push(current.toISOString().split('T')[0])
    
    switch (pattern) {
      case 'daily':
        current.setDate(current.getDate() + 1)
        break
      case 'weekly':
        current.setDate(current.getDate() + 7)
        break
      case 'biweekly':
        current.setDate(current.getDate() + 14)
        break
      case 'monthly':
        current.setMonth(current.getMonth() + 1)
        break
    }
  }
  
  return dates
}
