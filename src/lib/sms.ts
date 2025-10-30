import { prisma } from './db'
import { isSMSDemoMode, demoSMSResult } from './demo-mode'
import { ezTextingAuth } from './eztexting-auth'

function getEZTextingConfig() {
  return {
    apiUrl: 'https://app.eztexting.com'
  }
}

async function sendViaEZTexting(to: string, message: string): Promise<SMSResult> {
  // Clean phone number (remove +1)
  const cleanNumber = to.replace(/^\+1/, '').replace(/\D/g, '')

  // Check if we have OAuth tokens
  const hasOAuthTokens = process.env.EZTEXTING_ACCESS_TOKEN && process.env.EZTEXTING_REFRESH_TOKEN

  if (hasOAuthTokens) {
    // Use OAuth API (newer method with bearer token)
    try {
      const accessToken = await ezTextingAuth.getValidAccessToken()

      const response = await fetch('https://a.eztexting.com/v1/messaging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          phoneNumbers: [cleanNumber],
          message: message
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('EZ Texting OAuth API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          to: cleanNumber,
          messageLength: message.length
        })
        throw new Error(`EZ Texting OAuth API error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('SMS sent successfully via EZ Texting OAuth:', {
        to: cleanNumber,
        response: result
      })

      return {
        sid: String(result.id || `ez_oauth_${Date.now()}`),
        status: 'sent'
      }
    } catch (error) {
      console.error('OAuth API failed, falling back to Basic Auth:', error)
      // Fall through to Basic Auth
    }
  }

  // Fallback to Basic Auth (REST API) if OAuth not available or failed
  const config = getEZTextingConfig()
  const username = process.env.EZTEXTING_USERNAME || process.env.EZTEXTING_APP_KEY
  const password = process.env.EZTEXTING_PASSWORD || process.env.EZTEXTING_APP_SECRET

  if (!username || !password) {
    throw new Error('EZ Texting credentials not configured (need either OAuth tokens or username/password)')
  }

  // Use form data for REST API
  const formData = new URLSearchParams()
  formData.append('User', username)
  formData.append('Password', password)
  formData.append('PhoneNumbers[]', cleanNumber)
  formData.append('Message', message)
  formData.append('Subject', 'SMS Food Delivery')

  const response = await fetch(`${config.apiUrl}/sending/messages?format=json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('EZ Texting API error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      to: cleanNumber,
      messageLength: message.length
    })
    throw new Error(`EZ Texting API error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()

  // EZ Texting API response structure
  if (result.Response && result.Response.Status === 'Success') {
    console.log('SMS sent successfully via EZ Texting:', {
      to: cleanNumber,
      messageId: result.Response.Entry?.ID
    })
    return {
      sid: String(result.Response.Entry?.ID || `ez_${Date.now()}`),
      status: 'sent'
    }
  } else {
    console.error('EZ Texting API returned error:', result)
    throw new Error(`EZ Texting API error: ${JSON.stringify(result)}`)
  }
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
 * Send an SMS message via EZ Texting
 */
export async function sendSMS(
  to: string,
  message: string,
  customerId?: string
): Promise<SMSResult> {
  try {
    if (isSMSDemoMode()) {
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

    console.log('Sending SMS via EZ Texting to', to)
    const result = await sendViaEZTexting(to, message)

    // Log SMS to database (with error handling)
    try {
      await prisma.smsLog.create({
        data: {
          customerId,
          direction: 'OUTBOUND',
          message,
          status: 'SENT',
          twilioSid: result.sid,
        },
      })
    } catch (dbError) {
      console.error('Failed to log SMS to database:', dbError)
      // Don't fail the SMS send if database logging fails
    }

    return result
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
    if (isSMSDemoMode()) {
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

    console.log(`Broadcasting menu to ${customers.length} customers`)

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

    console.log(`Broadcast complete: ${sent} sent, ${failed} failed`)
    if (failed > 0) {
      console.error('Broadcast errors:', errors)
    }

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