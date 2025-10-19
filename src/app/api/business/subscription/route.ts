import { NextRequest, NextResponse } from 'next/server'
import { getSubscriptionDetails } from '@/lib/business-account'

export async function GET(req: NextRequest) {
  try {
    // Get businessId from query params
    const searchParams = req.nextUrl.searchParams
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId is required' },
        { status: 400 }
      )
    }

    const result = await getSubscriptionDetails(businessId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
