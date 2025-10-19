import { NextResponse } from 'next/server'
import { syncWithEZTexting } from '@/lib/phone-inventory'

/**
 * POST /api/admin/phone-numbers/sync
 * Sync phone numbers from EZTexting to local inventory
 */
export async function POST() {
  try {
    const result = await syncWithEZTexting()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to sync with EZTexting',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully synced with EZTexting',
      added: result.added,
      updated: result.updated,
      total: result.added + result.updated,
    })
  } catch (error: any) {
    console.error('Error syncing with EZTexting:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync with EZTexting',
      },
      { status: 500 }
    )
  }
}
