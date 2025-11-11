import { NextRequest, NextResponse } from 'next/server'
import { processSMSResponse, sendSMS } from '@/lib/sms'
import twilio from 'twilio'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let from: string = ''
    let body: string = ''
    let messageId: string = ''

    // Handle Twilio webhook format (application/x-www-form-urlencoded)
    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Twilio sends form data
      const formData = await request.formData()

      // Twilio webhook parameters
      from = formData.get('From') as string
      body = formData.get('Body') as string
      messageId = formData.get('MessageSid') as string
      const to = formData.get('To') as string

      console.log('Received Twilio SMS:', { from, to, body, messageId })

      // Optional: Validate Twilio signature for security
      // const signature = request.headers.get('x-twilio-signature')
      // const url = request.url
      // const authToken = process.env.TWILIO_AUTH_TOKEN
      // if (authToken && signature) {
      //   const params = Object.fromEntries(formData)
      //   const isValid = twilio.validateRequest(authToken, signature, url, params)
      //   if (!isValid) {
      //     console.error('Invalid Twilio signature')
      //     return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
      //   }
      // }
    } else if (contentType.includes('application/json')) {
      // Handle JSON format for testing
      const jsonData = await request.json()
      from = jsonData.From || jsonData.from
      body = jsonData.Body || jsonData.body
      messageId = jsonData.MessageSid || jsonData.messageSid

      console.log('Received JSON SMS (testing):', { from, body, messageId })
    } else {
      const text = await request.text()
      console.log('Unknown webhook format:', text)
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
    }

    // Ensure phone number has proper format
    if (from && !from.startsWith('+')) {
      from = '+1' + from.replace(/\D/g, '')
    }

    console.log('Processed SMS data:', { from, body, messageId })

    if (!from || !body) {
      return NextResponse.json({ error: 'Missing required fields (from, body)' }, { status: 400 })
    }

    // Process the SMS and get response
    const responseMessage = await processSMSResponse(from, body)

    // Send response back via Twilio (only if we have a response)
    if (responseMessage) {
      try {
        await sendSMS(from, responseMessage)
      } catch (error) {
        console.error('Failed to send SMS response:', error)
        // Don't fail the webhook if we can't send response
      }
    }

    // Return TwiML response (Twilio's preferred format)
    // You can also return JSON, but TwiML is more standard
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' }
      }
    )
  } catch (error) {
    console.error('SMS webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ message: 'SMS webhook endpoint is working' })
}