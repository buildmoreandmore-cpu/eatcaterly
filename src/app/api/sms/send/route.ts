import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message, customerId } = await request.json()

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // Send SMS using the existing sendSMS function
    const result = await sendSMS(phoneNumber, message, customerId)

    return NextResponse.json({
      success: true,
      data: result,
      message: 'SMS sent successfully'
    })
  } catch (error: any) {
    console.error('SMS send error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send SMS'
      },
      { status: 500 }
    )
  }
}