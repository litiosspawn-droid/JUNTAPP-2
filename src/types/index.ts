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
// Rating & Review System Types
// ============================================================================

/**
 * Calificación de evento (1-5 estrellas)
 */
export interface EventRating {
  id: string
  eventId: string
  userId: string
  userName: string
  userPhotoURL?: string
  rating: number // 1-5
  comment?: string
  photos?: string[]
  createdAt: Date
  updatedAt?: Date
  // Dimensiones de calificación
  ratings: {
    quality: number // Calidad general
    organization: number // Organización
    location: number // Ubicación
  }
  // Reacciones a la reseña
  helpfulCount: number
  notHelpfulCount: number
  // Moderación
  isVerified: boolean // Solo usuarios que asistieron
  isFlagged: boolean
  flaggedReason?: string
}

/**
 * Resumen de calificaciones de un evento
 */
export interface EventRatingSummary {
  eventId: string
  averageRating: number
  totalRatings: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  dimensionAverages: {
    quality: number
    organization: number
    location: number
  }
  recommendedPercentage: number
  totalReviews: number
  totalPhotos: number
}

/**
 * Calificación de usuario (reputación)
 */
export interface UserRating {
  id: string
  ratedUserId: string
  raterUserId: string
  raterUserName: string
  rating: number // 1-5
  comment?: string
  eventId?: string // Evento relacionado
  createdAt: Date
  categories: {
    reliability: number // Confiabilidad
    friendliness: number // Amabilidad
    communication: number // Comunicación
  }
}

/**
 * Estadísticas de usuario
 */
export interface UserRatingSummary {
  userId: string
  averageRating: number
  totalRatings: number
  eventsOrganized: number
  eventsAttended: number
  reputationScore: number // 0-100
  badges: string[]
}

/**
 * Badge/Logro de usuario
 */
export interface UserBadge {
  id: string
  userId: string
  badgeType: BadgeType
  earnedAt: Date
  description: string
  icon: string
}

export type BadgeType =
  | 'first_event'
  | 'organizer_5'
  | 'organizer_10'
  | 'organizer_25'
  | 'super_organizer'
  | 'reviewer_10'
  | 'reviewer_50'
  | 'helpful_reviewer'
  | 'verified_attendee'
  | 'early_adopter'
  | 'community_leader'

/**
 * Tipos de contenido a moderar
 */
export type ContentType = 'text' | 'image' | 'event' | 'user_profile' | 'chat_message'

/**
 * Nivel de severidad de contenido
 */
export type ContentSeverity = 'safe' | 'questionable' | 'inappropriate' | 'dangerous'

/**
 * Razones de moderación
 */
export type ModerationReason =
  | 'profanity'
  | 'hate_speech'
  | 'harassment'
  | 'spam'
  | 'explicit_content'
  | 'violence'
  | 'self_harm'
  | 'misinformation'
  | 'scam'
  | 'other'

/**
 * Resultado de moderación de contenido
 */
export interface ModerationResult {
  isSafe: boolean
  severity: ContentSeverity
  confidence: number // 0-1
  reasons: ModerationReason[]
  flaggedWords?: string[]
  suggestions?: string[]
  autoAction?: 'allow' | 'review' | 'block'
}

/**
 * Configuración de moderación automática
 */
export interface ModerationConfig {
  enableProfanityFilter: boolean
  enableSpamDetection: boolean
  enableHateSpeechDetection: boolean
  enableExplicitContentDetection: boolean
  autoBlockDangerous: boolean
  autoHideQuestionable: boolean
  requireManualReview: boolean
  bannedWords: string[]
  spamPatterns: string[]
}

/**
 * Reporte de contenido
 */
export interface ContentReport {
  id: string
  targetType: ContentType
  targetId: string
  targetUserId: string
  reporterId: string
  reason: ModerationReason
  description?: string
  status: 'pending' | 'reviewing' | 'approved' | 'rejected'
  severity: ContentSeverity
  createdAt: Date
  reviewedAt?: Date
  reviewedBy?: string // Admin ID
  resolution?: string
}

/**
 * Estadísticas de moderación
 */
export interface ModerationStats {
  totalReports: number
  pendingReports: number
  approvedReports: number
  rejectedReports: number
  autoBlocked: number
  autoHidden: number
  manualReviews: number
  avgReviewTime: number // minutos
}

/**
 * Historial de acciones de moderación
 */
export interface ModerationAction {
  id: string
  userId: string
  actionType: 'warn' | 'mute' | 'ban' | 'content_remove' | 'content_hide'
  reason: string
  expiresAt?: Date
  createdAt: Date
  createdBy: string // Admin ID
}

/**
 * Estado de usuario en el sistema de moderación
 */
export interface UserModerationStatus {
  userId: string
  warnings: number
  strikes: number
  isBanned: boolean
  isMuted: boolean
  banExpiresAt?: Date
  muteExpiresAt?: Date
  lastViolationAt?: Date
  trustScore: number // 0-100
}

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
