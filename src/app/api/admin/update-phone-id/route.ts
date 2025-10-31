import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth-utils.server'
import { prisma } from '@/lib/db'

/**
 * Manually update PhoneID for a phone number in inventory
 * Use this when automatic sync from EZTexting fails
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

    const { phoneNumber, ezTextingNumberId } = await request.json()

    if (!phoneNumber || !ezTextingNumberId) {
      return NextResponse.json(
        { success: false, error: 'phoneNumber and ezTextingNumberId are required' },
        { status: 400 }
      )
    }

    console.log('[UpdatePhoneID] Updating:', { phoneNumber, ezTextingNumberId })

    // Update or create the phone number in inventory
    const updated = await prisma.phoneNumberInventory.upsert({
      where: { phoneNumber },
      create: {
        phoneNumber,
        ezTextingNumberId,
        areaCode: phoneNumber.slice(-10, -7),
        status: 'AVAILABLE',
        source: 'eztexting'
      },
      update: {
        ezTextingNumberId
      }
    })

    console.log('[UpdatePhoneID] Success:', updated)

    return NextResponse.json({
      success: true,
      message: `PhoneID updated for ${phoneNumber}`,
      phone: updated
    })

  } catch (error: any) {
    console.error('[UpdatePhoneID] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update PhoneID' },
      { status: 500 }
    )
  }
}
