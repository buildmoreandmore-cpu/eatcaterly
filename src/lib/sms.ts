import twilio from 'twilio'
import { prisma } from './db'
import { isDemoMode, demoSMSResult } from './demo-mode'

function getTwilioClient() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null
  }
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
}

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
    const twilioClient = getTwilioClient()
    if (isDemoMode() || !twilioClient) {
      console.log('Demo mode: SMS would be sent to', to, 'with message:', message)

      // Log demo SMS to database
      await prisma.smsLog.create({
        data: {
          customerId,
          direction: 'OUTBOUND',
          message,
          status: 'SENT',
          twilioSid: demoSMSResult.sid,
        },
      })

      return demoSMSResult
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    })

    // Log SMS to database
    await prisma.smsLog.create({
      data: {
        customerId,
        direction: 'OUTBOUND',
        message,
        status: 'SENT',
        twilioSid: result.sid,
      },
    })

    return {
      sid: result.sid,
      status: result.status,
    }
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
): Promise<string> {
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
        isActive: true,
      },
    })

    return `Welcome to SMS Food Delivery! 🍽️\\n\\nReply with your name to get started, or wait for our daily menu updates.\\n\\nReply STOP to unsubscribe.`
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

  // Handle name update
  if (!customer.name && !lowerMessage.includes('item') && !lowerMessage.includes('order')) {
    await prisma.customer.update({
      where: { id: customer.id },
      data: { name: message.trim() },
    })
    return `Thanks ${message.trim()}! We'll send you our daily menu. Reply with item numbers to order (e.g., "Item 1 and Item 2").`
  }

  // Handle order requests
  if (lowerMessage.includes('item') || lowerMessage.includes('order')) {
    return await processOrder(customer.id, message)
  }

  // Handle help requests
  if (lowerMessage.includes('help') || lowerMessage.includes('menu')) {
    return await sendTodaysMenu()
  }

  // Default response
  return `Hi ${customer.name || 'there'}! 👋\\n\\nReply "MENU" for today's options or "HELP" for assistance.\\n\\nTo order, reply with item numbers (e.g., "Item 1").`
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
      console.error('Database connection failed while fetching menu')
      throw new Error('Database connection failed - please check your configuration')
    }

    if (!menu || menu.menuItems.length === 0) {
      throw new Error('No active menu found for today')
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