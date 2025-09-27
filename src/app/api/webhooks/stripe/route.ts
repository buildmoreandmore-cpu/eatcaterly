import { NextRequest, NextResponse } from 'next/server'
import { handleWebhook } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    const result = await handleWebhook(rawBody, signature)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe webhook endpoint',
    status: 'active'
  })
}