import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Health Check Endpoint
 *
 * Returns 200 OK if all critical services are healthy
 * Returns 503 Service Unavailable if any critical service is down
 *
 * Checks:
 * - Database connectivity (PostgreSQL via Prisma)
 * - Redis connectivity (if configured)
 * - Environment variables
 *
 * Usage:
 * - UptimeRobot: Monitor GET /api/health every 5 minutes
 * - Vercel Monitoring: Auto-configured via vercel.json
 * - Pingdom, StatusCake, etc: Any service that supports HTTP checks
 */

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  checks: {
    database: {
      status: 'up' | 'down'
      responseTime?: number
      error?: string
    }
    redis?: {
      status: 'up' | 'down' | 'not_configured'
      responseTime?: number
      error?: string
    }
    environment: {
      status: 'up' | 'down'
      missing?: string[]
    }
  }
}

export async function GET() {
  const startTime = Date.now()
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'down' },
      environment: { status: 'up' },
    },
  }

  // 1. Check Database Connectivity
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    result.checks.database = {
      status: 'up',
      responseTime: Date.now() - dbStart,
    }
  } catch (error: any) {
    result.status = 'unhealthy'
    result.checks.database = {
      status: 'down',
      error: error.message || 'Database connection failed',
    }
  }

  // 2. Check Redis Connectivity (if configured)
  // TODO: Redis check disabled until @/lib/redis is created
  result.checks.redis = {
    status: 'not_configured',
  }

  // 3. Check Critical Environment Variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'DIRECT_URL',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'EZ_TEXTING_API_KEY',
  ]

  const missingVars = requiredEnvVars.filter((key) => !process.env[key])

  if (missingVars.length > 0) {
    result.status = 'unhealthy'
    result.checks.environment = {
      status: 'down',
      missing: missingVars,
    }
  }

  // Return appropriate status code
  const statusCode = result.status === 'healthy' ? 200 : 503
  const totalResponseTime = Date.now() - startTime

  return NextResponse.json(
    {
      ...result,
      responseTime: totalResponseTime,
    },
    {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  )
}
