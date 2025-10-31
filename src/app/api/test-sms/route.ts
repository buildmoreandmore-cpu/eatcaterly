import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth-utils.server'
import { sendSMS } from '@/lib/ez-texting'
import { prisma } from '@/lib/db'

/**
 * Test SMS sending with detailed logging
 * Admin only - for debugging
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

    const { businessId, testPhoneNumber } = await request.json()

    if (!businessId || !testPhoneNumber) {
      return NextResponse.json(
        { success: false, error: 'businessId and testPhoneNumber required' },
        { status: 400 }
      )
    }

    // Get business
    const business = await prisma.businessCustomer.findUnique({
      where: { id: businessId },
      select: {
        businessName: true,
        assignedPhoneNumber: true,
        ezTextingNumberId: true
      }
    })

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }

    console.log('[TestSMS] Business:', {
      name: business.businessName,
      phone: business.assignedPhoneNumber,
      phoneId: business.ezTextingNumberId
    })

    if (!business.ezTextingNumberId) {
      return NextResponse.json({
        success: false,
        error: 'Business does not have ezTextingNumberId configured',
        business: {
          name: business.businessName,
          phone: business.assignedPhoneNumber,
          phoneId: null
        }
      })
    }

    // Attempt to send test SMS
    console.log('[TestSMS] Attempting to send SMS...')
    const result = await sendSMS({
      to: testPhoneNumber,
      from: business.assignedPhoneNumber!,
      message: `Test SMS from ${business.businessName}. This is a test message to verify PhoneID configuration.`,
      phoneId: business.ezTextingNumberId
    })

    console.log('[TestSMS] Result:', result)

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'SMS sent successfully!' : 'SMS failed to send',
      result,
      business: {
        name: business.businessName,
        phone: business.assignedPhoneNumber,
        phoneId: business.ezTextingNumberId
      }
    })

  } catch (error: any) {
    console.error('[TestSMS] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Test failed' },
      { status: 500 }
    )
  }
}

/**
 * Get test info
 */
export async function GET() {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businesses = await prisma.businessCustomer.findMany({
      select: {
        id: true,
        businessName: true,
        assignedPhoneNumber: true,
        ezTextingNumberId: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Use POST with businessId and testPhoneNumber to send test SMS',
      businesses: businesses.map(b => ({
        id: b.id,
        name: b.businessName,
        phone: b.assignedPhoneNumber,
        phoneId: b.ezTextingNumberId,
        ready: !!(b.assignedPhoneNumber && b.ezTextingNumberId)
      }))
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
