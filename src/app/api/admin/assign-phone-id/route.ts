import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth-utils.server'
import { prisma } from '@/lib/db'

/**
 * Assign EZTexting PhoneID to a business customer
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { businessId, phoneNumber } = await request.json()

    if (!businessId || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'businessId and phoneNumber are required' },
        { status: 400 }
      )
    }

    // Find the phone number in inventory
    const phoneRecord = await prisma.phoneNumberInventory.findUnique({
      where: { phoneNumber }
    })

    if (!phoneRecord) {
      return NextResponse.json(
        { success: false, error: 'Phone number not found in inventory' },
        { status: 404 }
      )
    }

    if (!phoneRecord.ezTextingNumberId) {
      return NextResponse.json(
        { success: false, error: 'Phone number does not have an EZTexting PhoneID' },
        { status: 400 }
      )
    }

    // Update business customer with PhoneID
    const updated = await prisma.businessCustomer.update({
      where: { id: businessId },
      data: {
        assignedPhoneNumber: phoneNumber,
        ezTextingNumberId: phoneRecord.ezTextingNumberId,
        numberProvisionedAt: new Date()
      }
    })

    // Update phone inventory status
    await prisma.phoneNumberInventory.update({
      where: { phoneNumber },
      data: {
        status: 'ASSIGNED',
        currentBusinessId: businessId,
        assignedAt: new Date()
      }
    })

    console.log('[Assign] Assigned PhoneID', phoneRecord.ezTextingNumberId, 'to business', businessId)

    return NextResponse.json({
      success: true,
      message: `Assigned ${phoneNumber} (PhoneID: ${phoneRecord.ezTextingNumberId}) to business`,
      business: {
        id: updated.id,
        businessName: updated.businessName,
        assignedPhoneNumber: updated.assignedPhoneNumber,
        ezTextingNumberId: updated.ezTextingNumberId
      }
    })

  } catch (error: any) {
    console.error('[Assign] Error assigning PhoneID:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to assign PhoneID' },
      { status: 500 }
    )
  }
}
