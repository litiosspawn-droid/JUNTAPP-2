/**
 * Hook para obtener recomendaciones de eventos
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useEvents } from './use-events'
import { calculateRecommendations, createDefaultPreferences } from '@/lib/recommendations'
import {
  getUserPreferences,
  getUserEventHistory,
  initializeUserRecommendations,
} from '@/lib/firebase/recommendations'
import type { EventRecommendation, RecommendationResult } from '@/types'

interface UseRecommendationsOptions {
  limit?: number
  enabled?: boolean
  includeTrending?: boolean
  includeSocial?: boolean
}

interface UseRecommendationsReturn {
  recommendations: EventRecommendation[]
  loading: boolean
  error: Error | null
  hasPreferences: boolean
  totalScore: number
  refreshRecommendations: () => Promise<void>
  algorithmVersion: string
}

/**
 * Hook para obtener recomendaciones personalizadas de eventos
 */
export function useRecommendations({
  limit = 10,
  enabled = true,
  includeTrending = true,
  includeSocial = false,
}: UseRecommendationsOptions = {}): UseRecommendationsReturn {
  const { user, loading: authLoading } = useAuth()
  const { events, loading: eventsLoading } = useEvents()
  
  const [recommendations, setRecommendations] = useState<EventRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasPreferences, setHasPreferences] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [algorithmVersion, setAlgorithmVersion] = useState('1.0.0')

  const loadRecommendations = useCallback(async () => {
    if (!enabled || !user || authLoading || eventsLoading) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Obtener preferencias del usuario
      let preferences = await getUserPreferences(user.uid)
      
      // Si no existen, crear por defecto
      if (!preferences) {
        await initializeUserRecommendations(user.uid)
        preferences = createDefaultPreferences(user.uid)
        setHasPreferences(false)
      } else {
        setHasPreferences(true)
      }

      // Obtener historial del usuario
      const history = await getUserEventHistory(user.uid)

      if (!history) {
        throw new Error('No se pudo obtener el historial de eventos')
      }

      // Calcular recomendaciones
      const result: RecommendationResult = calculateRecommendations(
        events,
        preferences,
        history,
        {
          userId: user.uid,
          limit,
          includeTrending,
          includeSocial,
          excludeEventIds: history.attendedEvents,
        }
      )

      setRecommendations(result.recommendations)
      setTotalScore(result.totalScore)
      setAlgorithmVersion(result.algorithmVersion)
    } catch (err) {
      console.error('Error loading recommendations:', err)
      setError(err instanceof Error ? err : new Error('Error al cargar recomendaciones'))
    } finally {
      setLoading(false)
    }
  }, [enabled, user, authLoading, eventsLoading, events, limit, includeTrending, includeSocial])

  useEffect(() => {
    loadRecommendations()
  }, [loadRecommendations])

  const refreshRecommendations = useCallback(async () => {
    await loadRecommendations()
  }, [loadRecommendations])

  return {
    recommendations,
    loading,
    error,
    hasPreferences,
    totalScore,
    refreshRecommendations,
    algorithmVersion,
  }
}
