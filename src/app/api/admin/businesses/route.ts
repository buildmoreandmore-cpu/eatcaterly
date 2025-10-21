import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isAdmin } from '@/lib/auth-utils.server'

/**
 * GET /api/admin/businesses
 * Fetch all businesses or filter by criteria (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const userIsAdmin = await isAdmin()

    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access only.' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const noPhoneNumber = searchParams.get('noPhoneNumber') === 'true'

    // Build query filters
    const where: any = {}

    if (noPhoneNumber) {
      where.assignedPhoneNumber = null
    }

    // Fetch businesses
    const businesses = await prisma.businessCustomer.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        businessName: true,
        contactEmail: true,
        zipCode: true,
        assignedPhoneNumber: true,
        ezTextingNumberId: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      businesses,
      count: businesses.length,
    })
  } catch (error: any) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
