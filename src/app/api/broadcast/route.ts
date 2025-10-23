import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { sendSMS } from '@/lib/ez-texting'
import { getCurrentUserEmail } from '@/lib/auth-utils.server'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user email to find their business
    const userEmail = await getCurrentUserEmail()
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'User email not found' },
        { status: 401 }
      )
    }

    // Get business customer
    const businessCustomer = await prisma.businessCustomer.findUnique({
      where: { contactEmail: userEmail }
    })

    if (!businessCustomer) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }

    // Check if business has phone number
    if (!businessCustomer.assignedPhoneNumber) {
      return NextResponse.json(
        { success: false, error: 'No phone number assigned to your business. Please contact support.' },
        { status: 400 }
      )
    }

    const { menuId, customerIds, customMessage } = await request.json()

    // Validate inputs
    if (!menuId || !customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Menu ID and customer IDs are required' },
        { status: 400 }
      )
    }

    if (!customMessage || !customMessage.trim()) {
      return NextResponse.json(
        { success: false, error: 'Custom message is required' },
        { status: 400 }
      )
    }

    // Get menu with items
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        menuItems: true
      }
    })

    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Menu not found' },
        { status: 404 }
      )
    }

    // Get customers (verify they belong to this business)
    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
        businessId: businessCustomer.id,
        isActive: true
      }
    })

    if (customers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid customers found' },
        { status: 404 }
      )
    }

    // Format menu message with custom message
    let message = customMessage.trim() + '\n\n'

    // Add menu title
    const menuTitle = menu.title || `Menu for ${new Date(menu.date).toLocaleDateString()}`
    message += `🍽️ ${menuTitle}\n\n`

    // Group items by category
    const categories = new Map<string, typeof menu.menuItems>()
    menu.menuItems.forEach(item => {
      const category = item.category || 'Other'
      if (!categories.has(category)) {
        categories.set(category, [])
      }
      categories.get(category)!.push(item)
    })

    // Format menu items
    const categoryOrder = ['appetizer', 'main', 'side', 'dessert', 'drink', 'other']
    const sortedCategories = Array.from(categories.keys()).sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.toLowerCase())
      const indexB = categoryOrder.indexOf(b.toLowerCase())
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
    })

    sortedCategories.forEach(category => {
      const items = categories.get(category)!
      message += `${category.toUpperCase()}\n`
      items.forEach(item => {
        message += `• ${item.name} - $${(item.price / 100).toFixed(2)}\n`
        if (item.description) {
          message += `  ${item.description}\n`
        }
      })
      message += `\n`
    })

    console.log('[Broadcast] Sending to', customers.length, 'customers')
    console.log('[Broadcast] Message preview:', message.substring(0, 100) + '...')

    // Send SMS to each customer
    const results = await Promise.allSettled(
      customers.map(async (customer) => {
        try {
          // Send SMS via EZTexting
          const smsResult = await sendSMS({
            to: customer.phoneNumber,
            from: businessCustomer.assignedPhoneNumber!,
            message: message
          })

          // Log the SMS
          await prisma.smsLog.create({
            data: {
              customerId: customer.id,
              direction: 'OUTBOUND',
              message: message,
              status: smsResult.success ? 'SENT' : 'FAILED',
              errorCode: smsResult.error || null
            }
          })

          return {
            customerId: customer.id,
            phoneNumber: customer.phoneNumber,
            success: smsResult.success,
            error: smsResult.error
          }
        } catch (error: any) {
          console.error(`[Broadcast] Failed to send to ${customer.phoneNumber}:`, error)

          // Log failed SMS
          await prisma.smsLog.create({
            data: {
              customerId: customer.id,
              direction: 'OUTBOUND',
              message: message,
              status: 'FAILED',
              errorCode: error?.message || 'Unknown error'
            }
          })

          return {
            customerId: customer.id,
            phoneNumber: customer.phoneNumber,
            success: false,
            error: error?.message || 'Failed to send SMS'
          }
        }
      })
    )

    // Count successes and failures
    const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - sent

    console.log('[Broadcast] Results:', { sent, failed, total: results.length })

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: results.length,
      message: `Successfully sent menu to ${sent} customer${sent !== 1 ? 's' : ''}${failed > 0 ? `. ${failed} failed.` : ''}`
    })

  } catch (error: any) {
    console.error('[Broadcast] CRITICAL ERROR:', {
      message: error.message,
      stack: error.stack,
      fullError: error
    })

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to send broadcast. Please try again or contact support.'
      },
      { status: 500 }
    )
  }
}
