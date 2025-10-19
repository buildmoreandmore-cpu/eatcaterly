import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * POST /api/onboarding/complete-free
 * Complete signup for users with 100% discount promo codes
 * Skips Stripe payment and creates business with promo benefits
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      plan,
      promoCodeId,
      promoCode,
      businessId,
      email,
    } = body

    // Validation
    if (!plan || !promoCodeId || !promoCode || !businessId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify promo code is still valid
    const promoCodeRecord = await prisma.promoCode.findUnique({
      where: { id: promoCodeId },
    })

    if (!promoCodeRecord) {
      return NextResponse.json(
        { success: false, error: 'Invalid promo code' },
        { status: 400 }
      )
    }

    if (!promoCodeRecord.isActive) {
      return NextResponse.json(
        { success: false, error: 'Promo code is no longer active' },
        { status: 400 }
      )
    }

    if (promoCodeRecord.expiresAt && new Date() > promoCodeRecord.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Promo code has expired' },
        { status: 400 }
      )
    }

    if (promoCodeRecord.maxUses && promoCodeRecord.currentUses >= promoCodeRecord.maxUses) {
      return NextResponse.json(
        { success: false, error: 'Promo code usage limit reached' },
        { status: 400 }
      )
    }

    // Check if business exists (should already exist from onboarding step 1)
    const existingBusiness = await prisma.businessCustomer.findUnique({
      where: { id: businessId },
    })

    if (!existingBusiness) {
      return NextResponse.json(
        { success: false, error: 'Business not found. Please complete onboarding first.' },
        { status: 404 }
      )
    }

    // Update business customer record with promo benefits and subscription
    const business = await prisma.businessCustomer.update({
      where: { id: businessId },
      data: {
        subscriptionTier: plan,
        subscriptionStatus: 'active',
        phoneNumberFeeWaived: promoCodeRecord.freePhoneNumber,
        promoCodeId: promoCodeId,
        promoCodeUsed: promoCode,
        stripeCustomerId: null, // No Stripe for free signups
        stripeSubscriptionId: null,
      },
    })

    // Increment promo code usage
    await prisma.promoCode.update({
      where: { id: promoCodeId },
      data: {
        currentUses: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      businessId: business.id,
      message: 'Signup completed successfully! An admin will assign your phone number shortly.',
    })
  } catch (error: any) {
    console.error('Error completing free signup:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
