import { NextRequest, NextResponse } from 'next/server'
import { processSMSResponse, sendSMS } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let from: string = ''
    let body: string = ''
    let messageId: string = ''

    // Handle EZ Texting webhook format
    if (contentType.includes('application/json')) {
      // EZ Texting format (JSON)
      const jsonData = await request.json()
      from = jsonData.PhoneNumber || jsonData.From || jsonData.phone
      body = jsonData.Message || jsonData.Body || jsonData.message
      messageId = jsonData.MessageID || jsonData.MessageId || jsonData.id

      // Ensure phone number has proper format
      if (from && !from.startsWith('+')) {
        from = '+1' + from.replace(/\D/g, '') // Add +1 and remove non-digits
      }

      console.log('Received EZ Texting SMS:', { from, body, messageId })
    } else {
      // Try to parse as form data for backwards compatibility
      try {
        const formData = await request.formData()
        from = formData.get('PhoneNumber') as string || formData.get('From') as string
        body = formData.get('Message') as string || formData.get('Body') as string
        messageId = formData.get('MessageID') as string || formData.get('MessageSid') as string

        // Ensure phone number has proper format
        if (from && !from.startsWith('+')) {
          from = '+1' + from.replace(/\D/g, '')
        }

        console.log('Received form data SMS:', { from, body, messageId })
      } catch {
        const text = await request.text()
        console.log('Unknown webhook format:', text)
        return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
      }
    }

    console.log('Processed SMS data:', { from, body, messageId })

    if (!from || !body) {
      return NextResponse.json({ error: 'Missing required fields (from, body)' }, { status: 400 })
    }

    // Process the SMS and get response
    const responseMessage = await processSMSResponse(from, body)

    // Send response back via EZ Texting (only if we have a response)
    if (responseMessage) {
      try {
        await sendSMS(from, responseMessage)
      } catch (error) {
        console.error('Failed to send SMS response:', error)
        // Don't fail the webhook if we can't send response
      }
    }

    // Return JSON response for EZ Texting
    return NextResponse.json({
      success: true,
      message: 'SMS processed successfully',
      response: responseMessage
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