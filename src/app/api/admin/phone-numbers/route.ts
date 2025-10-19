import { NextRequest, NextResponse } from 'next/server'
import { searchInventory, getInventoryStats } from '@/lib/phone-inventory'

/**
 * GET /api/admin/phone-numbers
 * List and search phone number inventory
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Check if requesting stats
    if (searchParams.get('stats') === 'true') {
      const stats = await getInventoryStats()
      return NextResponse.json({ success: true, stats })
    }

    // Otherwise, search inventory
    const areaCode = searchParams.get('areaCode') || undefined
    const status = searchParams.get('status') || undefined
    const previousBusinessId = searchParams.get('previousBusinessId') || undefined
    const search = searchParams.get('search') || undefined

    const numbers = await searchInventory({
      areaCode,
      status,
      previousBusinessId,
      search,
    })

    return NextResponse.json({
      success: true,
      numbers,
      count: numbers.length,
    })
  } catch (error: any) {
    console.error('Error fetching phone inventory:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch phone inventory',
      },
      { status: 500 }
    )
  }
}
