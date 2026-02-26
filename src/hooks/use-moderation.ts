/**
 * Hook para moderación de contenido en tiempo real
 */

import { useState, useCallback } from 'react'
import { moderateContent, cleanContent, isContentSafe } from '@/lib/moderation'
import { useUnifiedToast } from '@/hooks/use-unified-toast'
import type { ModerationResult, ModerationConfig } from '@/types'

interface UseModerationOptions {
  autoClean?: boolean
  showWarnings?: boolean
  config?: Partial<ModerationConfig>
}

interface UseModerationReturn {
  checkContent: (text: string) => ModerationResult
  validateContent: (text: string) => boolean
  cleanContent: (text: string) => string
  isSafe: (text: string) => boolean
  lastResult: ModerationResult | null
  warningMessage: string | null
}

/**
 * Hook para moderación de contenido
 */
export function useModeration(options: UseModerationOptions = {}): UseModerationReturn {
  const {
    autoClean = false,
    showWarnings = true,
    config = {},
  } = options

  const toast = useUnifiedToast()
  const [lastResult, setLastResult] = useState<ModerationResult | null>(null)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)

  // Verificar contenido
  const checkContent = useCallback(
    (text: string): ModerationResult => {
      const result = moderateContent(text, config)
      setLastResult(result)

      // Mostrar advertencia si es necesario
      if (showWarnings && !result.isSafe && result.suggestions.length > 0) {
        const message = result.suggestions.join('\n')
        setWarningMessage(message)

        if (result.autoAction === 'block') {
          toast.error('Contenido inapropiado', {
            description: 'El contenido viola nuestras normas de comunidad',
          })
        } else if (result.autoAction === 'review') {
          toast.warning('Contenido bajo revisión', {
            description: 'Tu publicación será revisada antes de mostrarse',
          })
        }
      }

      return result
    },
    [config, showWarnings, toast]
  )

  // Validar contenido (retorna true si es seguro)
  const validateContent = useCallback(
    (text: string): boolean => {
      const result = checkContent(text)
      return result.isSafe
    },
    [checkContent]
  )

  // Limpiar contenido
  const cleanContentText = useCallback(
    (text: string): string => {
      if (autoClean) {
        return cleanContent(text, config)
      }
      return text
    },
    [autoClean, config]
  )

  // Verificar si es seguro
  const isSafe = useCallback(
    (text: string): boolean => {
      return isContentSafe(text, config)
    },
    [config]
  )

  return {
    checkContent,
    validateContent,
    cleanContent: cleanContentText,
    isSafe,
    lastResult,
    warningMessage,
  }
}

/**
 * Hook específico para moderación de chat
 */
export function useChatModeration() {
  const moderation = useModeration({
    showWarnings: true,
    config: {
      enableProfanityFilter: true,
      enableSpamDetection: true,
      autoBlockDangerous: true,
    },
  })

  const validateMessage = useCallback(
    (message: string): { valid: boolean; reason?: string } => {
      const result = moderation.checkContent(message)

      if (!result.isSafe) {
        return {
          valid: false,
          reason: result.suggestions.join(', '),
        }
      }

      return { valid: true }
    },
    [moderation]
  )

  return {
    ...moderation,
    validateMessage,
  }
}

/**
 * Hook específico para moderación de eventos
 */
export function useEventModeration() {
  const moderation = useModeration({
    showWarnings: true,
    config: {
      enableProfanityFilter: true,
      enableSpamDetection: true,
      enableHateSpeechDetection: true,
      autoHideQuestionable: true,
    },
  })

  const validateEvent = useCallback(
    (title: string, description: string): {
      valid: boolean
      titleResult: ModerationResult
      descriptionResult: ModerationResult
    } => {
      const titleResult = moderation.checkContent(title)
      const descriptionResult = moderation.checkContent(description)

      return {
        valid: titleResult.isSafe && descriptionResult.isSafe,
        titleResult,
        descriptionResult,
      }
    },
    [moderation]
  )

  return {
    ...moderation,
    validateEvent,
  }
}
