import { prisma } from '@/lib/db'
import { sendSMS } from '@/lib/sms'

interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
}

interface OrderSession {
  customerId: string
  menuId: string
  items: OrderItem[]
  totalAmount: number
  step: 'waiting_for_selection' | 'confirming_order' | 'payment_sent'
}

// In-memory order sessions (in production, use Redis or database)
const orderSessions = new Map<string, OrderSession>()

/**
 * Format menu items for SMS display
 */
export function formatMenuForSMS(menuItems: any[]): string {
  if (menuItems.length === 0) {
    return "Sorry, no menu items are available today."
  }

  let message = "📋 Today's Menu:\n\n"

  menuItems.forEach((item, index) => {
    const price = (item.price / 100).toFixed(2)
    message += `${index + 1}. ${item.name} - $${price}\n`
    if (item.description) {
      message += `   ${item.description}\n`
    }
    message += '\n'
  })

  message += "Reply with numbers to order (e.g., '1, 3, 5' for multiple items)\n"
  message += "Or reply 'MENU' anytime to see this menu again"

  return message
}

/**
 * Parse customer's selection from SMS
 */
export function parseOrderSelection(message: string): number[] {
  const cleanMessage = message.trim().toUpperCase()

  // Handle special commands
  if (cleanMessage === 'MENU' || cleanMessage === 'M') {
    return []
  }

  // Extract numbers from the message
  const numbers: number[] = []
  const matches = message.match(/\b\d+\b/g)

  if (matches) {
    matches.forEach(match => {
      const num = parseInt(match, 10)
      if (num > 0 && !numbers.includes(num)) {
        numbers.push(num)
      }
    })
  }

  return numbers.sort((a, b) => a - b)
}

/**
 * Get today's active menu
 */
export async function getTodaysMenu() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const menu = await prisma.menu.findFirst({
    where: {
      date: today,
      isActive: true
    },
    include: {
      menuItems: {
        where: { isAvailable: true },
        orderBy: { name: 'asc' }
      }
    }
  })

  return menu
}

/**
 * Handle incoming SMS for ordering
 */
export async function handleOrderingSMS(
  customerPhone: string,
  message: string,
  businessPhone: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    // Get or create customer
    let customer = await prisma.customer.findUnique({
      where: { phoneNumber: customerPhone }
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phoneNumber: customerPhone,
          category: 'New',
          tags: ['New'],
          isActive: true
        }
      })
    }

    const cleanMessage = message.trim().toUpperCase()

    // Handle menu request
    if (cleanMessage === 'MENU' || cleanMessage === 'M' || cleanMessage === 'ORDER' || cleanMessage === 'O') {
      const menu = await getTodaysMenu()

      if (!menu || menu.menuItems.length === 0) {
        return {
          success: true,
          response: "Sorry, no menu is available today. Please check back later or call us directly."
        }
      }

      // Create order session
      orderSessions.set(customerPhone, {
        customerId: customer.id,
        menuId: menu.id,
        items: [],
        totalAmount: 0,
        step: 'waiting_for_selection'
      })

      const menuText = formatMenuForSMS(menu.menuItems)

      // Send menu via SMS
      await sendSMS(customerPhone, menuText)

      return { success: true }
    }

    // Check if customer has an active order session
    const session = orderSessions.get(customerPhone)

    if (!session) {
      return {
        success: true,
        response: "Hi! To place an order, reply 'MENU' to see today's options."
      }
    }

    // Parse selection numbers
    const selections = parseOrderSelection(message)

    if (selections.length === 0) {
      return {
        success: true,
        response: "Please reply with item numbers (e.g., '1, 3, 5') or 'MENU' to see options again."
      }
    }

    // Get menu items for validation
    const menu = await prisma.menu.findUnique({
      where: { id: session.menuId },
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: { name: 'asc' }
        }
      }
    })

    if (!menu) {
      orderSessions.delete(customerPhone)
      return {
        success: true,
        response: "Sorry, the menu is no longer available. Please try again later."
      }
    }

    // Validate selections and build order
    const validSelections = selections.filter(num => num <= menu.menuItems.length)

    if (validSelections.length === 0) {
      return {
        success: true,
        response: `Please select valid item numbers (1-${menu.menuItems.length}) or reply 'MENU' to see options.`
      }
    }

    // Build order items
    const orderItems: OrderItem[] = []
    let totalAmount = 0

    validSelections.forEach(num => {
      const menuItem = menu.menuItems[num - 1]
      if (menuItem) {
        orderItems.push({
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        })
        totalAmount += menuItem.price
      }
    })

    // Update session
    session.items = orderItems
    session.totalAmount = totalAmount
    session.step = 'confirming_order'

    // Create order confirmation message
    let confirmMessage = "🛒 Your Order:\n\n"
    orderItems.forEach(item => {
      const price = (item.price / 100).toFixed(2)
      confirmMessage += `• ${item.name} - $${price}\n`
    })

    const total = (totalAmount / 100).toFixed(2)
    confirmMessage += `\nTotal: $${total}\n\n`
    confirmMessage += "Reply 'CONFIRM' to proceed with payment, or 'MENU' to start over."

    return {
      success: true,
      response: confirmMessage
    }

  } catch (error: any) {
    console.error('Error handling ordering SMS:', error)
    return {
      success: false,
      error: 'Failed to process order request'
    }
  }
}

/**
 * Handle order confirmation and create payment
 */
export async function handleOrderConfirmation(
  customerPhone: string,
  message: string
): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    const session = orderSessions.get(customerPhone)

    if (!session || session.step !== 'confirming_order') {
      return {
        success: true,
        response: "No active order found. Reply 'MENU' to start a new order."
      }
    }

    const cleanMessage = message.trim().toUpperCase()

    if (cleanMessage === 'CONFIRM' || cleanMessage === 'YES' || cleanMessage === 'Y') {
      // Create order in database
      const order = await prisma.order.create({
        data: {
          customerId: session.customerId,
          menuId: session.menuId,
          items: session.items as any,
          totalAmount: session.totalAmount,
          status: 'PENDING'
        }
      })

      // Generate payment link (mock for now)
      const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${order.id}`

      // Update order with payment URL
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentUrl }
      })

      // Update customer stats
      await prisma.customer.update({
        where: { id: session.customerId },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: session.totalAmount },
          lastOrderAt: new Date(),
          category: 'Regular' // Update category based on order history
        }
      })

      // Clear session
      orderSessions.delete(customerPhone)

      const total = (session.totalAmount / 100).toFixed(2)
      const paymentMessage = `✅ Order confirmed! Total: $${total}\n\n` +
        `Pay securely here: ${paymentUrl}\n\n` +
        `Your order will be prepared once payment is received. Thank you!`

      return {
        success: true,
        response: paymentMessage
      }
    } else if (cleanMessage === 'MENU' || cleanMessage === 'CANCEL') {
      // Restart ordering process
      orderSessions.delete(customerPhone)
      return await handleOrderingSMS(customerPhone, 'MENU', '')
    } else {
      return {
        success: true,
        response: "Please reply 'CONFIRM' to proceed with payment, 'MENU' to start over, or 'CANCEL' to cancel."
      }
    }

  } catch (error: any) {
    console.error('Error handling order confirmation:', error)
    return {
      success: false,
      error: 'Failed to process order confirmation'
    }
  }
}

/**
 * Get order session status
 */
export function getOrderSession(customerPhone: string): OrderSession | undefined {
  return orderSessions.get(customerPhone)
}

/**
 * Clear order session
 */
export function clearOrderSession(customerPhone: string): void {
  orderSessions.delete(customerPhone)
}