/**
 * Servicio de Moderación de Contenido con IA
 * 
 * Características:
 * - Detección de lenguaje inapropiado
 * - Detección de spam
 * - Análisis de toxicidad
 * - Filtro de palabras prohibidas
 * - Auto-moderación basada en reglas
 */

import type {
  ModerationResult,
  ModerationConfig,
  ContentSeverity,
  ModerationReason,
} from '@/types'

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: ModerationConfig = {
  enableProfanityFilter: true,
  enableSpamDetection: true,
  enableHateSpeechDetection: true,
  enableExplicitContentDetection: true,
  autoBlockDangerous: true,
  autoHideQuestionable: false,
  requireManualReview: false,
  bannedWords: [],
  spamPatterns: [],
}

// Lista básica de palabras inapropiadas (en producción usar una API externa)
const PROFANITY_WORDS = [
  // Palabras ofensivas comunes en español
  // Esta es una lista básica - en producción usar una API como Perspective API
]

// Patrones de spam comunes
const SPAM_PATTERNS = [
  /https?:\/\/[^\s]+/g, // URLs
  /\b\d{10,}\b/g, // Números largos (teléfonos)
  /(\$|€|£)\s*\d+/g, // Precios
  /gratis|free|ganar|premio|sorteo/i, // Palabras de spam
  /compra|venta|oferta|descuento/i,
  /click aquí|haz click|visita/i,
  /whatsapp|telegram|signal/i,
]

// Patrones de discurso de odio (básico)
const HATE_SPEECH_PATTERNS = [
  /odio a los/i,
  /todos los \w+ son/i,
  /deberían morir/i,
  /mueran/i,
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normaliza texto para análisis
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calcula el score de toxicidad basado en patrones
 */
function calculateToxicityScore(text: string): number {
  const normalized = normalizeText(text)
  let score = 0

  // Palabras ofensivas
  PROFANITY_WORDS.forEach((word) => {
    if (normalized.includes(word)) {
      score += 0.3
    }
  })

  // Patrones de odio
  HATE_SPEECH_PATTERNS.forEach((pattern) => {
    if (pattern.test(normalized)) {
      score += 0.4
    }
  })

  // Mayúsculas excesivas (gritos)
  const uppercaseRatio = (text.match(/[A-Z]/g) || []).length / text.length
  if (uppercaseRatio > 0.5) {
    score += 0.2
  }

  // Signos de exclamación excesivos
  const exclamationCount = (text.match(/!/g) || []).length
  if (exclamationCount > 5) {
    score += 0.1
  }

  return Math.min(1, score)
}

/**
 * Detecta spam en el texto
 */
function detectSpam(text: string, config: ModerationConfig): { isSpam: boolean; score: number } {
  if (!config.enableSpamDetection) {
    return { isSpam: false, score: 0 }
  }

  let score = 0
  const normalized = normalizeText(text)

  // URLs múltiples
  const urlMatches = text.match(SPAM_PATTERNS[0])
  if (urlMatches && urlMatches.length > 2) {
    score += 0.5
  }

  // Patrones de spam
  SPAM_PATTERNS.slice(1).forEach((pattern) => {
    if (pattern.test(normalized)) {
      score += 0.15
    }
  })

  // Texto repetitivo
  const words = normalized.split(' ')
  const uniqueWords = new Set(words)
  const repetitionRatio = uniqueWords.size / words.length
  if (repetitionRatio < 0.3 && words.length > 10) {
    score += 0.3
  }

  // Longitud excesiva
  if (text.length > 500) {
    score += 0.1
  }

  return {
    isSpam: score > 0.6,
    score: Math.min(1, score),
  }
}

/**
 * Detecta lenguaje inapropiado
 */
function detectProfanity(text: string, config: ModerationConfig): {
  hasProfanity: boolean
  flaggedWords: string[]
  score: number
} {
  if (!config.enableProfanityFilter) {
    return { hasProfanity: false, flaggedWords: [], score: 0 }
  }

  const normalized = normalizeText(text)
  const flaggedWords: string[] = []
  let score = 0

  // Palabras prohibidas personalizadas
  config.bannedWords.forEach((word) => {
    if (normalized.includes(word.toLowerCase())) {
      flaggedWords.push(word)
      score += 0.4
    }
  })

  // Lista básica de profanidad
  PROFANITY_WORDS.forEach((word) => {
    if (normalized.includes(word)) {
      flaggedWords.push(word)
      score += 0.3
    }
  })

  return {
    hasProfanity: flaggedWords.length > 0,
    flaggedWords,
    score: Math.min(1, score),
  }
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Analiza contenido y devuelve resultado de moderación
 */
export function moderateContent(
  text: string,
  config: Partial<ModerationConfig> = {}
): ModerationResult {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }
  const reasons: ModerationReason[] = []
  const suggestions: string[] = []
  let severity: ContentSeverity = 'safe'
  let confidence = 0

  // Análisis de toxicidad
  const toxicityScore = calculateToxicityScore(text)
  if (toxicityScore > 0.7) {
    reasons.push('hate_speech')
    severity = 'dangerous'
    confidence = Math.max(confidence, toxicityScore)
    suggestions.push('Considerá usar un lenguaje más respetuoso')
  } else if (toxicityScore > 0.4) {
    reasons.push('harassment')
    severity = 'inappropriate'
    confidence = Math.max(confidence, toxicityScore)
    suggestions.push('El contenido podría ser ofensivo para algunos usuarios')
  }

  // Detección de spam
  const spamResult = detectSpam(text, fullConfig)
  if (spamResult.isSpam) {
    reasons.push('spam')
    if (severity === 'safe') severity = 'questionable'
    confidence = Math.max(confidence, spamResult.score)
    suggestions.push('Evitá compartir enlaces o información comercial en exceso')
  }

  // Detección de profanidad
  const profanityResult = detectProfanity(text, fullConfig)
  if (profanityResult.hasProfanity) {
    reasons.push('profanity')
    if (severity === 'safe') severity = 'inappropriate'
    confidence = Math.max(confidence, profanityResult.score)
    suggestions.push('Evitá usar lenguaje inapropiado')
  }

  // Determinar acción automática
  let autoAction: 'allow' | 'review' | 'block' = 'allow'
  if (severity === 'dangerous' && fullConfig.autoBlockDangerous) {
    autoAction = 'block'
  } else if (severity === 'inappropriate' || (severity === 'questionable' && fullConfig.autoHideQuestionable)) {
    autoAction = 'review'
  }

  return {
    isSafe: severity === 'safe',
    severity,
    confidence,
    reasons,
    flaggedWords: profanityResult.flaggedWords,
    suggestions,
    autoAction,
  }
}

/**
 * Analiza múltiples contenidos en batch
 */
export function moderateContentBatch(
  texts: string[],
  config: Partial<ModerationConfig> = {}
): ModerationResult[] {
  return texts.map((text) => moderateContent(text, config))
}

/**
 * Verifica si un texto es seguro para mostrar
 */
export function isContentSafe(text: string, config?: Partial<ModerationConfig>): boolean {
  const result = moderateContent(text, config)
  return result.isSafe
}

/**
 * Limpia texto de contenido inapropiado
 */
export function cleanContent(text: string, config: Partial<ModerationConfig> = {}): string {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }
  let cleaned = text

  // Reemplazar palabras prohibidas
  config.bannedWords?.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    cleaned = cleaned.replace(regex, '*'.repeat(word.length))
  })

  // Reemplazar profanidad básica
  PROFANITY_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    cleaned = cleaned.replace(regex, '*'.repeat(word.length))
  })

  return cleaned
}

/**
 * Obtiene estadísticas de moderación
 */
export function getModerationStats(reports: any[]): any {
  const stats = {
    totalReports: reports.length,
    pendingReports: reports.filter((r) => r.status === 'pending').length,
    approvedReports: reports.filter((r) => r.status === 'approved').length,
    rejectedReports: reports.filter((r) => r.status === 'rejected').length,
    autoBlocked: 0,
    autoHidden: 0,
    manualReviews: 0,
    avgReviewTime: 0,
  }

  // Calcular estadísticas adicionales
  const reviewedReports = reports.filter((r) => r.reviewedAt)
  if (reviewedReports.length > 0) {
    const totalReviewTime = reviewedReports.reduce((acc, r) => {
      const reviewTime = new Date(r.reviewedAt).getTime() - new Date(r.createdAt).getTime()
      return acc + reviewTime
    }, 0)
    stats.avgReviewTime = Math.round(totalReviewTime / reviewedReports.length / 60000) // minutos
  }

  return stats
}

/**
 * Calcula el trust score de un usuario
 */
export function calculateTrustScore(
  violations: number,
  reportsReceived: number,
  reportsApproved: number,
  accountAge: number // días
): number {
  let score = 100

  // Penalizar por violaciones
  score -= violations * 15

  // Penalizar por reportes aprobados en contra
  score -= reportsApproved * 10

  // Bonus por antigüedad
  score += Math.min(accountAge / 10, 20)

  // Bonus por buen comportamiento
  if (reportsReceived > 0 && reportsApproved === 0) {
    score += 10
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * Determina acción disciplinaria basada en violaciones
 */
export function determineDisciplinaryAction(
  violations: number,
  trustScore: number
): { action: 'none' | 'warn' | 'mute' | 'ban'; duration?: number } {
  // Ban automático por trust score muy bajo
  if (trustScore < 20) {
    return { action: 'ban' }
  }

  // Escalar acciones basado en violaciones
  if (violations >= 5) {
    return { action: 'ban' }
  } else if (violations >= 3) {
    return { action: 'mute', duration: 7 * 24 * 60 * 60 * 1000 } // 7 días
  } else if (violations >= 2) {
    return { action: 'mute', duration: 24 * 60 * 60 * 1000 } // 24 horas
  } else if (violations >= 1) {
    return { action: 'warn' }
  }

  return { action: 'none' }
}
