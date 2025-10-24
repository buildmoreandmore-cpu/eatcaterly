import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/ez-texting'

export async function POST(request: NextRequest) {
  try {
    const { to, from, message } = await request.json()

    console.log('[Debug SMS Test] Testing SMS send with:', { to, from, messageLength: message?.length })

    // Check environment variables
    console.log('[Debug SMS Test] Environment check:', {
      hasUsername: !!process.env.EZTEXTING_USERNAME,
      hasPassword: !!process.env.EZTEXTING_PASSWORD,
      apiUrl: process.env.EZ_TEXTING_API_URL || 'https://app.eztexting.com',
      usernamePreview: process.env.EZTEXTING_USERNAME?.substring(0, 4) + '***',
    })

    const result = await sendSMS({
      to: to || '+14705078812',
      from: from || '+14702562470',
      message: message || 'Test message from debug endpoint'
    })

    console.log('[Debug SMS Test] Result:', result)

    return NextResponse.json({
      success: true,
      smsResult: result,
      env: {
        hasUsername: !!process.env.EZTEXTING_USERNAME,
        hasPassword: !!process.env.EZTEXTING_PASSWORD,
        apiUrl: process.env.EZ_TEXTING_API_URL || 'https://app.eztexting.com',
      }
    })
  } catch (error: any) {
    console.error('[Debug SMS Test] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      env: {
        hasUsername: !!process.env.EZTEXTING_USERNAME,
        hasPassword: !!process.env.EZTEXTING_PASSWORD,
        apiUrl: process.env.EZ_TEXTING_API_URL || 'https://app.eztexting.com',
      }
    }, { status: 500 })
  }
}
