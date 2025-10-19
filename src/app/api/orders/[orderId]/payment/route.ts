import { NextRequest, NextResponse } from 'next/server'
import { createPaymentLink } from '@/lib/stripe'
import { sendSMS } from '@/lib/sms'
import { prisma } from '@/lib/db'
import { rateLimitPayment, getIdentifier } from '@/lib/rate-limit'

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    // Validate order ID
    if (!orderId) {
      const response = NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
      return addSecurityHeaders(response)
    }

    // Apply rate limiting
    const identifier = getIdentifier(request)
    const rateLimitResult = await rateLimitPayment(identifier)

    if (!rateLimitResult.success) {
      const retryAfter = rateLimitResult.reset
        ? Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        : 60

      const response = NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter,
        },
        { status: 429 }
      )

      response.headers.set('Retry-After', retryAfter.toString())
      return addSecurityHeaders(response, rateLimitResult)
    }

    // Create payment link
    const paymentResult = await createPaymentLink(orderId)

    // Get order with customer info to send SMS
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
      },
    })

    if (order && order.customer) {
      // Send payment link via SMS
      const smsMessage = `💳 Payment Link Ready!\\n\\nYour order total: $${(order.totalAmount / 100).toFixed(2)}\\n\\nPay here: ${paymentResult.url}\\n\\nOrder #${order.id.slice(-6)}`

      try {
        await sendSMS(order.customer.phoneNumber, smsMessage, order.customer.id)
      } catch (smsError) {
        console.error('Failed to send payment SMS:', smsError)
        // Don't fail the request if SMS fails
      }
    }

    const response = NextResponse.json({
      success: true,
      data: paymentResult,
      message: 'Payment link created and sent via SMS',
    })
    return addSecurityHeaders(response, rateLimitResult)
  } catch (error: any) {
    console.error('Payment link creation error:', error)

    // Don't expose internal error details
    const errorMessage = error.message?.includes('Stripe account') ||
                        error.message?.includes('onboarding')
      ? error.message
      : 'Failed to create payment link'

    const response = NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 }
    )
    return addSecurityHeaders(response)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        paymentId: true,
        paymentUrl: true,
        status: true,
        totalAmount: true,
      },
    })

    if (!order) {
      const response = NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
      return addSecurityHeaders(response)
    }

    const response = NextResponse.json({
      success: true,
      data: order,
    })
    return addSecurityHeaders(response)
  } catch (error: any) {
    console.error('Order retrieval error:', error)
    const response = NextResponse.json(
      { error: 'Failed to retrieve order' },
      { status: 500 }
    )
    return addSecurityHeaders(response)
  }
}