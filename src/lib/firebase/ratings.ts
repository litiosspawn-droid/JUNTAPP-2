/**
 * Firebase functions para el sistema de calificaciones y reseñas
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  increment,
  runTransaction,
} from 'firebase/firestore'
import { db } from './client'
import type { EventRating, EventRatingSummary, UserRating, UserRatingSummary } from '@/types'

// ============================================================================
// Event Ratings
// ============================================================================

/**
 * Agrega o actualiza una calificación de evento
 */
export async function submitEventRating(
  eventId: string,
  userId: string,
  userName: string,
  userPhotoURL: string | undefined,
  rating: number,
  comment: string,
  dimensions: {
    quality: number
    organization: number
    location: number
  },
  photos?: string[]
): Promise<void> {
  const ratingRef = doc(collection(db, 'events', eventId, 'ratings'))
  
  await setDoc(ratingRef, {
    eventId,
    userId,
    userName,
    userPhotoURL,
    rating,
    comment,
    photos: photos || [],
    ratings: dimensions,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    helpfulCount: 0,
    notHelpfulCount: 0,
    isVerified: true, // Verificar que el usuario asistió
    isFlagged: false,
  }, { merge: true })

  // Actualizar resumen del evento
  await updateEventRatingSummary(eventId)
}

/**
 * Actualiza el resumen de calificaciones de un evento
 */
async function updateEventRatingSummary(eventId: string): Promise<void> {
  const ratingsRef = collection(db, 'events', eventId, 'ratings')
  const snapshot = await getDocs(ratingsRef)
  
  const ratings: EventRating[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()
    ratings.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as EventRating)
  })

  // Calcular estadísticas
  const totalRatings = ratings.length
  const averageRating = totalRatings > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
    : 0

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let totalQuality = 0
  let totalOrganization = 0
  let totalLocation = 0
  let totalReviews = 0
  let totalPhotos = 0

  ratings.forEach((r) => {
    ratingDistribution[r.rating as keyof typeof ratingDistribution]++
    totalQuality += r.ratings.quality
    totalOrganization += r.ratings.organization
    totalLocation += r.ratings.location
    if (r.comment) totalReviews++
    if (r.photos && r.photos.length > 0) totalPhotos += r.photos.length
  })

  const summary: EventRatingSummary = {
    eventId,
    averageRating: Math.round(averageRating * 10) / 10,
    totalRatings,
    ratingDistribution,
    dimensionAverages: {
      quality: totalRatings > 0 ? Math.round(totalQuality / totalRatings * 10) / 10 : 0,
      organization: totalRatings > 0 ? Math.round(totalOrganization / totalRatings * 10) / 10 : 0,
      location: totalRatings > 0 ? Math.round(totalLocation / totalRatings * 10) / 10 : 0,
    },
    recommendedPercentage: totalRatings > 0
      ? Math.round((ratingDistribution[5] + ratingDistribution[4]) / totalRatings * 100)
      : 0,
    totalReviews,
    totalPhotos,
  }

  await setDoc(doc(db, 'eventRatingSummaries', eventId), summary)
}

/**
 * Obtiene calificaciones de un evento
 */
export async function getEventRatings(
  eventId: string,
  limitCount: number = 10
): Promise<EventRating[]> {
  const ratingsRef = collection(db, 'events', eventId, 'ratings')
  const q = query(
    ratingsRef,
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  
  const snapshot = await getDocs(q)
  const ratings: EventRating[] = []
  
  snapshot.forEach((doc) => {
    const data = doc.data()
    ratings.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as EventRating)
  })

  return ratings
}

/**
 * Obtiene el resumen de calificaciones de un evento
 */
export async function getEventRatingSummary(eventId: string): Promise<EventRatingSummary | null> {
  const summaryRef = doc(db, 'eventRatingSummaries', eventId)
  const snapshot = await getDoc(summaryRef)
  
  if (snapshot.exists()) {
    return snapshot.data() as EventRatingSummary
  }
  
  return null
}

/**
 * Marca una reseña como útil o no útil
 */
export async function rateReviewHelpfulness(
  eventId: string,
  ratingId: string,
  userId: string,
  isHelpful: boolean
): Promise<void> {
  const ratingRef = doc(db, 'events', eventId, 'ratings', ratingId)
  
  await updateDoc(ratingRef, {
    [isHelpful ? 'helpfulCount' : 'notHelpfulCount']: increment(1),
  })
}

/**
 * Reporta una reseña inapropiada
 */
export async function flagEventRating(
  eventId: string,
  ratingId: string,
  reason: string
): Promise<void> {
  const ratingRef = doc(db, 'events', eventId, 'ratings', ratingId)
  
  await updateDoc(ratingRef, {
    isFlagged: true,
    flaggedReason: reason,
  })
}

/**
 * Elimina una calificación (solo el autor o admin)
 */
export async function deleteEventRating(
  eventId: string,
  ratingId: string,
  userId: string
): Promise<void> {
  const ratingRef = doc(db, 'events', eventId, 'ratings', ratingId)
  const ratingDoc = await getDoc(ratingRef)
  
  if (!ratingDoc.exists()) return
  
  const data = ratingDoc.data()
  
  // Solo el autor puede eliminar
  if (data.userId !== userId) {
    throw new Error('No tienes permiso para eliminar esta calificación')
  }
  
  await deleteDoc(ratingRef)
  await updateEventRatingSummary(eventId)
}

/**
 * Verifica si un usuario puede calificar un evento (asistió)
 */
export async function canUserRateEvent(
  eventId: string,
  userId: string
): Promise<{ canRate: boolean; hasRated: boolean }> {
  // Verificar si ya calificó
  const ratingsRef = collection(db, 'events', eventId, 'ratings')
  const q = query(
    ratingsRef,
    where('userId', '==', userId)
  )
  const snapshot = await getDocs(q)
  
  if (!snapshot.empty) {
    return { canRate: false, hasRated: true }
  }
  
  // Verificar si asistió al evento (revisar attendees)
  const eventRef = doc(db, 'events', eventId)
  const eventDoc = await getDoc(eventRef)
  
  if (!eventDoc.exists()) {
    return { canRate: false, hasRated: false }
  }
  
  const eventData = eventDoc.data()
  const attendees = eventData.attendees || []
  const hasAttended = attendees.includes(userId)
  
  // También verificar si es el creador
  const isCreator = eventData.creatorId === userId
  
  return {
    canRate: hasAttended || isCreator,
    hasRated: false,
  }
}

// ============================================================================
// User Ratings (Reputación)
// ============================================================================

/**
 * Agrega una calificación de usuario
 */
export async function submitUserRating(
  ratedUserId: string,
  raterUserId: string,
  raterUserName: string,
  rating: number,
  comment: string,
  eventId: string | undefined,
  categories: {
    reliability: number
    friendliness: number
    communication: number
  }
): Promise<void> {
  const ratingRef = doc(collection(db, 'users', ratedUserId, 'ratings'))
  
  await setDoc(ratingRef, {
    ratedUserId,
    raterUserId,
    raterUserName,
    rating,
    comment,
    eventId,
    createdAt: serverTimestamp(),
    categories,
  })

  // Actualizar resumen del usuario
  await updateUserRatingSummary(ratedUserId)
}

/**
 * Actualiza el resumen de calificaciones de un usuario
 */
async function updateUserRatingSummary(userId: string): Promise<void> {
  const ratingsRef = collection(db, 'users', userId, 'ratings')
  const snapshot = await getDocs(ratingsRef)
  
  const ratings: UserRating[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()
    ratings.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as UserRating)
  })

  // Calcular estadísticas
  const totalRatings = ratings.length
  const averageRating = totalRatings > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
    : 0

  let totalReliability = 0
  let totalFriendliness = 0
  let totalCommunication = 0

  ratings.forEach((r) => {
    totalReliability += r.categories.reliability
    totalFriendliness += r.categories.friendliness
    totalCommunication += r.categories.communication
  })

  // Calcular reputation score (0-100)
  const reputationScore = Math.round(
    (averageRating / 5) * 100 * 0.6 + // 60% de la calificación promedio
    Math.min(totalRatings * 2, 40) // 40% de la cantidad de calificaciones (max 40)
  )

  const summary: UserRatingSummary = {
    userId,
    averageRating: Math.round(averageRating * 10) / 10,
    totalRatings,
    eventsOrganized: 0, // Calcular por separado
    eventsAttended: 0, // Calcular por separado
    reputationScore,
    badges: [],
  }

  await setDoc(doc(db, 'userRatingSummaries', userId), summary, { merge: true })
}

/**
 * Obtiene calificaciones de un usuario
 */
export async function getUserRatings(
  userId: string,
  limitCount: number = 10
): Promise<UserRating[]> {
  const ratingsRef = collection(db, 'users', userId, 'ratings')
  const q = query(
    ratingsRef,
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  
  const snapshot = await getDocs(q)
  const ratings: UserRating[] = []
  
  snapshot.forEach((doc) => {
    const data = doc.data()
    ratings.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as UserRating)
  })

  return ratings
}

/**
 * Obtiene el resumen de un usuario
 */
export async function getUserRatingSummary(userId: string): Promise<UserRatingSummary | null> {
  const summaryRef = doc(db, 'userRatingSummaries', userId)
  const snapshot = await getDoc(summaryRef)
  
  if (snapshot.exists()) {
    return snapshot.data() as UserRatingSummary
  }
  
  return null
}
