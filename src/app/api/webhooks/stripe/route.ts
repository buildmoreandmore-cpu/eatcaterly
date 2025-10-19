import { NextRequest, NextResponse } from 'next/server'
import { handleWebhook } from '@/lib/stripe'
import { rateLimitWebhook, getIdentifier } from '@/lib/rate-limit'

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse, rateLimit?: {
  limit?: number
  remaining?: number
  reset?: number
}) {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  if (rateLimit) {
    if (rateLimit.limit) {
      response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString())
    }
    if (rateLimit.remaining !== undefined) {
      response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    }
    if (rateLimit.reset) {
      response.headers.set('X-RateLimit-Reset', rateLimit.reset.toString())
    }
  }

  return response
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      const response = NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
      return addSecurityHeaders(response)
    }

    // Apply rate limiting (more lenient for webhooks, but still protected)
    const identifier = `stripe:${getIdentifier(request)}`
    const rateLimitResult = await rateLimitWebhook(identifier)

    if (!rateLimitResult.success) {
      const retryAfter = rateLimitResult.reset
        ? Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        : 60

      const response = NextResponse.json(
        {
          error: 'Too many webhook requests. Please try again later.',
          retryAfter,
        },
        { status: 429 }
      )

      response.headers.set('Retry-After', retryAfter.toString())
      return addSecurityHeaders(response, rateLimitResult)
    }

    const rawBody = await request.text()
    const result = await handleWebhook(rawBody, signature)

    const response = NextResponse.json(result)
    return addSecurityHeaders(response, rateLimitResult)
  } catch (error: any) {
    console.error('Stripe webhook error:', error)

    // Don't expose internal error details
    const errorMessage = error.message?.includes('signature')
      ? 'Invalid webhook signature'
      : 'Webhook processing failed'

    const response = NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
    return addSecurityHeaders(response)
  }
}

export async function GET() {
  const response = NextResponse.json({
    message: 'Stripe webhook endpoint',
    status: 'active'
  })
  return addSecurityHeaders(response)
}