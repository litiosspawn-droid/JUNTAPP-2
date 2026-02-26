import { cva, type VariantProps } from 'class-variance-authority'
import {
  Search,
  Inbox,
  Calendar,
  Users,
  MapPin,
  FileText,
  MessageSquare,
  Bell,
  Star,
  AlertCircle,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ButtonHTMLAttributes } from 'react'

const emptyVariants = cva(
  'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12',
  {
    variants: {
      variant: {
        default: 'border-muted bg-muted/20',
        card: 'border bg-card',
        plain: 'border-0 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface EmptyProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof emptyVariants> {}

function Empty({ className, variant = 'default', ...props }: EmptyProps) {
  return (
    <div
      data-slot="empty"
      data-variant={variant}
      className={cn(emptyVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        'flex max-w-sm flex-col items-center gap-2 text-center',
        className,
      )}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  'flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
        illustration: 'text-muted-foreground size-32',
        large: 'text-muted-foreground size-48',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function EmptyMedia({
  className,
  variant = 'default',
  children,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    >
      {children}
    </div>
  )
}

// Empty illustration presets
const EMPTY_ICONS: Record<string, LucideIcon> = {
  search: Search,
  inbox: Inbox,
  calendar: Calendar,
  users: Users,
  map: MapPin,
  file: FileText,
  message: MessageSquare,
  bell: Bell,
  star: Star,
  alert: AlertCircle,
  success: CheckCircle,
}

interface EmptyIllustrationProps {
  type?: keyof typeof EMPTY_ICONS | 'custom'
  className?: string
  children?: React.ReactNode
}

function EmptyIllustration({
  type = 'inbox',
  className,
  children,
}: EmptyIllustrationProps) {
  if (children) {
    return (
      <EmptyMedia variant="illustration" className={className}>
        {children}
      </EmptyMedia>
    )
  }

  const IconComponent = EMPTY_ICONS[type] || Inbox
  return (
    <EmptyMedia variant="illustration" className={className}>
      <IconComponent className="size-32 opacity-50" strokeWidth={1} />
    </EmptyMedia>
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-title"
      className={cn('text-lg font-medium tracking-tight', className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        'text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        'flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance',
        className,
      )}
      {...props}
    />
  )
}

interface EmptyActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

function EmptyAction({ children, className, ...props }: EmptyActionProps) {
  return (
    <Button className={cn('gap-2', className)} {...props}>
      {children}
    </Button>
  )
}

function EmptyActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-actions"
      className={cn('flex flex-wrap gap-3', className)}
      {...props}
    />
  )
}

// Preset configurations for common empty states
interface EmptyPresetProps {
  preset:
    | 'no-events'
    | 'no-results'
    | 'no-notifications'
    | 'no-messages'
    | 'no-favorites'
    | 'no-location'
    | 'no-data'
    | 'success'
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

function EmptyPreset({
  preset,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyPresetProps) {
  const presets: Record<
    EmptyPresetProps['preset'],
    {
      illustration: keyof typeof EMPTY_ICONS
      defaultTitle: string
      defaultDescription: string
      defaultAction?: string
    }
  > = {
    'no-events': {
      illustration: 'calendar',
      defaultTitle: 'No hay eventos',
      defaultDescription: 'Sé el primero en crear un evento en tu zona.',
      defaultAction: 'Crear evento',
    },
    'no-results': {
      illustration: 'search',
      defaultTitle: 'No se encontraron resultados',
      defaultDescription: 'Prueba con otros términos de búsqueda o quita los filtros.',
      defaultAction: undefined,
    },
    'no-notifications': {
      illustration: 'bell',
      defaultTitle: 'Sin notificaciones',
      defaultDescription: 'Cuando tengas notificaciones, aparecerán aquí.',
      defaultAction: undefined,
    },
    'no-messages': {
      illustration: 'message',
      defaultTitle: 'Sin mensajes',
      defaultDescription: 'Inicia una conversación con otros usuarios.',
      defaultAction: undefined,
    },
    'no-favorites': {
      illustration: 'star',
      defaultTitle: 'Sin favoritos',
      defaultDescription: 'Marca eventos como favoritos para acceder rápido.',
      defaultAction: 'Explorar eventos',
    },
    'no-location': {
      illustration: 'map',
      defaultTitle: 'Ubicación no disponible',
      defaultDescription: 'Activa tu ubicación para ver eventos cercanos.',
      defaultAction: 'Activar ubicación',
    },
    'no-data': {
      illustration: 'inbox',
      defaultTitle: 'Sin datos',
      defaultDescription: 'No hay datos para mostrar en este momento.',
      defaultAction: undefined,
    },
    'success': {
      illustration: 'success',
      defaultTitle: '¡Completado!',
      defaultDescription: 'La operación se realizó con éxito.',
      defaultAction: undefined,
    },
  }

  const config = presets[preset]

  return (
    <Empty variant="plain" className={className}>
      <EmptyHeader>
        <EmptyIllustration type={config.illustration} />
        <EmptyTitle>{title || config.defaultTitle}</EmptyTitle>
        <EmptyDescription>
          {description || config.defaultDescription}
        </EmptyDescription>
      </EmptyHeader>
      {(actionLabel || config.defaultAction) && (
        <EmptyActions>
          <EmptyAction onClick={onAction}>
            {actionLabel || config.defaultAction}
          </EmptyAction>
        </EmptyActions>
      )}
    </Empty>
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  EmptyIllustration,
  EmptyAction,
  EmptyActions,
  EmptyPreset,
  emptyVariants,
  emptyMediaVariants,
  EMPTY_ICONS,
}
export type { EmptyProps }
