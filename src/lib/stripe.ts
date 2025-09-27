import Stripe from 'stripe'
import { prisma } from './db'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
  : null

export interface PaymentLinkResult {
  paymentLinkId: string
  url: string
}

export interface WebhookResult {
  success: boolean
  orderId?: string
  message: string
}

/**
 * Create a Stripe payment link for an order
 */
export async function createPaymentLink(orderId: string): Promise<PaymentLinkResult> {
  try {
    if (!stripe) {
      throw new Error('Stripe client not configured')
    }

    // Get order with customer and items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
      },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    // Convert items JSON to line items
    const lineItems: Stripe.PaymentLinkCreateParams.LineItem[] = Object.values(
      order.items as any
    ).map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description || undefined,
        },
        unit_amount: item.price,
      },
      quantity: item.quantity || 1,
    }))

    // Create payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: lineItems,
      metadata: {
        orderId: order.id,
        customerId: order.customerId,
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.APP_URL}/order/${order.id}/success`,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      phone_number_collection: {
        enabled: true,
      },
      custom_fields: [
        {
          key: 'delivery_instructions',
          label: {
            type: 'custom',
            custom: 'Delivery Instructions',
          },
          type: 'text',
          optional: true,
        },
      ],
    })

    // Update order with payment link info
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: paymentLink.id,
        paymentUrl: paymentLink.url,
        status: 'CONFIRMED',
      },
    })

    return {
      paymentLinkId: paymentLink.id,
      url: paymentLink.url,
    }
  } catch (error: any) {
    console.error('Payment link creation failed:', error)
    throw new Error(`Failed to create payment link: ${error.message}`)
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleWebhook(
  rawBody: string,
  signature: string
): Promise<WebhookResult> {
  try {
    if (!stripe) {
      throw new Error('Stripe client not configured')
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    console.log('Stripe webhook received:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (!orderId) {
          throw new Error('No order ID in session metadata')
        }

        if (session.payment_status === 'paid') {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'PAID',
            },
          })

          // TODO: Send confirmation SMS to customer
          return {
            success: true,
            orderId,
            message: 'Payment confirmed, order updated to PAID',
          }
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata?.orderId

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'PAID',
            },
          })

          return {
            success: true,
            orderId,
            message: 'Payment intent succeeded, order updated to PAID',
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata?.orderId

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'CANCELLED',
            },
          })

          // TODO: Send payment failed SMS to customer
          return {
            success: true,
            orderId,
            message: 'Payment failed, order cancelled',
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return {
      success: true,
      message: `Webhook ${event.type} processed`,
    }
  } catch (error: any) {
    console.error('Webhook handling failed:', error)
    throw new Error(`Webhook error: ${error.message}`)
  }
}

/**
 * Create a one-time payment link for a specific amount
 */
export async function createSimplePaymentLink(
  amount: number,
  description: string,
  metadata: Record<string, string> = {}
): Promise<PaymentLinkResult> {
  try {
    if (!stripe) {
      throw new Error('Stripe client not configured')
    }

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata,
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.APP_URL}/payment/success`,
        },
      },
    })

    return {
      paymentLinkId: paymentLink.id,
      url: paymentLink.url,
    }
  } catch (error: any) {
    console.error('Simple payment link creation failed:', error)
    throw new Error(`Failed to create payment link: ${error.message}`)
  }
}

/**
 * Get payment link details
 */
export async function getPaymentLink(paymentLinkId: string) {
  try {
    if (!stripe) {
      throw new Error('Stripe client not configured')
    }

    const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId)
    return paymentLink
  } catch (error: any) {
    console.error('Failed to retrieve payment link:', error)
    throw new Error(`Failed to get payment link: ${error.message}`)
  }
}