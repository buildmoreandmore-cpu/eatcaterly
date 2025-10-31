import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth-utils.server'
import { prisma } from '@/lib/db'

/**
 * Get recent SMS logs for debugging
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get recent SMS logs with customer and business info
    const logs = await prisma.smsLog.findMany({
      take: 50,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            business: {
              select: {
                id: true,
                businessName: true,
                assignedPhoneNumber: true,
                ezTextingNumberId: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      logs: logs.map(log => ({
        id: log.id,
        createdAt: log.createdAt,
        direction: log.direction,
        status: log.status,
        errorCode: log.errorCode,
        message: log.message?.substring(0, 100) + (log.message && log.message.length > 100 ? '...' : ''),
        customer: log.customer ? {
          name: log.customer.name,
          phoneNumber: log.customer.phoneNumber,
          business: log.customer.business ? {
            name: log.customer.business.businessName,
            assignedPhoneNumber: log.customer.business.assignedPhoneNumber,
            ezTextingNumberId: log.customer.business.ezTextingNumberId
          } : null
        } : null
      }))
    })
  } catch (error: any) {
    console.error('[SMS Logs] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
