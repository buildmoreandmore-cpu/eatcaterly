import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { isAdmin, getCurrentUserEmail } from '@/lib/auth-utils.server'

/**
 * POST /api/admin/phone-numbers/reassign
 * Reassign a phone number from one business to another (admin only)
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

    console.log('[Phone Reassignment] User attempting reassignment:', { userEmail, userIsAdmin })

    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access only.' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { fromBusinessId, toBusinessId, phoneNumber } = body

    if (!fromBusinessId || !toBusinessId || !phoneNumber) {
      return NextResponse.json(
        { error: 'fromBusinessId, toBusinessId, and phoneNumber are required' },
        { status: 400 }
      )
    }

    if (fromBusinessId === toBusinessId) {
      return NextResponse.json(
        { error: 'Cannot reassign phone number to the same business' },
        { status: 400 }
      )
    }

    // Verify fromBusiness exists and has this phone number
    const fromBusiness = await prisma.businessCustomer.findUnique({
      where: { id: fromBusinessId },
    })

    if (!fromBusiness) {
      return NextResponse.json(
        { error: 'Source business not found' },
        { status: 404 }
      )
    }

    if (fromBusiness.assignedPhoneNumber !== phoneNumber) {
      return NextResponse.json(
        {
          error: `Business "${fromBusiness.businessName}" does not have phone number ${phoneNumber}`,
          currentNumber: fromBusiness.assignedPhoneNumber
        },
        { status: 400 }
      )
    }

    // Verify toBusiness exists
    const toBusiness = await prisma.businessCustomer.findUnique({
      where: { id: toBusinessId },
    })

    if (!toBusiness) {
      return NextResponse.json(
        { error: 'Destination business not found' },
        { status: 404 }
      )
    }

    // Check if toBusiness already has a phone number
    if (toBusiness.assignedPhoneNumber) {
      return NextResponse.json(
        {
          error: `Destination business "${toBusiness.businessName}" already has phone number: ${toBusiness.assignedPhoneNumber}`,
          currentNumber: toBusiness.assignedPhoneNumber
        },
        { status: 400 }
      )
    }

    // Find the phone number in inventory
    const inventoryNumber = await prisma.phoneNumberInventory.findUnique({
      where: { phoneNumber },
    })

    if (!inventoryNumber) {
      return NextResponse.json(
        { error: 'Phone number not found in inventory' },
        { status: 404 }
      )
    }

    // Verify the inventory number is assigned to the fromBusiness
    if (inventoryNumber.currentBusinessId !== fromBusinessId) {
      return NextResponse.json(
        {
          error: `Phone number ${phoneNumber} is not currently assigned to "${fromBusiness.businessName}"`,
          actualAssignment: inventoryNumber.currentBusinessId
        },
        { status: 400 }
      )
    }

    // Perform the reassignment in a transaction
    await prisma.$transaction([
      // Remove number from source business
      prisma.businessCustomer.update({
        where: { id: fromBusinessId },
        data: {
          assignedPhoneNumber: null,
          ezTextingNumberId: null,
        },
      }),

      // Assign number to destination business
      prisma.businessCustomer.update({
        where: { id: toBusinessId },
        data: {
          assignedPhoneNumber: phoneNumber,
          ezTextingNumberId: inventoryNumber.ezTextingNumberId,
        },
      }),

      // Update phone number inventory
      prisma.phoneNumberInventory.update({
        where: { id: inventoryNumber.id },
        data: {
          previousBusinessId: fromBusinessId,
          currentBusinessId: toBusinessId,
          assignedAt: new Date(),
        },
      }),
    ])

    console.log('[Phone Reassignment] Success:', {
      phoneNumber,
      from: fromBusiness.businessName,
      to: toBusiness.businessName,
    })

    // Get updated records
    const updatedFromBusiness = await prisma.businessCustomer.findUnique({
      where: { id: fromBusinessId },
      select: { id: true, businessName: true, assignedPhoneNumber: true },
    })

    const updatedToBusiness = await prisma.businessCustomer.findUnique({
      where: { id: toBusinessId },
      select: { id: true, businessName: true, assignedPhoneNumber: true },
    })

    const updatedInventory = await prisma.phoneNumberInventory.findUnique({
      where: { id: inventoryNumber.id },
    })

    return NextResponse.json({
      success: true,
      message: `Phone number ${phoneNumber} reassigned from "${fromBusiness.businessName}" to "${toBusiness.businessName}"`,
      fromBusiness: updatedFromBusiness,
      toBusiness: updatedToBusiness,
      phoneNumberInventory: updatedInventory,
    })
  } catch (error: any) {
    console.error('[Phone Reassignment] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
