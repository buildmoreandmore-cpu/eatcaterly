import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
})

// Subscription pricing (split payment model)
const SUBSCRIPTION_PRICES = {
  starter: 3500, // $35/month (total $65 - $30 phone number)
  pro: 9500, // $95/month (total $125 - $30 phone number)
}

const PHONE_NUMBER_PRICE = 3000 // $30 one-time charge for EZ Texting phone number

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

    // Check promo code for special handling
    let skipPhoneCharge = false
    let promoDiscount = 0
    if (promoCode || promoCodeId) {
      const promo = await prisma.promoCode.findFirst({
        where: promoCodeId ? { id: promoCodeId } : { code: promoCode },
      })

      if (promo && promo.isActive) {
        console.log('[Create-Checkout] Promo code found:', { code: promo.code, freePhoneNumber: promo.freePhoneNumber, freeSubscription: promo.freeSubscription })

        // Skip phone number charge if promo provides free phone
        if (promo.freePhoneNumber) {
          skipPhoneCharge = true
        }

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
      skipPhoneCharge,
      originalPrice: SUBSCRIPTION_PRICES[plan as keyof typeof SUBSCRIPTION_PRICES],
      discountedPrice: subscriptionPrice,
      promoDiscount
    })

    // Build line items array
    const lineItems: any[] = []

    // Add phone number charge only if not skipped by promo
    if (!skipPhoneCharge) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'A2P-Compliant Phone Number',
            description: 'One-time setup fee for your dedicated SMS phone number',
          },
          unit_amount: PHONE_NUMBER_PRICE,
        },
        quantity: 1,
      })
    }

    // Add subscription (always add, even if $0 with promo)
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
          description: `SMS ordering and menu management for your food business`,
        },
        unit_amount: subscriptionPrice,
        recurring: {
          interval: 'month',
        },
      },
      quantity: 1,
    })

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
        freePhoneNumber: skipPhoneCharge.toString(),
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
