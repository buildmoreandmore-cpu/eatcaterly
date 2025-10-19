import Stripe from 'stripe'
import { prisma } from './db'
import ezTexting from './ez-texting'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export interface SubscriptionItem {
  description: string
  amount: number // in dollars
  interval: string
}

export interface SubscriptionDetails {
  success: boolean
  error?: string
  phoneNumber?: string
  subscriptionStatus?: string
  items?: SubscriptionItem[]
  totalMonthly?: number
  nextBillingDate?: Date
  trialEnd?: Date
  trialDaysRemaining?: number
}

export interface Invoice {
  id: string
  number: string
  amount: number // in dollars
  status: string
  date: Date
  pdfUrl: string
  hostedUrl: string
}

export interface InvoicesResult {
  success: boolean
  error?: string
  invoices?: Invoice[]
}

export interface CancellationResult {
  success: boolean
  error?: string
  message?: string
}

/**
 * Get subscription details for a business customer
 */
export async function getSubscriptionDetails(
  businessId: string
): Promise<SubscriptionDetails> {
  try {
    // Get business customer
    const business = await prisma.businessCustomer.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      return {
        success: false,
        error: 'Business not found',
      }
    }

    // If no Stripe subscription yet, return basic info from database
    if (!business.stripeSubscriptionId) {
      return {
        success: true,
        phoneNumber: business.assignedPhoneNumber ?? undefined,
        subscriptionStatus: business.subscriptionStatus,
        items: [],
        totalMonthly: 0,
      }
    }

    // Fetch subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      business.stripeSubscriptionId,
      {
        expand: ['items.data.price']
      }
    ) as any // Type assertion for newer Stripe API version

    // Parse subscription items
    const items: SubscriptionItem[] = subscription.items.data.map((item: any) => ({
      description: item.price.nickname || 'Subscription Item',
      amount: (item.price.unit_amount || 0) / 100, // Convert cents to dollars
      interval: item.price.recurring?.interval || 'month',
    }))

    const totalMonthly = items.reduce((sum, item) => sum + item.amount, 0)

    // Calculate trial info
    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : undefined

    const trialDaysRemaining = trialEnd
      ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : undefined

    return {
      success: true,
      phoneNumber: business.assignedPhoneNumber ?? undefined,
      subscriptionStatus: subscription.status,
      items,
      totalMonthly,
      nextBillingDate: new Date(subscription.current_period_end * 1000),
      trialEnd,
      trialDaysRemaining,
    }
  } catch (error: any) {
    console.error('Error fetching subscription details:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch subscription details',
    }
  }
}

/**
 * Get invoices for a business customer
 */
export async function getInvoices(businessId: string): Promise<InvoicesResult> {
  try {
    // Get business customer
    const business = await prisma.businessCustomer.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      return {
        success: false,
        error: 'Business not found',
      }
    }

    // If no Stripe customer yet, return empty invoices
    if (!business.stripeCustomerId) {
      return {
        success: true,
        invoices: [],
      }
    }

    // Fetch invoices from Stripe
    const stripeInvoices = await stripe.invoices.list({
      customer: business.stripeCustomerId,
      limit: 12, // Last 12 invoices (1 year of monthly billing)
    })

    const invoices: Invoice[] = stripeInvoices.data.map((invoice) => ({
      id: invoice.id ?? '',
      number: invoice.number || invoice.id || '',
      amount: (invoice.amount_paid || 0) / 100, // Convert cents to dollars
      status: invoice.status || 'unknown',
      date: new Date((invoice.created ?? 0) * 1000),
      pdfUrl: invoice.invoice_pdf ?? '',
      hostedUrl: invoice.hosted_invoice_url ?? '',
    }))

    return {
      success: true,
      invoices,
    }
  } catch (error: any) {
    console.error('Error fetching invoices:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch invoices',
    }
  }
}

/**
 * Cancel subscription and deactivate business
 */
export async function cancelSubscription(
  businessId: string
): Promise<CancellationResult> {
  try {
    // Get business customer
    const business = await prisma.businessCustomer.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      return {
        success: false,
        error: 'Business not found',
      }
    }

    if (!business.stripeSubscriptionId) {
      return {
        success: false,
        error: 'No active subscription found',
      }
    }

    // Cancel Stripe subscription
    await stripe.subscriptions.cancel(business.stripeSubscriptionId)

    // Recycle phone number (put into cooldown instead of deleting)
    if (business.assignedPhoneNumber) {
      const { releaseNumber } = await import('./phone-inventory')
      const releaseResult = await releaseNumber(business.assignedPhoneNumber)

      if (!releaseResult.success) {
        console.error('Failed to recycle phone number:', releaseResult.error)
        // Continue anyway - we still want to deactivate the business
      } else {
        console.log(`Phone number ${business.assignedPhoneNumber} recycled - 30 day cooldown active`)
      }
    }

    // Deactivate business in database
    await prisma.businessCustomer.update({
      where: { id: businessId },
      data: {
        isActive: false,
        subscriptionStatus: 'canceled',
      },
    })

    return {
      success: true,
      message: 'Subscription canceled successfully',
    }
  } catch (error: any) {
    console.error('Error canceling subscription:', error)
    return {
      success: false,
      error: error.message || 'Failed to cancel subscription',
    }
  }
}
