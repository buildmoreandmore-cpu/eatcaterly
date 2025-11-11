import { z } from 'zod'

/**
 * Environment Variable Validation
 *
 * This file validates all required environment variables at application startup.
 * If any required variable is missing or invalid, the app will fail fast with a clear error message.
 *
 * This prevents:
 * - Production crashes from missing environment variables
 * - Silent failures (e.g., rate limiting disabled when Redis URL missing)
 * - Confusing runtime errors
 */

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database (Required)
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid PostgreSQL connection string'),

  // Clerk Authentication (Required)
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),

  // Stripe (Required)
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_'),

  // Stripe Price IDs
  STRIPE_PRICE_ID_STARTER: z.string().optional(),
  STRIPE_PRICE_ID_PRO: z.string().optional(),

  // Twilio SMS (Required)
  TWILIO_ACCOUNT_SID: z.string().min(1, 'TWILIO_ACCOUNT_SID is required'),
  TWILIO_AUTH_TOKEN: z.string().min(1, 'TWILIO_AUTH_TOKEN is required'),
  TWILIO_PHONE_NUMBER: z.string().min(1, 'TWILIO_PHONE_NUMBER is required'),

  // App URLs
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  APP_URL: z.string().url().optional(),

  // Upstash Redis (Optional - for rate limiting)
  UPSTASH_REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_TOKEN: z.string().optional(),

  // Sentry (Optional - for error tracking)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
})

/**
 * Parsed and validated environment variables.
 *
 * Usage:
 * ```typescript
 * import { env } from '@/lib/env'
 *
 * const stripeClient = new Stripe(env.STRIPE_SECRET_KEY)
 * ```
 *
 * If env vars are invalid, the app will crash at startup with a clear error message.
 */
export const env = envSchema.parse(process.env)

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>
