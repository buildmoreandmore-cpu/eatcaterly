import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendSMS } from '@/lib/sms'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const { paymentMethod } = await request.json()

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phoneNumber: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.status === 'PAID' || order.status === 'CONFIRMED') {
      return NextResponse.json(
        { success: false, error: 'Order has already been paid' },
        { status: 409 }
      )
    }

    // For demo purposes, we'll simulate payment processing
    // In production, integrate with Stripe, Square, or other payment processor

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update order status to PAID
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentId: `demo_payment_${Date.now()}`,
        updatedAt: new Date()
      }
    })

    // Update customer stats
    await prisma.customer.update({
      where: { id: order.customerId },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: order.totalAmount },
        lastOrderAt: new Date(),
        // Update category based on order count
        category: order.customer.name ? 'Regular' : 'Frequent'
      }
    })

    // Send confirmation SMS to customer
    try {
      const confirmationMessage = `✅ Payment confirmed! Your order #${order.id.slice(-6)} has been received.\n\n` +
        `Total: $${(order.totalAmount / 100).toFixed(2)}\n\n` +
        `We'll send you an SMS when your order is ready. Thank you!`

      await sendSMS(order.customer.phoneNumber, confirmationMessage, order.customer.id)
    } catch (smsError) {
      console.error('Failed to send confirmation SMS:', smsError)
      // Don't fail the payment if SMS fails
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Payment processed successfully'
    })

  } catch (error: any) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { success: false, error: 'Payment processing failed' },
      { status: 500 }
    )
  }
}