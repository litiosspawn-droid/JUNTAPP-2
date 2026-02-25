'use client'

import { toast as sonnerToast, type ExternalToast } from 'sonner'
import { useToast as useRadixToast } from '@/hooks/use-toast'
import type { ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default'

export interface ToastOptions {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
}

// Función para obtener el ícono según el tipo (retorna string para sonner)
function getToastIconClass(type: ToastType): string {
  switch (type) {
    case 'success':
      return '✅'
    case 'error':
      return '❌'
    case 'info':
      return 'ℹ️'
    case 'warning':
      return '⚠️'
    default:
      return '🔔'
  }
}

/**
 * Hook unificado para notificaciones toast
 * Combina Sonner (recomendado) con el sistema radix-ui existente
 */
export function useUnifiedToast() {
  const { toast: radixToast } = useRadixToast()

  const show = (type: ToastType, options: ToastOptions) => {
    const { title, description, duration = 4000, action, onDismiss } = options

    const toastConfig: ExternalToast = {
      description,
      duration,
      onDismiss,
    }

    // Acción personalizada
    if (action) {
      toastConfig.action = {
        label: action.label,
        onClick: action.onClick,
      }
    }

    // Icono emoji para Sonner
    const icon = getToastIconClass(type)

    // Usar Sonner (recomendado)
    switch (type) {
      case 'success':
        return sonnerToast.success(title || '¡Éxito!', {
          ...toastConfig,
          icon,
        })
      case 'error':
        return sonnerToast.error(title || 'Error', {
          ...toastConfig,
          icon,
        })
      case 'info':
        return sonnerToast(title || 'Información', {
          ...toastConfig,
          icon,
        })
      case 'warning':
        return sonnerToast.warning(title || 'Advertencia', {
          ...toastConfig,
          icon,
        })
      default:
        return sonnerToast(title, toastConfig)
    }
  }

  // Métodos específicos para cada tipo
  const success = (title: string, options?: Omit<ToastOptions, 'title'>) =>
    show('success', { title, ...options })

  const error = (title: string, options?: Omit<ToastOptions, 'title'>) =>
    show('error', { title, ...options })

  const info = (title: string, options?: Omit<ToastOptions, 'title'>) =>
    show('info', { title, ...options })

  const warning = (title: string, options?: Omit<ToastOptions, 'title'>) =>
    show('warning', { title, ...options })

  const dismiss = (toastId: string | number) => {
    sonnerToast.dismiss(toastId)
  }

  // Método para notificaciones persistentes
  const persistent = (title: string, options?: Omit<ToastOptions, 'title'>) =>
    sonnerToast(title, {
      ...options,
      duration: Infinity,
      dismissible: true,
    })

  // Fallback a radix-toast
  const showRadix = (options: { title?: string; description?: string }) => {
    radixToast({
      title: options.title,
      description: options.description,
    })
  }

  return {
    toast: show,
    success,
    error,
    info,
    warning,
    persistent,
    dismiss,
    showRadix,
  }
}

// Funciones helper para casos comunes
export const createEventToast = {
  success: (eventName: string, toast: ReturnType<typeof useUnifiedToast>) =>
    toast.success('¡Evento creado!', {
      description: `"${eventName}" ha sido publicado exitosamente`,
    }),

  error: (toast: ReturnType<typeof useUnifiedToast>) =>
    toast.error('Error al crear evento', {
      description: 'Inténtalo de nuevo más tarde',
    }),
}

export const updateEventToast = {
  success: (eventName: string, toast: ReturnType<typeof useUnifiedToast>) =>
    toast.success('Evento actualizado', {
      description: `"${eventName}" ha sido modificado`,
    }),

  error: (toast: ReturnType<typeof useUnifiedToast>) =>
    toast.error('Error al actualizar', {
      description: 'No se pudieron guardar los cambios',
    }),
}

export const deleteEventToast = {
  success: (toast: ReturnType<typeof useUnifiedToast>) =>
    toast.success('Evento eliminado', {
      description: 'El evento ha sido eliminado correctamente',
    }),

  error: (toast: ReturnType<typeof useUnifiedToast>) =>
    toast.error('Error al eliminar', {
      description: 'No se pudo eliminar el evento',
    }),
}

export const authToast = {
  loginSuccess: (userName: string, toast: ReturnType<typeof useUnifiedToast>) =>
    toast.success('¡Bienvenido!', {
      description: `Hola ${userName}`,
    }),

  loginError: (toast: ReturnType<typeof useUnifiedToast>) =>
    toast.error('Error de autenticación', {
      description: 'Credenciales inválidas',
    }),

  logout: (toast: ReturnType<typeof useUnifiedToast>) =>
    toast.info('Sesión cerrada', {
      description: 'Hasta pronto',
    }),

  registerSuccess: (toast: ReturnType<typeof useUnifiedToast>) =>
    toast.success('¡Cuenta creada!', {
      description: 'Ya puedes iniciar sesión',
    }),
}

export const notificationToast = {
  settingsSaved: (toast: ReturnType<typeof useUnifiedToast>) =>
    toast.success('Configuración guardada', {
      description: 'Tus preferencias han sido actualizadas',
    }),

  settingsError: (toast: ReturnType<typeof useUnifiedToast>) =>
    toast.error('Error al guardar', {
      description: 'No se pudo actualizar la configuración',
    }),
}
