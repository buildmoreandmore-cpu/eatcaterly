import { NextRequest, NextResponse } from 'next/server'
import { processSMSResponse, sendSMS } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const from = formData.get('From') as string
    const body = formData.get('Body') as string
    const messageSid = formData.get('MessageSid') as string

    console.log('Received SMS:', { from, body, messageSid })

    if (!from || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Process the SMS and get response
    const responseMessage = await processSMSResponse(from, body)

    // Send response back via Twilio
    if (responseMessage) {
      try {
        await sendSMS(from, responseMessage)
      } catch (error) {
        console.error('Failed to send SMS response:', error)
        // Don't fail the webhook if we can't send response
      }
    }

    // Return TwiML response (optional, for immediate response)
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${responseMessage}</Message>
</Response>`

    return new NextResponse(twimlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('SMS webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ message: 'SMS webhook endpoint is working' })
}