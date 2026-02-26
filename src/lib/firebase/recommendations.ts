/**
 * Firebase functions para el sistema de recomendaciones
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  limit,
  getDocs,
} from 'firebase/firestore'
import { db } from './client'
import type {
  UserPreferences,
  UserEventHistory,
  EventCategory,
} from '@/types'
import { createDefaultPreferences } from '../recommendations'

// ============================================================================
// Preferencias de Usuario
// ============================================================================

/**
 * Obtiene las preferencias de un usuario
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const docRef = doc(db, 'userPreferences', userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        ...data,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
      } as UserPreferences
    }

    // Crear preferencias por defecto si no existen
    const defaultPrefs = createDefaultPreferences(userId)
    await setDoc(docRef, defaultPrefs)
    return defaultPrefs
  } catch (error) {
    console.error('Error getting user preferences:', error)
    return null
  }
}

/**
 * Actualiza las preferencias de un usuario
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  try {
    const docRef = doc(db, 'userPreferences', userId)
    await updateDoc(docRef, {
      ...preferences,
      lastUpdated: new Date(),
    })
  } catch (error) {
    console.error('Error updating user preferences:', error)
    throw error
  }
}

/**
 * Actualiza una categoría específica
 */
export async function updateCategoryPreference(
  userId: string,
  category: EventCategory,
  weight: number
): Promise<void> {
  try {
    const docRef = doc(db, 'userPreferences', userId)
    await updateDoc(docRef, {
      [`favoriteCategories.${category}`]: Math.min(10, Math.max(0, weight)),
      lastUpdated: new Date(),
    })
  } catch (error) {
    console.error('Error updating category preference:', error)
    throw error
  }
}

/**
 * Agrega una ubicación frecuente
 */
export async function addFavoriteLocation(
  userId: string,
  lat: number,
  lng: number,
  weight: number = 5
): Promise<void> {
  try {
    const docRef = doc(db, 'userPreferences', userId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      await setDoc(docRef, createDefaultPreferences(userId))
    }

    const currentLocations = docSnap.data()?.favoriteLocations || []
    
    // Verificar si ya existe una ubicación similar (dentro de 1km)
    const isDuplicate = currentLocations.some((loc: any) => {
      const distance = Math.sqrt(
        Math.pow(loc.lat - lat, 2) + Math.pow(loc.lng - lng, 2)
      )
      return distance < 0.01 // ~1km
    })

    if (!isDuplicate) {
      await updateDoc(docRef, {
        favoriteLocations: [
          ...currentLocations.slice(-4), // Mantener máximo 5 ubicaciones
          { lat, lng, weight },
        ],
        lastUpdated: new Date(),
      })
    }
  } catch (error) {
    console.error('Error adding favorite location:', error)
    throw error
  }
}

// ============================================================================
// Historial de Eventos
// ============================================================================

/**
 * Obtiene el historial de eventos de un usuario
 */
export async function getUserEventHistory(userId: string): Promise<UserEventHistory | null> {
  try {
    const docRef = doc(db, 'userEventHistory', userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserEventHistory
    }

    // Crear historial vacío si no existe
    const emptyHistory: UserEventHistory = {
      userId,
      attendedEvents: [],
      likedEvents: [],
      savedEvents: [],
      searchedCategories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await setDoc(docRef, emptyHistory)
    return emptyHistory
  } catch (error) {
    console.error('Error getting user event history:', error)
    return null
  }
}

/**
 * Registra que un usuario asistió a un evento
 */
export async function markEventAsAttended(
  userId: string,
  eventId: string
): Promise<void> {
  try {
    const docRef = doc(db, 'userEventHistory', userId)
    await updateDoc(docRef, {
      attendedEvents: arrayUnion(eventId),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error marking event as attended:', error)
    throw error
  }
}

/**
 * Registra que un usuario dio like a un evento
 */
export async function markEventAsLiked(
  userId: string,
  eventId: string
): Promise<void> {
  try {
    const docRef = doc(db, 'userEventHistory', userId)
    await updateDoc(docRef, {
      likedEvents: arrayUnion(eventId),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error marking event as liked:', error)
    throw error
  }
}

/**
 * Registra que un usuario guardó un evento
 */
export async function markEventAsSaved(
  userId: string,
  eventId: string
): Promise<void> {
  try {
    const docRef = doc(db, 'userEventHistory', userId)
    await updateDoc(docRef, {
      savedEvents: arrayUnion(eventId),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error marking event as saved:', error)
    throw error
  }
}

/**
 * Elimina un evento de los guardados
 */
export async function unmarkEventAsSaved(
  userId: string,
  eventId: string
): Promise<void> {
  try {
    const docRef = doc(db, 'userEventHistory', userId)
    await updateDoc(docRef, {
      savedEvents: arrayRemove(eventId),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error unmarking event as saved:', error)
    throw error
  }
}

/**
 * Registra una búsqueda de categoría
 */
export async function recordCategorySearch(
  userId: string,
  category: EventCategory
): Promise<void> {
  try {
    const docRef = doc(db, 'userEventHistory', userId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        userId,
        attendedEvents: [],
        likedEvents: [],
        savedEvents: [],
        searchedCategories: [category],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      return
    }

    const currentSearches = docSnap.data()?.searchedCategories || []
    const newSearches = [category, ...currentSearches.filter((c: string) => c !== category)].slice(0, 10)

    await updateDoc(docRef, {
      searchedCategories: newSearches,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error recording category search:', error)
    throw error
  }
}

// ============================================================================
// Firestore Rules Helper
// ============================================================================

/**
 * Inicializa las colecciones para un usuario nuevo
 */
export async function initializeUserRecommendations(userId: string): Promise<void> {
  try {
    // Crear preferencias por defecto
    const preferencesRef = doc(db, 'userPreferences', userId)
    await setDoc(preferencesRef, createDefaultPreferences(userId))

    // Crear historial vacío
    const historyRef = doc(db, 'userEventHistory', userId)
    await setDoc(historyRef, {
      userId,
      attendedEvents: [],
      likedEvents: [],
      savedEvents: [],
      searchedCategories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error initializing user recommendations:', error)
    throw error
  }
}
