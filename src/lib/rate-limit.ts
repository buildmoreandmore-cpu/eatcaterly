/**
 * Rate Limiting for API Routes
 * Uses Upstash Redis for distributed rate limiting across serverless functions
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client
// Note: For production, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    })
  : null

// Create rate limiters for different endpoint types
const createRateLimiter = (requests: number, window: string) => {
  if (!redis) {
    console.warn('Redis not configured, rate limiting disabled')
    return null
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
  })
}

// Payment endpoints: 20 requests per minute
const paymentLimiter = createRateLimiter(20, '1 m')

// Webhook endpoints: 100 requests per minute
const webhookLimiter = createRateLimiter(100, '1 m')

// General API endpoints: 50 requests per minute
const generalLimiter = createRateLimiter(50, '1 m')

export interface RateLimitResult {
  success: boolean
  limit?: number
  remaining?: number
  reset?: number
}

/**
 * Apply rate limit to payment endpoints
 */
export async function rateLimitPayment(identifier: string): Promise<RateLimitResult> {
  if (!identifier) {
    throw new Error('Rate limit identifier is required')
  }

  if (!paymentLimiter) {
    // If Redis not configured, allow request (fail open for development)
    return {
      success: true,
      remaining: -1,
    }
  }

  try {
    const result = await paymentLimiter.limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // Fail open - allow request if rate limiter fails
    return {
      success: true,
      remaining: -1,
    }
  }
}

/**
 * Apply rate limit to webhook endpoints
 */
export async function rateLimitWebhook(identifier: string): Promise<RateLimitResult> {
  if (!identifier) {
    throw new Error('Rate limit identifier is required')
  }

  if (!webhookLimiter) {
    return {
      success: true,
      remaining: -1,
    }
  }

  try {
    const result = await webhookLimiter.limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    return {
      success: true,
      remaining: -1,
    }
  }
}

/**
 * Apply rate limit to general API endpoints
 */
export async function rateLimitGeneral(identifier: string): Promise<RateLimitResult> {
  if (!identifier) {
    throw new Error('Rate limit identifier is required')
  }

  if (!generalLimiter) {
    return {
      success: true,
      remaining: -1,
    }
  }

  try {
    const result = await generalLimiter.limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    return {
      success: true,
      remaining: -1,
    }
  }
}

/**
 * Get rate limiter by type
 */
export function getRateLimiter(type: 'payment' | 'webhook' | 'general') {
  switch (type) {
    case 'payment':
      return paymentLimiter
    case 'webhook':
      return webhookLimiter
    case 'general':
      return generalLimiter
    default:
      return generalLimiter
  }
}

/**
 * Extract identifier from request (user ID, IP address, etc.)
 */
export function getIdentifier(request: Request): string {
  // Try to get user ID from headers (if authenticated)
  const userId = request.headers.get('x-user-id')
  if (userId) {
    return userId
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwarded) {
    // Take first IP from forwarded list
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  // Fallback to generic identifier
  return 'anonymous'
}
