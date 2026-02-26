/**
 * Hook para sistema de calificaciones y reseñas
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  submitEventRating,
  getEventRatings,
  getEventRatingSummary,
  rateReviewHelpfulness,
  flagEventRating,
  deleteEventRating,
  canUserRateEvent,
  getUserRatings,
  getUserRatingSummary,
  submitUserRating,
} from '@/lib/firebase/ratings'
import type {
  EventRating,
  EventRatingSummary,
  UserRating,
  UserRatingSummary,
} from '@/types'
import { useUnifiedToast } from '@/hooks/use-unified-toast'

interface UseEventRatingsReturn {
  ratings: EventRating[]
  summary: EventRatingSummary | null
  loading: boolean
  canRate: boolean
  hasRated: boolean
  userRating: EventRating | null
  submitRating: (
    rating: number,
    comment: string,
    dimensions: { quality: number; organization: number; location: number },
    photos?: string[]
  ) => Promise<void>
  deleteRating: (ratingId: string) => Promise<void>
  markHelpful: (ratingId: string, helpful: boolean) => Promise<void>
  reportRating: (ratingId: string, reason: string) => Promise<void>
  refreshRatings: () => Promise<void>
}

/**
 * Hook para calificaciones de eventos
 */
export function useEventRatings(eventId: string): UseEventRatingsReturn {
  const { user } = useAuth()
  const toast = useUnifiedToast()
  const [ratings, setRatings] = useState<EventRating[]>([])
  const [summary, setSummary] = useState<EventRatingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [canRate, setCanRate] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const [userRating, setUserRating] = useState<EventRating | null>(null)

  const loadRatings = useCallback(async () => {
    if (!eventId) return

    try {
      setLoading(true)
      const [ratingsData, summaryData] = await Promise.all([
        getEventRatings(eventId, 20),
        getEventRatingSummary(eventId),
      ])

      setRatings(ratingsData)
      setSummary(summaryData)

      // Verificar si el usuario puede calificar
      if (user) {
        const { canRate: can, hasRated: has } = await canUserRateEvent(eventId, user.uid)
        setCanRate(can)
        setHasRated(has)

        // Buscar calificación del usuario
        const userR = ratingsData.find((r) => r.userId === user.uid)
        setUserRating(userR || null)
      }
    } catch (error) {
      console.error('Error loading ratings:', error)
      toast.error('Error al cargar calificaciones')
    } finally {
      setLoading(false)
    }
  }, [eventId, user, toast])

  useEffect(() => {
    loadRatings()
  }, [loadRatings])

  const submitRating = useCallback(
    async (
      rating: number,
      comment: string,
      dimensions: { quality: number; organization: number; location: number },
      photos?: string[]
    ) => {
      if (!user || !canRate || hasRated) {
        toast.error('No puedes calificar este evento')
        return
      }

      try {
        await submitEventRating(
          eventId,
          user.uid,
          user.displayName || 'Usuario',
          user.photoURL || undefined,
          rating,
          comment,
          dimensions,
          photos
        )

        toast.success('¡Gracias por tu calificación!')
        await loadRatings()
      } catch (error) {
        console.error('Error submitting rating:', error)
        toast.error('Error al enviar calificación')
      }
    },
    [user, canRate, hasRated, eventId, loadRatings, toast]
  )

  const deleteRating = useCallback(
    async (ratingId: string) => {
      if (!user) return

      try {
        await deleteEventRating(eventId, ratingId, user.uid)
        toast.success('Calificación eliminada')
        await loadRatings()
      } catch (error) {
        console.error('Error deleting rating:', error)
        toast.error('Error al eliminar calificación')
      }
    },
    [user, eventId, loadRatings, toast]
  )

  const markHelpful = useCallback(
    async (ratingId: string, helpful: boolean) => {
      if (!user) {
        toast.error('Debes iniciar sesión')
        return
      }

      try {
        await rateReviewHelpfulness(eventId, ratingId, user.uid, helpful)
        await loadRatings()
      } catch (error) {
        console.error('Error marking helpful:', error)
      }
    },
    [user, eventId, loadRatings, toast]
  )

  const reportRating = useCallback(
    async (ratingId: string, reason: string) => {
      try {
        await flagEventRating(eventId, ratingId, reason)
        toast.success('Reporte enviado')
      } catch (error) {
        console.error('Error reporting rating:', error)
        toast.error('Error al reportar')
      }
    },
    [eventId, toast]
  )

  const refreshRatings = useCallback(async () => {
    await loadRatings()
  }, [loadRatings])

  return {
    ratings,
    summary,
    loading,
    canRate,
    hasRated,
    userRating,
    submitRating,
    deleteRating,
    markHelpful,
    reportRating,
    refreshRatings,
  }
}

interface UseUserRatingsReturn {
  ratings: UserRating[]
  summary: UserRatingSummary | null
  loading: boolean
  submitRating: (
    rating: number,
    comment: string,
    categories: { reliability: number; friendliness: number; communication: number },
    eventId?: string
  ) => Promise<void>
  refreshRatings: () => Promise<void>
}

/**
 * Hook para calificaciones de usuarios (reputación)
 */
export function useUserRatings(userId: string): UseUserRatingsReturn {
  const { user } = useAuth()
  const toast = useUnifiedToast()
  const [ratings, setRatings] = useState<UserRating[]>([])
  const [summary, setSummary] = useState<UserRatingSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const loadRatings = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const [ratingsData, summaryData] = await Promise.all([
        getUserRatings(userId, 10),
        getUserRatingSummary(userId),
      ])

      setRatings(ratingsData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Error loading user ratings:', error)
      toast.error('Error al cargar reputación')
    } finally {
      setLoading(false)
    }
  }, [userId, toast])

  useEffect(() => {
    loadRatings()
  }, [loadRatings])

  const submitRating = useCallback(
    async (
      rating: number,
      comment: string,
      categories: { reliability: number; friendliness: number; communication: number },
      eventId?: string
    ) => {
      if (!user) {
        toast.error('Debes iniciar sesión')
        return
      }

      try {
        await submitUserRating(
          userId,
          user.uid,
          user.displayName || 'Usuario',
          rating,
          comment,
          eventId,
          categories
        )

        toast.success('¡Gracias por tu calificación!')
        await loadRatings()
      } catch (error) {
        console.error('Error submitting user rating:', error)
        toast.error('Error al enviar calificación')
      }
    },
    [user, userId, loadRatings, toast]
  )

  const refreshRatings = useCallback(async () => {
    await loadRatings()
  }, [loadRatings])

  return {
    ratings,
    summary,
    loading,
    submitRating,
    refreshRatings,
  }
}
