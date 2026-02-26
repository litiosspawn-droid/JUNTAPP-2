// Global TypeScript types for the application

export interface User {
  id: string
  email: string
  displayName?: string
  photoURL?: string
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  title: string
  description: string
  location: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  date: Date
  createdBy: string
  attendees: string[]
  images: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  eventId: string
  userId: string
  userName: string
  content: string
  timestamp: Date
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// ============================================================================
// Enhanced Chat System Types
// ============================================================================

/**
 * Tipos de mensaje en el chat
 */
export type MessageType = 'TEXT' | 'IMAGE' | 'LOCATION' | 'EVENT_UPDATE' | 'REACTION'

/**
 * Reacciones disponibles para mensajes
 */
export type ReactionEmoji = '👍' | '❤️' | '😂' | '😮' | '😢' | '😡' | '🎉' | '🔥'

/**
 * Ubicación compartida en el chat
 */
export interface SharedLocation {
  lat: number
  lng: number
  address?: string
  timestamp: Date
}

/**
 * Reacción a un mensaje
 */
export interface MessageReaction {
  emoji: ReactionEmoji
  userId: string
  userName: string
  timestamp: Date
}

/**
 * Mensaje mejorado con soporte para reacciones y ubicación
 */
export interface EnhancedChatMessage {
  id: string
  eventId: string
  userId: string
  userName: string
  userPhotoURL?: string
  type: MessageType
  content: string
  timestamp: Date
  updatedAt?: Date
  // Características mejoradas
  reactions: MessageReaction[]
  location?: SharedLocation
  imageUrl?: string
  // Estado del mensaje
  isEdited: boolean
  isDeleted: boolean
  // Metadata
  replyTo?: string // ID del mensaje al que responde
  mentions?: string[] // IDs de usuarios mencionados
}

/**
 * Estado de lectura del chat
 */
export interface ChatReadStatus {
  userId: string
  lastReadMessageId: string
  lastReadAt: Date
}

/**
 * Sala de chat de un evento
 */
export interface ChatRoom {
  id: string
  eventId: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  participantCount: number
  lastMessage?: EnhancedChatMessage
}

/**
 * Participante del chat
 */
export interface ChatParticipant {
  userId: string
  userName: string
  photoURL?: string
  joinedAt: Date
  lastSeenAt?: Date
  isAdmin: boolean
  isBanned: boolean
}

/**
 * Configuración del chat
 */
export interface ChatSettings {
  allowImages: boolean
  allowLocation: boolean
  allowReactions: boolean
  maxMessagesPerMinute: number
  bannedWords: string[]
}

// ============================================================================
// Recommendation System Types
// ============================================================================

/**
 * Categorías de eventos con pesos para recomendaciones
 */
export type EventCategory = 
  | 'musica'
  | 'deportes'
  | 'tecnologia'
  | 'arte'
  | 'gastronomia'
  | 'educacion'
  | 'social'
  | 'negocios'
  | 'salud'
  | 'otros'

/**
 * Preferencias de usuario para el sistema de recomendaciones
 */
export interface UserPreferences {
  userId: string
  favoriteCategories: Record<EventCategory, number> // Peso por categoría (0-10)
  favoriteLocations: Array<{
    lat: number
    lng: number
    weight: number // Frecuencia de visita (0-10)
  }>
  preferredTimeSlots: {
    morning: number // 6-12 (0-10)
    afternoon: number // 12-18 (0-10)
    evening: number // 18-24 (0-10)
    night: number // 0-6 (0-10)
  }
  preferredDaysOfWeek: number[] // 0-6 (Domingo-Sábado) con peso implícito
  maxDistance: number // Kilómetros máximos (0 = sin límite)
  priceRange: 'free' | 'low' | 'medium' | 'high' | 'any'
  lastUpdated: Date
}

/**
 * Historial de interacciones del usuario con eventos
 */
export interface UserEventHistory {
  userId: string
  attendedEvents: string[] // IDs de eventos a los que asistió
  likedEvents: string[] // IDs de eventos que le dio like
  savedEvents: string[] // IDs de eventos guardados
  searchedCategories: EventCategory[] // Búsquedas recientes
  createdAt: Date
  updatedAt: Date
}

/**
 * Score de recomendación para un evento
 */
export interface EventRecommendation {
  eventId: string
  score: number // 0-100
  reasons: RecommendationReason[]
  event: Event
}

/**
 * Razón por la cual se recomienda un evento
 */
export interface RecommendationReason {
  type: 'category' | 'location' | 'time' | 'trending' | 'social'
  label: string
  weight: number // 0-1
  description?: string
}

/**
 * Parámetros para calcular recomendaciones
 */
export interface RecommendationParams {
  userId: string
  limit?: number
  categories?: EventCategory[]
  excludeEventIds?: string[]
  includeTrending?: boolean
  includeSocial?: boolean
}

/**
 * Resultado del algoritmo de recomendación
 */
export interface RecommendationResult {
  recommendations: EventRecommendation[]
  totalScore: number
  calculatedAt: Date
  algorithmVersion: string
}
