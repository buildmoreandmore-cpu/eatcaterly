import { NextRequest, NextResponse } from 'next/server'
import { createPaymentLink } from '@/lib/stripe'
import { sendSMS } from '@/lib/sms'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params

    // Create payment link
    const paymentResult = await createPaymentLink(orderId)

    // Get order with customer info to send SMS
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
      },
    })

    if (order && order.customer) {
      // Send payment link via SMS
      const smsMessage = `💳 Payment Link Ready!\\n\\nYour order total: $${(order.totalAmount / 100).toFixed(2)}\\n\\nPay here: ${paymentResult.url}\\n\\nOrder #${order.id.slice(-6)}`

      try {
        await sendSMS(order.customer.phoneNumber, smsMessage, order.customer.id)
      } catch (smsError) {
        console.error('Failed to send payment SMS:', smsError)
        // Don't fail the request if SMS fails
      }
    }

    return NextResponse.json({
      success: true,
      data: paymentResult,
      message: 'Payment link created and sent via SMS',
    })
  } catch (error: any) {
    console.error('Payment link creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create payment link'
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        paymentId: true,
        paymentUrl: true,
        status: true,
        totalAmount: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error: any) {
    console.error('Order retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve order' },
      { status: 500 }
    )
  }
}