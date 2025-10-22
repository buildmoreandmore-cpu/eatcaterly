import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
})

// Subscription pricing (full monthly price)
const SUBSCRIPTION_PRICES = {
  starter: 6500, // $65/month (includes phone number)
  pro: 12500, // $125/month (includes phone number)
}

export async function POST(request: NextRequest) {
  try {
    const { plan, businessId, email, promoCode, promoCodeId } = await request.json()

    console.log('[Create-Checkout] Request received:', { plan, businessId, email, promoCode, promoCodeId })

    // Validate plan
    if (!plan || !['starter', 'pro'].includes(plan)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid plan. Must be "starter" or "pro"',
        },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!businessId && !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either businessId or email is required',
        },
        { status: 400 }
      )
    }

    // Get business customer by businessId or email
    let businessCustomer
    if (businessId) {
      businessCustomer = await prisma.businessCustomer.findUnique({
        where: { id: businessId },
      })
    } else {
      businessCustomer = await prisma.businessCustomer.findUnique({
        where: { contactEmail: email },
      })
    }

    if (!businessCustomer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Business profile not found. Please complete onboarding first.',
        },
        { status: 404 }
      )
    }

    // Check promo code for discount
    let promoDiscount = 0
    if (promoCode || promoCodeId) {
      const promo = await prisma.promoCode.findFirst({
        where: promoCodeId ? { id: promoCodeId } : { code: promoCode },
      })

      if (promo && promo.isActive) {
        console.log('[Create-Checkout] Promo code found:', { code: promo.code, freeSubscription: promo.freeSubscription })

        // Calculate discount if promo provides free subscription
        if (promo.freeSubscription) {
          if (promo.discountType === 'PERCENTAGE') {
            promoDiscount = promo.discountValue // e.g., 100 for 100%
          } else {
            // FIXED_AMOUNT in cents
            promoDiscount = promo.discountValue
          }
        }
      }
    }

    // Get subscription price for the selected plan
    let subscriptionPrice = SUBSCRIPTION_PRICES[plan as keyof typeof SUBSCRIPTION_PRICES]

    // Apply discount if applicable (100% = free)
    if (promoDiscount > 0) {
      if (promoDiscount >= 100) {
        // 100% discount = completely free
        subscriptionPrice = 0
      } else {
        // Partial discount
        subscriptionPrice = Math.round(subscriptionPrice * (1 - promoDiscount / 100))
      }
    }

    console.log('[Create-Checkout] Pricing:', {
      originalPrice: SUBSCRIPTION_PRICES[plan as keyof typeof SUBSCRIPTION_PRICES],
      discountedPrice: subscriptionPrice,
      promoDiscount,
      hasPromo: !!promoCode
    })

    // Create subscription line item
    const lineItems: any[] = [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
          description: 'SMS ordering and menu management (includes A2P-compliant phone number)',
        },
        unit_amount: subscriptionPrice,
        recurring: {
          interval: 'month',
        },
      },
      quantity: 1,
    }]

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: businessCustomer.contactEmail,
      client_reference_id: businessCustomer.id,
      metadata: {
        businessId: businessCustomer.id,
        plan: plan,
        promoCode: promoCode || '',
      },
      subscription_data: {
        metadata: {
          businessId: businessCustomer.id,
          plan: plan,
          promoCode: promoCode || '',
        },
        trial_period_days: 14, // 14-day free trial
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding/plan?canceled=true`,
      allow_promotion_codes: true,
    })

    // Update business customer with selected plan (before payment)
    await prisma.businessCustomer.update({
      where: { id: businessCustomer.id },
      data: {
        // Store plan selection (will be activated after payment)
        subscriptionStatus: 'trial', // Will be updated to 'active' by webhook
      },
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error('[Create-Checkout] CRITICAL ERROR:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
      raw: error.raw,
      fullError: error
    })

    // Return user-friendly error message
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create checkout session. Please try again or contact support.',
      },
      { status: 500 }
    )
  }
}
