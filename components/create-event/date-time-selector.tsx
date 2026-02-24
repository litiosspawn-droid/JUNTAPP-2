"use client"

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Clock, AlertCircle } from 'lucide-react'

interface DateTimeSelectorProps {
  date: string
  time: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  errors: {
    date?: string
    time?: string
  }
  touched: { [key: string]: boolean }
  onFieldBlur: (field: string) => void
}

export function DateTimeSelector({
  date,
  time,
  onDateChange,
  onTimeChange,
  errors,
  touched,
  onFieldBlur,
}: DateTimeSelectorProps) {
  const today = new Date().toISOString().split('T')[0]
  const minTime = '00:00'
  const maxTime = '23:59'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Fecha y hora
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">
              Fecha del evento <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              min={today}
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              onBlur={() => onFieldBlur('date')}
              className={touched.date && errors.date ? 'border-red-500' : ''}
            />
            {touched.date && errors.date && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">
                  {errors.date}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">
              Hora de inicio <span className="text-red-500">*</span>
            </Label>
            <Input
              id="time"
              type="time"
              min={minTime}
              max={maxTime}
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              onBlur={() => onFieldBlur('time')}
              className={touched.time && errors.time ? 'border-red-500' : ''}
            />
            {touched.time && errors.time && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">
                  {errors.time}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Event Preview */}
        {date && time && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {new Date(date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <Clock className="h-4 w-4 text-muted-foreground ml-4" />
              <span className="font-medium">{time} hs</span>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Los eventos deben programarse con al menos 24 horas de anticipación</p>
          <p>• La hora debe estar en formato 24 horas</p>
          <p>• Considera el tiempo necesario para que los asistentes lleguen</p>
        </div>
      </CardContent>
    </Card>
  )
}
