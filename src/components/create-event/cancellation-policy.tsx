'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { AlertCircle, Calendar, Clock, Shield } from 'lucide-react'

export type CancellationPolicy = 'flexible' | 'moderate' | 'strict' | 'custom'

interface CancellationPolicyFormProps {
  value: {
    policy: CancellationPolicy
    deadline?: string
  }
  onChange: (value: { policy: CancellationPolicy; deadline?: string }) => void
}

const POLICIES = [
  {
    value: 'flexible',
    label: 'Flexible',
    icon: '😊',
    description: 'Cancelación hasta 2 horas antes del evento',
    color: 'text-green-600',
  },
  {
    value: 'moderate',
    label: 'Moderada',
    icon: '😐',
    description: 'Cancelación hasta 24 horas antes del evento (recomendado)',
    color: 'text-yellow-600',
  },
  {
    value: 'strict',
    label: 'Estricta',
    icon: '😠',
    description: 'Cancelación hasta 7 días antes del evento',
    color: 'text-red-600',
  },
  {
    value: 'custom',
    label: 'Personalizada',
    icon: '⚙️',
    description: 'Establecé tu propia fecha límite',
    color: 'text-blue-600',
  },
]

export function CancellationPolicyForm({ value, onChange }: CancellationPolicyFormProps) {
  const [showCustomDeadline, setShowCustomDeadline] = useState(value.policy === 'custom')

  const handlePolicyChange = (policy: string) => {
    const isCustom = policy === 'custom'
    setShowCustomDeadline(isCustom)
    onChange({
      policy: policy as CancellationPolicy,
      deadline: isCustom ? value.deadline : undefined,
    })
  }

  const handleDeadlineChange = (deadline: string) => {
    onChange({
      policy: value.policy,
      deadline,
    })
  }

  const selectedPolicy = POLICIES.find(p => p.value === value.policy)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Política de Cancelación</CardTitle>
        </div>
        <CardDescription>
          Establecé las condiciones para que los asistentes puedan cancelar su registro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selector de política */}
        <div className="space-y-2">
          <Label>Tipo de política</Label>
          <Select
            value={value.policy}
            onValueChange={handlePolicyChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar política" />
            </SelectTrigger>
            <SelectContent>
              {POLICIES.map((policy) => (
                <SelectItem key={policy.value} value={policy.value}>
                  <span className="flex items-center gap-2">
                    <span>{policy.icon}</span>
                    {policy.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Descripción de la política seleccionada */}
        {selectedPolicy && (
          <Alert className={selectedPolicy.color}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {selectedPolicy.description}
            </AlertDescription>
          </Alert>
        )}

        {/* Fecha límite personalizada */}
        {showCustomDeadline && (
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha y hora límite para cancelaciones
            </Label>
            <Input
              type="datetime-local"
              value={value.deadline || ''}
              onChange={(e) => handleDeadlineChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Los asistentes podrán cancelar hasta esta fecha y hora exacta
            </p>
          </div>
        )}

        {/* Información adicional */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Importante:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Los asistentes siempre pueden cancelar si la política lo permite</li>
                <li>El organizador puede cancelar el evento en cualquier momento</li>
                <li>Las notificaciones de cancelación se envían automáticamente</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper para obtener texto de la política
export function getCancellationPolicyText(
  policy: CancellationPolicy,
  deadline?: string
): string {
  const policyText = POLICIES.find(p => p.value === policy)
  
  if (policy === 'custom' && deadline) {
    const date = new Date(deadline)
    return `Cancelación hasta el ${date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })}`
  }
  
  return policyText?.description || 'Política no especificada'
}
