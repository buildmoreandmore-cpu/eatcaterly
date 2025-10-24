import Stripe from 'stripe'
import { prisma } from './db'
import { isDemoMode, demoPaymentResult, demoWebhookResult } from './demo-mode'

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  })
}

/**
 * Calculate platform fee (2% of order total)
 */
export function calculatePlatformFee(amount: number): number {
  if (!amount || amount <= 0) {
    return 0
  }
  // 2% fee, rounded to nearest cent
  return Math.round(amount * 0.02)
}

/**
 * Validate if business is ready to accept payments
 */
export async function validateBusinessPaymentReady(businessId: string): Promise<{
  isReady: boolean
  error?: string
}> {
  try {
    const business = await prisma.businessCustomer.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      return {
        isReady: false,
        error: 'Business not found',
      }
    }

    if (!business.stripeConnectAccountId) {
      return {
        isReady: false,
        error: 'Business has not connected a Stripe account',
      }
    }

    if (!business.stripeOnboardingComplete) {
      return {
        isReady: false,
        error: 'Business has not completed Stripe onboarding',
      }
    }

    if (!business.stripeChargesEnabled) {
      return {
        isReady: false,
        error: 'Business Stripe account cannot accept charges yet',
      }
    }

    return {
      isReady: true,
    }
  } catch (error) {
    return {
      isReady: false,
      error: 'Failed to validate business payment status',
    }
  }
}

/**
 * Get business customer from order
 */
export async function getBusinessFromOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        businessCustomer: true,
      },
    })

    if (!order || !order.businessCustomer) {
      return null
    }

    return order.businessCustomer
  } catch (error) {
    console.error('Error fetching business from order:', error)
    return null
  }
}

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
 * Uses destination charges to route payment to business's Stripe Connect account
 */
export async function createPaymentLink(orderId: string): Promise<PaymentLinkResult> {
  try {
    const stripe = getStripeClient()
    if (isDemoMode() || !stripe) {
      console.log('Demo mode: Payment link would be created for order', orderId)

      // Update order with demo payment link info
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentId: demoPaymentResult.paymentLinkId,
          paymentUrl: demoPaymentResult.url,
          status: 'CONFIRMED',
        },
      })

      return demoPaymentResult
    }

    // Get order with customer, business, and items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        businessCustomer: true,
      },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    if (!order.businessCustomer) {
      throw new Error('Order has no associated business')
    }

    // Validate business is ready to accept payments
    const validation = await validateBusinessPaymentReady(order.businessCustomer.id)
    if (!validation.isReady) {
      throw new Error(validation.error || 'Business not ready to accept payments')
    }

    const business = order.businessCustomer

    // Calculate platform fee (2%)
    const platformFee = calculatePlatformFee(order.totalAmount)

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

    // Create payment link on business's Stripe Connect account (destination charge)
    const paymentLink = await stripe.paymentLinks.create(
      {
        line_items: lineItems,
        metadata: {
          orderId: order.id,
          customerId: order.customerId,
          businessId: business.id,
        },
        application_fee_amount: platformFee, // Your 2% platform fee
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
      },
      {
        stripeAccount: business.stripeConnectAccountId!, // Charge on business's account
      }
    )

    // Update order with payment link info and platform fee
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: paymentLink.id,
        paymentUrl: paymentLink.url,
        platformFee: platformFee,
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
 * Handle business customer subscription checkout completion
 *
 * NOTE: EZ Texting does not support automated phone number provisioning via API.
 * Phone numbers must be manually assigned by admin through the EatCaterly admin panel.
 */
async function handleBusinessSubscriptionCheckout(session: Stripe.Checkout.Session) {
  try {
    const { businessId, plan } = session.metadata || {}

    if (!businessId) {
      console.error('No businessId in session metadata')
      return
    }

    // Get business customer
    const business = await prisma.businessCustomer.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      console.error(`Business not found: ${businessId}`)
      return
    }

    // Update business with Stripe subscription info
    // Phone number will be manually assigned by admin later
    await prisma.businessCustomer.update({
      where: { id: businessId },
      data: {
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        subscriptionStatus: 'active',
        subscriptionTier: plan,
        onboardingCompleted: true,
      },
    })

    console.log(`✓ Subscription activated for business ${businessId}`)
    console.log(`  Plan: ${plan}`)
    console.log(`  ⚠️  Phone number pending manual assignment`)

    // TODO: Send email notification to admin to assign phone number
  } catch (error) {
    console.error('Error handling business subscription checkout:', error)
    // Don't throw - we want to acknowledge the webhook even if processing fails
  }
}

/**
 * Handle subscription cancellation
 *
 * NOTE: Phone numbers must be manually released through EZ Texting dashboard.
 * Admin should manually unassign number from business after cancellation.
 */
async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  try {
    const { businessId } = subscription.metadata || {}

    // Find business by subscription ID if metadata not available
    const business = businessId
      ? await prisma.businessCustomer.findUnique({ where: { id: businessId } })
      : await prisma.businessCustomer.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        })

    if (!business) {
      console.error(`Business not found for subscription ${subscription.id}`)
      return
    }

    // Deactivate business
    await prisma.businessCustomer.update({
      where: { id: business.id },
      data: {
        isActive: false,
        subscriptionStatus: 'canceled',
      },
    })

    console.log(`✓ Business ${business.id} deactivated`)

    if (business.assignedPhoneNumber) {
      console.log(`  ⚠️  Phone number ${business.assignedPhoneNumber} should be manually unassigned in admin panel`)
      // TODO: Send email notification to admin to unassign phone number
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
    // Don't throw - we want to acknowledge the webhook even if processing fails
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
    const stripe = getStripeClient()
    if (isDemoMode() || !stripe) {
      console.log('Demo mode: Webhook would be processed')
      return demoWebhookResult
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

        // Check if this is a business customer subscription checkout
        if (session.metadata?.businessId) {
          await handleBusinessSubscriptionCheckout(session)
          return {
            success: true,
            message: 'Business subscription checkout completed',
          }
        }

        // Otherwise, handle as order checkout
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

      case 'charge.failed': {
        const charge = event.data.object as Stripe.Charge
        const orderId = charge.metadata?.orderId

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'CANCELLED',
            },
          })

          console.log(`Charge failed for order ${orderId}: ${charge.failure_message}`)
          return {
            success: true,
            orderId,
            message: 'Charge failed, order cancelled',
          }
        }
        break
      }

      case 'application_fee.created': {
        const fee = event.data.object as Stripe.ApplicationFee
        console.log(`Platform fee collected: $${fee.amount / 100} from account ${fee.account}`)

        return {
          success: true,
          message: `Application fee of $${fee.amount / 100} tracked`,
        }
      }

      case 'application_fee.refunded': {
        const fee = event.data.object as Stripe.ApplicationFee
        console.log(`Platform fee refunded: $${fee.amount_refunded / 100}`)

        return {
          success: true,
          message: 'Application fee refund processed',
        }
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account

        // Find business with this Stripe Connect account
        const business = await prisma.businessCustomer.findFirst({
          where: { stripeConnectAccountId: account.id },
        })

        if (business) {
          await prisma.businessCustomer.update({
            where: { id: business.id },
            data: {
              stripeChargesEnabled: account.charges_enabled || false,
              stripePayoutsEnabled: account.payouts_enabled || false,
              stripeDetailsSubmitted: account.details_submitted || false,
              stripeOnboardingComplete:
                (account.charges_enabled &&
                 account.payouts_enabled &&
                 account.details_submitted) || false,
            },
          })

          console.log(`Updated business ${business.id} account status`)
        }

        return {
          success: true,
          message: 'Connected account updated',
        }
      }

      case 'account.external_account.created': {
        console.log('External account (bank account/card) added to connected account')
        return {
          success: true,
          message: 'External account added',
        }
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancellation(subscription)
        return {
          success: true,
          message: 'Subscription cancelled',
        }
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
    const stripe = getStripeClient()
    if (isDemoMode() || !stripe) {
      console.log('Demo mode: Simple payment link would be created for', description, amount)
      return demoPaymentResult
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
    const stripe = getStripeClient()
    if (isDemoMode() || !stripe) {
      console.log('Demo mode: Payment link retrieval for', paymentLinkId)
      return { id: paymentLinkId, url: demoPaymentResult.url }
    }

    const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId)
    return paymentLink
  } catch (error: any) {
    console.error('Failed to retrieve payment link:', error)
    throw new Error(`Failed to get payment link: ${error.message}`)
  }
}