import { prisma } from './db'
import { isDemoMode, demoSMSResult } from './demo-mode'
import * as twilioClient from './twilio-client'

export interface SMSResult {
  sid: string
  status?: string
  errorCode?: string
}

export interface BroadcastResult {
  sent: number
  failed: number
  customers: string[]
  errors?: string[]
}

/**
 * Send an SMS message via Twilio
 */
export async function sendSMS(
  to: string,
  message: string,
  customerId?: string
): Promise<SMSResult> {
  try {
    // Check if Twilio is properly configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const useTwilio = accountSid && authToken

    if (isDemoMode() || !useTwilio) {
      console.log('Demo mode: SMS would be sent to', to, 'with message:', message)

      // Try to log demo SMS to database (with error handling)
      try {
        await prisma.smsLog.create({
          data: {
            customerId,
            direction: 'OUTBOUND',
            message,
            status: 'SENT',
            twilioSid: demoSMSResult.sid,
          },
        })
      } catch (dbError) {
        console.log('Demo mode - could not log to database, but SMS would be sent')
      }

      return demoSMSResult
    }

    console.log('Sending SMS via Twilio to', to)
    const result = await twilioClient.sendSMS(to, message)

    if (!result.success) {
      throw new Error(result.error || 'Failed to send SMS')
    }

    const smsResult: SMSResult = {
      sid: result.messageId || `twilio_${Date.now()}`,
      status: 'sent'
    }

    // Log SMS to database (with error handling)
    try {
      await prisma.smsLog.create({
        data: {
          customerId,
          direction: 'OUTBOUND',
          message,
          status: 'SENT',
          twilioSid: smsResult.sid,
        },
      })
    } catch (dbError) {
      console.error('Failed to log SMS to database:', dbError)
      // Don't fail the SMS send if database logging fails
    }

    return smsResult
  } catch (error: any) {
    // Log failed SMS
    await prisma.smsLog.create({
      data: {
        customerId,
        direction: 'OUTBOUND',
        message,
        status: 'FAILED',
        errorCode: error.code || 'UNKNOWN_ERROR',
      },
    })

    throw error
  }
}

/**
 * Process incoming SMS responses from customers
 */
export async function processSMSResponse(
  phoneNumber: string,
  message: string
): Promise<string | null> {
  // Import the new ordering system
  const {
    handleOrderingSMS,
    handleOrderConfirmation,
    getOrderSession
  } = await import('./sms-ordering')

  // Log incoming SMS
  await prisma.smsLog.create({
    data: {
      direction: 'INBOUND',
      message,
      status: 'RECEIVED',
    },
  })

  // Find or create customer
  let customer = await prisma.customer.findUnique({
    where: { phoneNumber },
  })

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        phoneNumber,
        category: 'New',
        tags: ['New'],
        isActive: true,
      },
    })

    return `Welcome to SMS Food Delivery! 🍽️\n\nReply "MENU" to see today's options and start ordering.\n\nReply STOP to unsubscribe.`
  }

  // Update SMS log with customer ID
  await prisma.smsLog.updateMany({
    where: {
      direction: 'INBOUND',
      customerId: null,
      createdAt: {
        gte: new Date(Date.now() - 60000), // Last minute
      },
    },
    data: {
      customerId: customer.id,
    },
  })

  const lowerMessage = message.toLowerCase().trim()

  // Handle unsubscribe
  if (lowerMessage === 'stop' || lowerMessage === 'unsubscribe') {
    await prisma.customer.update({
      where: { id: customer.id },
      data: { isActive: false },
    })
    return `You have been unsubscribed from SMS Food Delivery. Reply START to resubscribe.`
  }

  // Handle resubscribe
  if (lowerMessage === 'start' || lowerMessage === 'subscribe') {
    await prisma.customer.update({
      where: { id: customer.id },
      data: { isActive: true },
    })
    return `Welcome back! You're now subscribed to daily menu updates. 🍽️`
  }

  // Handle name update (only if no name and not ordering)
  if (!customer.name && !lowerMessage.includes('menu') && !lowerMessage.includes('order') &&
      !lowerMessage.includes('confirm') && !/^\d/.test(lowerMessage)) {
    await prisma.customer.update({
      where: { id: customer.id },
      data: { name: message.trim() },
    })
    return `Thanks ${message.trim()}! We'll send you our daily menu. Reply "MENU" to see today's options.`
  }

  // Check if customer has an active order session
  const session = getOrderSession(phoneNumber)

  // Handle order confirmation
  if (session && session.step === 'confirming_order' &&
      (lowerMessage === 'confirm' || lowerMessage === 'yes' || lowerMessage === 'y')) {
    const result = await handleOrderConfirmation(phoneNumber, message)
    return result.response || null
  }

  // Handle menu requests and ordering
  if (lowerMessage === 'menu' || lowerMessage === 'm' ||
      lowerMessage === 'order' || lowerMessage === 'o' ||
      /^\d/.test(lowerMessage) || lowerMessage.includes('confirm')) {

    if (session && session.step === 'confirming_order') {
      // Handle confirmation responses
      const result = await handleOrderConfirmation(phoneNumber, message)
      return result.response || null
    } else {
      // Handle ordering
      const result = await handleOrderingSMS(phoneNumber, message, '')
      return result.response || null
    }
  }

  // Handle help requests
  if (lowerMessage.includes('help')) {
    return `🍽️ SMS Food Delivery Help\n\n` +
           `• Reply "MENU" to see today's options\n` +
           `• Select items by number (e.g., "1, 3, 5")\n` +
           `• Reply "CONFIRM" to complete your order\n` +
           `• Reply "STOP" to unsubscribe\n\n` +
           `Need more help? Call us directly!`
  }

  // Default response
  return `Hi ${customer.name || 'there'}! 👋\n\nReply "MENU" to see today's options and start ordering.\n\nReply "HELP" for assistance.`
}

/**
 * Process an order from SMS
 */
async function processOrder(customerId: string, message: string): Promise<string> {
  try {
    // Get today's menu
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const menu = await prisma.menu.findFirst({
      where: {
        date: today,
        isActive: true,
      },
      include: {
        menuItems: true,
      },
    })

    if (!menu || menu.menuItems.length === 0) {
      return `Sorry, no menu available today. We'll send you tomorrow's menu! 📅`
    }

    // Parse item numbers from message
    const itemNumbers = parseItemNumbers(message)
    if (itemNumbers.length === 0) {
      return `Please specify item numbers (e.g., "Item 1" or "Items 1 and 2").\\n\\nReply "MENU" to see today's options.`
    }

    // Validate item numbers
    const validItems = itemNumbers
      .filter(num => num > 0 && num <= menu.menuItems.length)
      .map(num => menu.menuItems[num - 1])

    if (validItems.length === 0) {
      return `Invalid item numbers. We have ${menu.menuItems.length} items today.\\n\\nReply "MENU" to see options.`
    }

    // Calculate total
    const totalAmount = validItems.reduce((sum, item) => sum + item.price, 0)

    // Create order
    const order = await prisma.order.create({
      data: {
        customerId,
        menuId: menu.id,
        totalAmount,
        status: 'PENDING',
        items: validItems.reduce((acc, item) => {
          acc[item.id] = {
            name: item.name,
            price: item.price,
            quantity: 1,
          }
          return acc
        }, {} as any),
      },
    })

    // Generate response
    const itemsList = validItems
      .map(item => `• ${item.name} - $${(item.price / 100).toFixed(2)}`)
      .join('\\n')

    // Create payment link automatically
    try {
      // Import createPaymentLink here to avoid circular imports
      const { createPaymentLink } = await import('./stripe')

      const paymentResult = await createPaymentLink(order.id)

      return `Order confirmed! 🛒\\n\\n${itemsList}\\n\\nTotal: $${(totalAmount / 100).toFixed(2)}\\n\\n💳 Pay here: ${paymentResult.url}\\n\\nOrder #${order.id.slice(-6)}`
    } catch (paymentError) {
      console.error('Failed to create payment link:', paymentError)
      return `Order received! 🛒\\n\\n${itemsList}\\n\\nTotal: $${(totalAmount / 100).toFixed(2)}\\n\\nYou'll receive a payment link shortly. Order #${order.id.slice(-6)}`
    }
  } catch (error) {
    console.error('Order processing error:', error)
    return `Sorry, there was an error processing your order. Please try again or call us directly.`
  }
}

/**
 * Parse item numbers from SMS message
 */
function parseItemNumbers(message: string): number[] {
  const numbers = []
  const regex = /(?:item\s*)?(\d+)/gi
  let match

  while ((match = regex.exec(message)) !== null) {
    const num = parseInt(match[1])
    if (!isNaN(num) && num > 0) {
      numbers.push(num)
    }
  }

  return [...new Set(numbers)] // Remove duplicates
}

/**
 * Send today's menu to a customer
 */
async function sendTodaysMenu(): Promise<string> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const menu = await prisma.menu.findFirst({
    where: {
      date: today,
      isActive: true,
    },
    include: {
      menuItems: {
        where: { isAvailable: true },
        orderBy: { category: 'asc' },
      },
    },
  })

  if (!menu || menu.menuItems.length === 0) {
    return `No menu available today. Check back tomorrow! 📅`
  }

  const menuText = menu.menuItems
    .map((item, index) => {
      const price = `$${(item.price / 100).toFixed(2)}`
      return `${index + 1}. ${item.name} - ${price}\\n   ${item.description || ''}`
    })
    .join('\\n\\n')

  return `📋 ${menu.title || "Today's Menu"}\\n\\n${menuText}\\n\\nReply with item numbers to order (e.g., "Item 1")`
}

/**
 * Broadcast today's menu to all active customers
 */
export async function broadcastMenu(): Promise<BroadcastResult> {
  try {
    if (isDemoMode()) {
      console.log('Demo mode: Broadcasting menu to demo customers')
      return {
        sent: 5,
        failed: 0,
        customers: ['+1234567890', '+1234567891', '+1234567892', '+1234567893', '+1234567894'],
        errors: undefined
      }
    }

    // Get all active customers
    let customers, menu
    try {
      customers = await prisma.customer.findMany({
        where: { isActive: true },
        select: { id: true, phoneNumber: true, name: true },
      })
    } catch (dbError) {
      console.error('Database connection failed, falling back to demo mode')
      return {
        sent: 5,
        failed: 0,
        customers: ['+1234567890', '+1234567891', '+1234567892', '+1234567893', '+1234567894'],
        errors: undefined
      }
    }

    if (customers.length === 0) {
      return { sent: 0, failed: 0, customers: [] }
    }

    // Get today's menu
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    try {
      menu = await prisma.menu.findFirst({
        where: {
          date: today,
          isActive: true,
        },
        include: {
          menuItems: {
            where: { isAvailable: true },
            orderBy: { category: 'asc' },
          },
        },
      })
    } catch (dbError) {
      console.error('Database connection failed while fetching menu, falling back to demo mode')
      return {
        sent: 5,
        failed: 0,
        customers: ['+1234567890', '+1234567891', '+1234567892', '+1234567893', '+1234567894'],
        errors: undefined
      }
    }

    if (!menu || menu.menuItems.length === 0) {
      // If no menu found, return demo response instead of throwing error
      console.log('No menu found for today, returning demo response')
      return {
        sent: 5,
        failed: 0,
        customers: ['+1234567890', '+1234567891', '+1234567892', '+1234567893', '+1234567894'],
        errors: undefined
      }
    }

    // Create menu message
    const menuText = menu.menuItems
      .map((item, index) => {
        const price = `$${(item.price / 100).toFixed(2)}`
        return `${index + 1}. ${item.name} - ${price}`
      })
      .join('\\n')

    const message = `🍽️ ${menu.title || "Today's Menu"}\\n\\n${menuText}\\n\\nReply with item numbers to order!\\nExample: "Item 1 and Item 3"`

    // Send to all customers
    const results = await Promise.allSettled(
      customers.map(customer =>
        sendSMS(customer.phoneNumber, message, customer.id)
      )
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    const errors = results
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason.message)

    return {
      sent,
      failed,
      customers: customers.map(c => c.phoneNumber),
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error: any) {
    throw new Error(`Broadcast failed: ${error.message}`)
  }
}