/**
 * Rate Limiter para prevenir spam y abuso (Client-side)
 * Usa localStorage para rate limiting básico
 */

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
 * Verifica y actualiza el rate limit usando localStorage (client-side)
 * @param identifier - Identificador único (userId, email, etc.)
 * @param action - Tipo de acción
 * @param config - Configuración de rate limiting
 * @throws {RateLimitError} Si se excede el límite
 */
export function checkRateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig
): { remaining: number; resetAt: Date } {
  // Solo disponible en browser
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowMs),
    };
  }

  const now = Date.now();
  const key = `ratelimit_${action}_${identifier}`;
  const stored = localStorage.getItem(key);

  if (!stored) {
    // Primer request
    localStorage.setItem(
      key,
      JSON.stringify({
        count: 1,
        windowStart: now,
      })
    );

    return {
      remaining: config.maxRequests - 1,
      resetAt: new Date(now + config.windowMs),
    };
  }

  try {
    const data = JSON.parse(stored);
    const windowStart = data.windowStart as number;
    const count = data.count as number;

    // Verificar si la ventana expiró
    if (now - windowStart >= config.windowMs) {
      // Reiniciar ventana
      localStorage.setItem(
        key,
        JSON.stringify({
          count: 1,
          windowStart: now,
        })
      );

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
    localStorage.setItem(
      key,
      JSON.stringify({
        count: count + 1,
        windowStart,
      })
    );

    return {
      remaining: config.maxRequests - count - 1,
      resetAt: new Date(windowStart + config.windowMs),
    };
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error;
    }
    // Error parseando, permitir request
    console.error('Rate limit parse error:', error);
    return {
      remaining: config.maxRequests,
      resetAt: new Date(now + config.windowMs),
    };
  }
}
