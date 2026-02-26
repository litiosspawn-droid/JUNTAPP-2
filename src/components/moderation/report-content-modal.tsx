'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertTriangle, Flag, Shield } from 'lucide-react'
import { useUnifiedToast } from '@/hooks/use-unified-toast'
import type { ContentType, ModerationReason } from '@/types'

interface ReportContentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetType: ContentType
  targetId: string
  targetUserId?: string
  onSuccess?: () => void
}

const REASONS: { value: ModerationReason; label: string }[] = [
  { value: 'spam', label: '📢 Spam o publicidad' },
  { value: 'profanity', label: '🤬 Lenguaje inapropiado' },
  { value: 'hate_speech', label: '😠 Discurso de odio' },
  { value: 'harassment', label: '😔 Acoso o bullying' },
  { value: 'explicit_content', label: '🔞 Contenido explícito' },
  { value: 'violence', label: '💀 Violencia o daño' },
  { value: 'misinformation', label: '❌ Información falsa' },
  { value: 'scam', label: '🎣 Estafa o fraude' },
  { value: 'other', label: '⚠️ Otro' },
]

/**
 * Modal para reportar contenido inapropiado
 */
export function ReportContentModal({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetUserId,
  onSuccess,
}: ReportContentModalProps) {
  const toast = useUnifiedToast()
  const [reason, setReason] = useState<ModerationReason>('spam')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Seleccioná una razón')
      return
    }

    setSubmitting(true)

    try {
      // TODO: Implementar con llamada a Firestore
      // await addDoc(collection(db, 'reports'), {
      //   targetType,
      //   targetId,
      //   targetUserId,
      //   reason,
      //   description,
      //   status: 'pending',
      //   createdAt: serverTimestamp(),
      // })

      toast.success('Reporte enviado', {
        description: 'Gracias por ayudarnos a mantener la comunidad segura',
      })

      // Reset y callback
      setReason('spam')
      setDescription('')
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast.error('Error al reportar', {
        description: 'Intentalo de nuevo más tarde',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Flag className="h-5 w-5 text-destructive" />
            <DialogTitle>Reportar Contenido</DialogTitle>
          </div>
          <DialogDescription>
            Ayudanos a mantener la comunidad segura. Tu reporte es anónimo y será
            revisado por nuestro equipo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Razón del reporte */}
          <div className="space-y-2">
            <Label htmlFor="reason">Razón del reporte</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as ModerationReason)}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Seleccioná una razón" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descripción opcional */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Contanos más detalles sobre el problema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Información de privacidad */}
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Tu identidad será mantenida en privado. Solo el equipo de moderación
              tendrá acceso a esta información.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            {submitting ? 'Enviando...' : 'Enviar Reporte'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Componente para mostrar badge de contenido moderado
 */
interface ModerationBadgeProps {
  severity: 'safe' | 'questionable' | 'inappropriate' | 'dangerous'
  className?: string
}

export function ModerationBadge({ severity, className = '' }: ModerationBadgeProps) {
  const badges = {
    safe: { label: 'Verificado', className: 'bg-green-100 text-green-700' },
    questionable: { label: 'Bajo Revisión', className: 'bg-yellow-100 text-yellow-700' },
    inappropriate: { label: 'Inapropiado', className: 'bg-orange-100 text-orange-700' },
    dangerous: { label: 'Peligroso', className: 'bg-red-100 text-red-700' },
  }

  const badge = badges[severity]

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className} ${className}`}>
      {badge.label}
    </span>
  )
}

/**
 * Componente para acciones de moderación (admin)
 */
interface ModerationActionsProps {
  reportId: string
  onApprove: () => void
  onReject: () => void
}

export function ModerationActions({ reportId, onApprove, onReject }: ModerationActionsProps) {
  const toast = useUnifiedToast()

  const handleApprove = async () => {
    try {
      // TODO: Implementar con Firestore
      toast.success('Reporte aprobado')
      onApprove()
    } catch (error) {
      toast.error('Error al aprobar reporte')
    }
  }

  const handleReject = async () => {
    try {
      // TODO: Implementar con Firestore
      toast.success('Reporte rechazado')
      onReject()
    } catch (error) {
      toast.error('Error al rechazar reporte')
    }
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="destructive" onClick={handleApprove}>
        Aprobar
      </Button>
      <Button size="sm" variant="outline" onClick={handleReject}>
        Rechazar
      </Button>
    </div>
  )
}
