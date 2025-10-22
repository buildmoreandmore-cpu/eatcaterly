import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { assignNumber } from '@/lib/phone-inventory'
import { isAdmin, getCurrentUserEmail } from '@/lib/auth-utils.server'

/**
 * POST /api/admin/phone-numbers/assign
 * Manually assign a phone number to a business (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    const userIsAdmin = await isAdmin()
    const userEmail = await getCurrentUserEmail()

    console.log('[Phone Assignment] User attempting assignment:', { userEmail, userIsAdmin })

    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access only.' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { phoneNumberId, businessId } = body

    if (!phoneNumberId || !businessId) {
      return NextResponse.json(
        { error: 'phoneNumberId and businessId are required' },
        { status: 400 }
      )
    }

    // Verify phone number exists and is available
    const phoneNumber = await prisma.phoneNumberInventory.findUnique({
      where: { id: phoneNumberId },
    })

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number not found' },
        { status: 404 }
      )
    }

    if (phoneNumber.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: `Phone number is ${phoneNumber.status.toLowerCase()}, not available for assignment` },
        { status: 400 }
      )
    }

    // Verify business exists
    const business = await prisma.businessCustomer.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Check if business already has a phone number
    if (business.assignedPhoneNumber) {
      return NextResponse.json(
        {
          error: `Business "${business.businessName}" already has phone number: ${business.assignedPhoneNumber}`,
          currentNumber: business.assignedPhoneNumber
        },
        { status: 400 }
      )
    }

    // Assign the phone number
    const assignResult = await assignNumber(phoneNumberId, businessId)

    if (!assignResult.success) {
      return NextResponse.json(
        { error: assignResult.error || 'Failed to assign phone number' },
        { status: 500 }
      )
    }

    // Update business record with the assigned phone number
    await prisma.businessCustomer.update({
      where: { id: businessId },
      data: {
        assignedPhoneNumber: phoneNumber.phoneNumber,
        ezTextingNumberId: phoneNumber.ezTextingNumberId,
      },
    })

    // Get updated records
    const updatedNumber = await prisma.phoneNumberInventory.findUnique({
      where: { id: phoneNumberId },
    })

    const updatedBusiness = await prisma.businessCustomer.findUnique({
      where: { id: businessId },
    })

    return NextResponse.json({
      success: true,
      message: `Phone number ${phoneNumber.phoneNumber} assigned to "${business.businessName}"`,
      phoneNumber: updatedNumber,
      business: updatedBusiness,
    })
  } catch (error: any) {
    console.error('Error assigning phone number:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
