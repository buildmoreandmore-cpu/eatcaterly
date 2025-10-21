import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isAdmin } from '@/lib/auth-utils.server'

/**
 * GET /api/admin/promo-codes
 * Get all promo codes (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const userIsAdmin = await isAdmin()

    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access only.' },
        { status: 403 }
      )
    }

    const promoCodes = await prisma.promoCode.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { businessCustomers: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      promoCodes,
    })
  } catch (error: any) {
    console.error('Error fetching promo codes:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/promo-codes
 * Create a new promo code (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const userIsAdmin = await isAdmin()

    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access only.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      code,
      discountType,
      discountValue,
      freePhoneNumber,
      freeSubscription,
      maxUses,
      expiresAt,
      description,
    } = body

    // Validation
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    if (!discountValue || typeof discountValue !== 'number') {
      return NextResponse.json(
        { error: 'Discount value is required' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A promo code with this code already exists' },
        { status: 400 }
      )
    }

    // Create promo code
    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discountType: discountType || 'PERCENTAGE',
        discountValue,
        freePhoneNumber: freePhoneNumber || false,
        freeSubscription: freeSubscription || false,
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        description: description || null,
      },
    })

    return NextResponse.json({
      success: true,
      promoCode,
    })
  } catch (error: any) {
    console.error('Error creating promo code:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/promo-codes
 * Update a promo code (admin only)
 */
export async function PUT(req: NextRequest) {
  try {
    const userIsAdmin = await isAdmin()

    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access only.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      id,
      isActive,
      maxUses,
      expiresAt,
      description,
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Promo code ID is required' },
        { status: 400 }
      )
    }

    // Update promo code
    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? isActive : undefined,
        maxUses: maxUses !== undefined ? maxUses : undefined,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
        description: description !== undefined ? description : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      promoCode,
    })
  } catch (error: any) {
    console.error('Error updating promo code:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
