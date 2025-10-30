import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth-utils.server'
import { fetchPhoneNumbers } from '@/lib/ez-texting'
import { prisma } from '@/lib/db'

/**
 * Sync phone numbers from EZTexting account to PhoneNumberInventory
 * This fetches all phone numbers and their PhoneIDs from EZTexting
 */
export async function POST() {
  try {
    // Check admin authentication
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Sync] Fetching phone numbers from EZTexting...')

    // Fetch phone numbers from EZTexting
    const result = await fetchPhoneNumbers()

    if (!result.success || !result.phones) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch phone numbers' },
        { status: 500 }
      )
    }

    console.log('[Sync] Found', result.phones.length, 'phone numbers')

    // Update or create phone numbers in inventory
    const updates = await Promise.all(
      result.phones.map(async (phone) => {
        // Format phone number to E.164 format
        let formattedNumber = phone.Number.replace(/\D/g, '')
        if (formattedNumber.length === 10) {
          formattedNumber = `+1${formattedNumber}`
        } else if (formattedNumber.length === 11 && formattedNumber.startsWith('1')) {
          formattedNumber = `+${formattedNumber}`
        }

        // Extract area code
        const areaCode = formattedNumber.slice(-10, -7)

        try {
          // Upsert phone number
          const updated = await prisma.phoneNumberInventory.upsert({
            where: { ezTextingNumberId: phone.PhoneID },
            create: {
              phoneNumber: formattedNumber,
              ezTextingNumberId: phone.PhoneID,
              areaCode: areaCode,
              status: 'AVAILABLE',
              source: 'eztexting',
              notes: `Type: ${phone.Type}`
            },
            update: {
              phoneNumber: formattedNumber,
              notes: `Type: ${phone.Type}`
            }
          })

          console.log('[Sync] Updated/created:', formattedNumber, 'PhoneID:', phone.PhoneID)

          return {
            phoneNumber: formattedNumber,
            phoneId: phone.PhoneID,
            success: true
          }
        } catch (error: any) {
          console.error('[Sync] Failed to update phone:', phone.Number, error)
          return {
            phoneNumber: formattedNumber,
            phoneId: phone.PhoneID,
            success: false,
            error: error.message
          }
        }
      })
    )

    const successful = updates.filter(u => u.success).length
    const failed = updates.filter(u => !u.success).length

    return NextResponse.json({
      success: true,
      message: `Synced ${successful} phone numbers${failed > 0 ? `, ${failed} failed` : ''}`,
      phones: updates
    })

  } catch (error: any) {
    console.error('[Sync] Error syncing phone numbers:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync phone numbers' },
      { status: 500 }
    )
  }
}

/**
 * Get current phone number inventory status
 */
export async function GET() {
  try {
    // Check admin authentication
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const phones = await prisma.phoneNumberInventory.findMany({
      orderBy: { phoneNumber: 'asc' }
    })

    return NextResponse.json({
      success: true,
      phones
    })

  } catch (error: any) {
    console.error('[Sync] Error fetching phone inventory:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch phone inventory' },
      { status: 500 }
    )
  }
}
