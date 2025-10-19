import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * POST /api/promo-codes/validate
 * Validates a promo code and returns discount information
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Promo code is required' },
        { status: 400 }
      )
    }

    // Find the promo code (case-insensitive)
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: 'Invalid promo code' },
        { status: 404 }
      )
    }

    // Check if promo code is active
    if (!promoCode.isActive) {
      return NextResponse.json(
        { success: false, error: 'This promo code is no longer active' },
        { status: 400 }
      )
    }

    // Check if promo code has expired
    if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'This promo code has expired' },
        { status: 400 }
      )
    }

    // Check usage limit
    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return NextResponse.json(
        { success: false, error: 'This promo code has reached its usage limit' },
        { status: 400 }
      )
    }

    // Valid promo code - return details
    return NextResponse.json({
      success: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        freePhoneNumber: promoCode.freePhoneNumber,
        freeSubscription: promoCode.freeSubscription,
        description: promoCode.description,
      },
    })
  } catch (error: any) {
    console.error('Error validating promo code:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to validate promo code' },
      { status: 500 }
    )
  }
}
