import { NextResponse } from 'next/server'
import { broadcastMenu } from '@/lib/sms'

export async function POST() {
  try {
    // TODO: Add authentication middleware to protect this endpoint
    const result = await broadcastMenu()

    return NextResponse.json({
      success: true,
      data: result,
      message: `Menu broadcasted to ${result.sent} customers`,
    })
  } catch (error: any) {
    console.error('Broadcast error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to broadcast menu'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SMS broadcast endpoint',
    usage: 'POST to broadcast today\'s menu to all active customers'
  })
}