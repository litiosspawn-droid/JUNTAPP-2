/**
 * Sistema de Recomendaciones de Eventos
 * 
 * Algoritmo que calcula la relevancia de eventos para cada usuario
 * basado en preferencias, historial y comportamiento.
 */

import type {
  Event,
  EventRecommendation,
  EventCategory,
  RecommendationReason,
  RecommendationParams,
  RecommendationResult,
  UserPreferences,
  UserEventHistory,
} from '@/types'

// ============================================================================
// Constantes del Algoritmo
// ============================================================================

const ALGORITHM_VERSION = '1.0.0'

// Pesos de cada factor en el score final
const WEIGHTS = {
  category: 0.35,      // 35% - Coincidencia de categoría
  location: 0.25,      // 25% - Cercanía a ubicación frecuente
  time: 0.15,          // 15% - Horario y día preferido
  trending: 0.15,      // 15% - Popularidad del evento
  social: 0.10,        // 10% - Amigos asistiendo
}

// Umbrales
const MIN_SCORE = 0           // Score mínimo para mostrar recomendación
const MAX_SCORE = 100         // Score máximo
const TRENDING_THRESHOLD = 50 // Número de attendees para considerar trending

// ============================================================================
// Funciones Auxiliares
// ============================================================================

/**
 * Calcula la distancia entre dos coordenadas (Fórmula de Haversine)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Obtiene la categoría de un evento basado en título y descripción
 */
function extractEventCategory(event: Event): EventCategory {
  const text = `${event.title} ${event.description}`.toLowerCase()

  const categoryKeywords: Record<EventCategory, string[]> = {
    musica: ['concierto', 'música', 'banda', 'dj', 'festival', 'canción', 'álbum'],
    deportes: ['fútbol', 'basquet', 'tenis', 'maratón', 'deporte', 'partido', 'torneo'],
    tecnologia: ['tech', 'programación', 'startup', 'innovación', 'ai', 'blockchain'],
    arte: ['exposición', 'museo', 'pintura', 'escultura', 'galería', 'arte'],
    gastronomia: ['comida', 'restaurante', 'cata', 'gastronómico', 'culinario', 'food'],
    educacion: ['taller', 'curso', 'charla', 'conferencia', 'educativo', 'aprendizaje'],
    social: ['fiesta', 'encuentro', 'social', 'networking', 'meetup'],
    negocios: ['negocios', 'empresa', 'emprendimiento', 'inversión', 'startup'],
    salud: ['yoga', 'meditación', 'salud', 'bienestar', 'fitness', 'wellness'],
    otros: [],
  }

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category as EventCategory
    }
  }

  return 'otros'
}

/**
 * Determina el time slot de una fecha
 */
function getTimeSlot(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = date.getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 24) return 'evening'
  return 'night'
}

// ============================================================================
// Funciones de Scoring
// ============================================================================

/**
 * Calcula el score de categoría (0-100)
 */
function calculateCategoryScore(
  event: Event,
  preferences: UserPreferences,
  history: UserEventHistory
): { score: number; reason: RecommendationReason } {
  const eventCategory = extractEventCategory(event)
  const categoryWeight = preferences.favoriteCategories[eventCategory] || 0

  // Bonus por historial
  const historyBonus = history.attendedEvents.length > 0 ? 10 : 0
  const searchBonus = history.searchedCategories.includes(eventCategory) ? 15 : 0

  const baseScore = (categoryWeight / 10) * 100
  const finalScore = Math.min(100, baseScore + historyBonus + searchBonus)

  return {
    score: finalScore,
    reason: {
      type: 'category',
      label: 'Categoría de tu interés',
      weight: finalScore / 100,
      description: `Evento de ${eventCategory}`,
    },
  }
}

/**
 * Calcula el score de ubicación (0-100)
 */
function calculateLocationScore(
  event: Event,
  preferences: UserPreferences
): { score: number; reason: RecommendationReason } {
  if (!preferences.favoriteLocations || preferences.favoriteLocations.length === 0) {
    return { score: 50, reason: { type: 'location', label: 'Ubicación', weight: 0.5 } }
  }

  // Encontrar la ubicación frecuente más cercana
  let minDistance = Infinity
  let closestWeight = 0

  for (const loc of preferences.favoriteLocations) {
    const distance = calculateDistance(
      event.location.coordinates.lat,
      event.location.coordinates.lng,
      loc.lat,
      loc.lng
    )

    if (distance < minDistance) {
      minDistance = distance
      closestWeight = loc.weight
    }
  }

  // Score basado en distancia (más cerca = más score)
  // 0km = 100, 5km = 80, 10km = 60, 20km = 40, 50km = 20
  let distanceScore = 100
  if (minDistance > 0) {
    distanceScore = Math.max(0, 100 - minDistance * 2)
  }

  // Weight por frecuencia de visita
  const frequencyBonus = (closestWeight / 10) * 20

  const finalScore = Math.min(100, distanceScore + frequencyBonus)

  return {
    score: finalScore,
    reason: {
      type: 'location',
      label: minDistance < 2 ? 'Muy cerca de ti' : 'Cerca de tus lugares frecuentes',
      weight: finalScore / 100,
      description: `A ${minDistance.toFixed(1)} km`,
    },
  }
}

/**
 * Calcula el score de tiempo (0-100)
 */
function calculateTimeScore(
  event: Event,
  preferences: UserPreferences
): { score: number; reason: RecommendationReason } {
  const eventDate = new Date(event.date)
  const timeSlot = getTimeSlot(eventDate)
  const dayOfWeek = eventDate.getDay()

  // Score por time slot
  const timeSlotScore = preferences.preferredTimeSlots[timeSlot] || 5

  // Score por día de semana
  const dayPreference = preferences.preferredDaysOfWeek.includes(dayOfWeek)
  const dayScore = dayPreference ? 10 : 5

  const finalScore = ((timeSlotScore + dayScore) / 20) * 100

  return {
    score: finalScore,
    reason: {
      type: 'time',
      label: 'En tu horario preferido',
      weight: finalScore / 100,
      description: `${timeSlot} - ${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dayOfWeek]}`,
    },
  }
}

/**
 * Calcula el score trending (0-100)
 */
function calculateTrendingScore(event: Event): {
  score: number
  reason: RecommendationReason
} {
  const attendees = Array.isArray(event.attendees) ? event.attendees.length : 0

  // Score basado en número de attendees
  // 0 attendees = 20, 50 attendees = 60, 100 attendees = 80, 200+ = 100
  let trendingScore = 20
  if (attendees > 0) {
    trendingScore = Math.min(100, 20 + attendees * 0.4)
  }

  const isTrending = attendees >= TRENDING_THRESHOLD

  return {
    score: trendingScore,
    reason: {
      type: 'trending',
      label: isTrending ? 'Evento trending 🔥' : 'Evento popular',
      weight: trendingScore / 100,
      description: `${attendees} personas interesadas`,
    },
  }
}

/**
 * Calcula el score social (0-100)
 * Nota: Esto requiere datos de amigos/seguidores
 */
function calculateSocialScore(
  event: Event,
  history: UserEventHistory
): { score: number; reason: RecommendationReason } {
  // Por ahora, score base
  // En el futuro: verificar si amigos están asistiendo
  const hasSocialProof = event.attendees && event.attendees.length > 10

  return {
    score: hasSocialProof ? 60 : 30,
    reason: {
      type: 'social',
      label: hasSocialProof ? 'Mucha gente asistirá' : 'Evento íntimo',
      weight: hasSocialProof ? 0.6 : 0.3,
    },
  }
}

// ============================================================================
// Función Principal
// ============================================================================

/**
 * Calcula recomendaciones de eventos para un usuario
 */
export function calculateRecommendations(
  events: Event[],
  preferences: UserPreferences,
  history: UserEventHistory,
  params: RecommendationParams
): RecommendationResult {
  const recommendations: EventRecommendation[] = []

  for (const event of events) {
    // Excluir eventos ya vistos si se especifica
    if (params.excludeEventIds?.includes(event.id)) {
      continue
    }

    // Calcular scores individuales
    const categoryResult = calculateCategoryScore(event, preferences, history)
    const locationResult = calculateLocationScore(event, preferences)
    const timeResult = calculateTimeScore(event, preferences)
    const trendingResult = calculateTrendingScore(event)
    const socialResult = calculateSocialScore(event, history)

    // Calcular score final ponderado
    const finalScore =
      categoryResult.score * WEIGHTS.category +
      locationResult.score * WEIGHTS.location +
      timeResult.score * WEIGHTS.time +
      trendingResult.score * WEIGHTS.trending +
      socialResult.score * WEIGHTS.social

    // Solo incluir si supera el mínimo
    if (finalScore >= MIN_SCORE) {
      // Recopilar razones relevantes (weight > 0.5)
      const reasons: RecommendationReason[] = [
        categoryResult.reason,
        locationResult.reason,
        timeResult.reason,
        trendingResult.reason,
        socialResult.reason,
      ].filter((r) => r.weight > 0.5)

      recommendations.push({
        eventId: event.id,
        score: Math.round(finalScore),
        reasons,
        event,
      })
    }
  }

  // Ordenar por score (mayor a menor)
  recommendations.sort((a, b) => b.score - a.score)

  // Limitar resultados
  const limited = recommendations.slice(0, params.limit || 10)

  // Calcular score total promedio
  const totalScore =
    limited.length > 0
      ? Math.round(limited.reduce((sum, r) => sum + r.score, 0) / limited.length)
      : 0

  return {
    recommendations: limited,
    totalScore,
    calculatedAt: new Date(),
    algorithmVersion: ALGORITHM_VERSION,
  }
}

/**
 * Genera preferencias por defecto para un usuario nuevo
 */
export function createDefaultPreferences(userId: string): UserPreferences {
  return {
    userId,
    favoriteCategories: {
      musica: 5,
      deportes: 5,
      tecnologia: 5,
      arte: 5,
      gastronomia: 5,
      educacion: 5,
      social: 5,
      negocios: 5,
      salud: 5,
      otros: 5,
    },
    favoriteLocations: [],
    preferredTimeSlots: {
      morning: 5,
      afternoon: 5,
      evening: 7, // Preferencia por defecto: tarde/noche
      night: 6,
    },
    preferredDaysOfWeek: [5, 6], // Viernes y Sábado por defecto
    maxDistance: 0, // Sin límite
    priceRange: 'any',
    lastUpdated: new Date(),
  }
}

/**
 * Actualiza preferencias basadas en interacción del usuario
 */
export function updatePreferencesFromInteraction(
  preferences: UserPreferences,
  event: Event,
  interactionType: 'attended' | 'liked' | 'saved' | 'searched'
): UserPreferences {
  const category = extractEventCategory(event)

  // Aumentar peso de la categoría
  const categoryIncrease = interactionType === 'attended' ? 2 : 1
  const currentWeight = preferences.favoriteCategories[category] || 5
  const newWeight = Math.min(10, currentWeight + categoryIncrease)

  return {
    ...preferences,
    favoriteCategories: {
      ...preferences.favoriteCategories,
      [category]: newWeight,
    },
    lastUpdated: new Date(),
  }
}
