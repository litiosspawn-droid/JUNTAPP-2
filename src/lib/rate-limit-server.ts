/**
 * Rate Limiter para prevenir spam y abuso (Server-side)
 * Usa variables de entorno y memoria para rate limiting básico
 */

import { db } from '@/lib/firebase/admin';
import * as admin from 'firebase-admin';

export interface RateLimitConfig {
  windowMs: number; // Ventana de tiempo en milisegundos
  maxRequests: number; // Máximo de peticiones por ventana
}

// Configuraciones de rate limiting
export const RATE_LIMITS = {
  // Creación de eventos: 5 eventos por hora
  CREATE_EVENT: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 5,
  } as RateLimitConfig,

  // Envío de notificaciones: 10 por minuto
  SEND_NOTIFICATION: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 10,
  } as RateLimitConfig,

  // Registro de usuarios: 3 por hora por IP/email
  REGISTER: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3,
  } as RateLimitConfig,

  // Login fallido: 5 intentos por 15 minutos
  LOGIN_FAILED: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,
  } as RateLimitConfig,

  // Reenvío de email de verificación: 3 por hora
  RESEND_VERIFICATION: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 3,
  } as RateLimitConfig,
};

export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number // Milisegundos hasta poder reintentar
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Verifica y actualiza el rate limit para una acción específica
 * @param identifier - Identificador único (userId, email, IP, etc.)
 * @param action - Tipo de acción (CREATE_EVENT, SEND_NOTIFICATION, etc.)
 * @param config - Configuración de rate limiting
 * @throws {RateLimitError} Si se excede el límite
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig
): Promise<{ remaining: number; resetAt: Date }> {
  const now = Date.now();
  const rateLimitRef = db.collection('rateLimits').doc(`${action}_${identifier}`);

  try {
    const rateLimitDoc = await rateLimitRef.get();

    if (!rateLimitDoc.exists) {
      // Primer request
      await rateLimitRef.set({
        count: 1,
        windowStart: now,
        lastUpdated: new Date(),
      });

      return {
        remaining: config.maxRequests - 1,
        resetAt: new Date(now + config.windowMs),
      };
    }

    const data = rateLimitDoc.data();
    if (!data) {
      throw new Error('Invalid rate limit data');
    }
    
    const windowStart = data.windowStart as number;
    const count = data.count as number;

    // Verificar si la ventana expiró
    if (now - windowStart >= config.windowMs) {
      // Reiniciar ventana
      await rateLimitRef.update({
        count: 1,
        windowStart: now,
        lastUpdated: new Date(),
      });

      return {
        remaining: config.maxRequests - 1,
        resetAt: new Date(now + config.windowMs),
      };
    }

    // Verificar si excedió el límite
    if (count >= config.maxRequests) {
      const retryAfter = windowStart + config.windowMs - now;
      throw new RateLimitError(
        `Demasiadas peticiones. Intenta en ${Math.ceil(retryAfter / 1000)} segundos.`,
        retryAfter
      );
    }

    // Incrementar contador
    await rateLimitRef.update({
      count: admin.firestore.FieldValue.increment(1),
      lastUpdated: new Date(),
    });

    return {
      remaining: config.maxRequests - count - 1,
      resetAt: new Date(windowStart + config.windowMs),
    };
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error;
    }
    // En caso de error de Firestore, permitir el request (fail-open)
    console.error('Rate limit check error:', error);
    return {
      remaining: config.maxRequests,
      resetAt: new Date(now + config.windowMs),
    };
  }
}
