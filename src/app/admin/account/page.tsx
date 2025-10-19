'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface SubscriptionItem {
  description: string
  amount: number
  interval: string
}

interface SubscriptionDetails {
  success: boolean
  error?: string
  phoneNumber?: string
  subscriptionStatus?: string
  items?: SubscriptionItem[]
  totalMonthly?: number
  nextBillingDate?: string
  trialEnd?: string
  trialDaysRemaining?: number
}

interface Invoice {
  id: string
  number: string
  amount: number
  status: string
  date: string
  pdfUrl: string
  hostedUrl: string
}

export default function BusinessAccountPage() {
  const { user, isLoaded } = useUser()
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [businessId, setBusinessId] = useState<string | null>(null)

  useEffect(() => {
    // Wait for Clerk to load, then proceed with or without user
    if (isLoaded) {
      loadBusinessAndAccountData()
    }
  }, [isLoaded, user])

  async function loadBusinessAndAccountData() {
    try {
      setLoading(true)

      let currentBusinessId: string | null = null

      // Try to get businessId from URL parameter first (for testing)
      const urlParams = new URLSearchParams(window.location.search)
      const businessIdParam = urlParams.get('businessId')

      if (businessIdParam) {
        // Use businessId from URL
        currentBusinessId = businessIdParam
        setBusinessId(currentBusinessId)
      } else {
        // Try to get email from Clerk user
        const email = user?.emailAddresses[0]?.emailAddress

        if (email) {
          // Look up business by email
          const businessRes = await fetch(`/api/business/me?email=${encodeURIComponent(email)}`)
          if (!businessRes.ok) {
            const businessData = await businessRes.json()
            setError(businessData.error || 'Failed to load business details')
            return
          }

          const businessData = await businessRes.json()
          if (!businessData.success || !businessData.businessId) {
            setError('No business found for your account')
            return
          }

          currentBusinessId = businessData.businessId
          setBusinessId(currentBusinessId)
        } else {
          // No email and no businessId - try to get the most recent business (for testing)
          setError('Please provide a businessId parameter or sign in with Clerk')
          return
        }
      }

      if (!currentBusinessId) {
        setError('Could not determine business ID')
        return
      }

      // Fetch subscription details
      const subRes = await fetch(`/api/business/subscription?businessId=${currentBusinessId}`)
      if (subRes.ok) {
        const subData = await subRes.json()
        setSubscription(subData)
      }

      // Fetch invoices
      const invRes = await fetch(`/api/business/invoices?businessId=${currentBusinessId}`)
      if (invRes.ok) {
        const invData = await invRes.json()
        setInvoices(invData.invoices || [])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelSubscription() {
    try {
      setCancelLoading(true)
      const res = await fetch('/api/business/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Subscription canceled successfully')
        await loadBusinessAndAccountData()
        setShowCancelConfirm(false)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setCancelLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error: {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        {/* Phone Number Section */}
        <section className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Phone Number</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-mono">{subscription?.phoneNumber}</div>
              <div className="text-sm text-gray-500 mt-1">Your SMS business number</div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              subscription?.subscriptionStatus === 'active'
                ? 'bg-green-100 text-green-800'
                : subscription?.subscriptionStatus === 'trialing'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {subscription?.subscriptionStatus}
            </div>
          </div>
        </section>

        {/* Subscription Breakdown */}
        <section className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Subscription</h2>

          {subscription?.items && subscription.items.length > 0 && (
            <div className="space-y-3">
              {subscription.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="text-gray-700">{item.description}</div>
                  <div className="font-semibold">${item.amount.toFixed(2)}/{item.interval}</div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-3 text-lg font-bold">
                <div>Total</div>
                <div>${subscription?.totalMonthly?.toFixed(2)}/month</div>
              </div>
            </div>
          )}

          {/* Trial Info */}
          {subscription?.trialEnd && subscription.trialDaysRemaining && subscription.trialDaysRemaining > 0 && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-900 font-semibold">Free Trial Active</div>
              <div className="text-blue-700 text-sm mt-1">
                {subscription.trialDaysRemaining} days remaining •
                Trial ends {new Date(subscription.trialEnd).toLocaleDateString()}
              </div>
            </div>
          )}

          {/* Next Billing */}
          {subscription?.nextBillingDate && (
            <div className="mt-4 text-sm text-gray-600">
              Next billing date: {new Date(subscription.nextBillingDate).toLocaleDateString()}
            </div>
          )}
        </section>

        {/* Invoices Section */}
        <section className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Billing History</h2>

          {invoices.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No invoices yet</div>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div>
                    <div className="font-medium">{invoice.number}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(invoice.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-semibold">${invoice.amount.toFixed(2)}</div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status}
                    </span>
                    <a
                      href={invoice.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Cancel Subscription */}
        <section className="bg-white border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-red-900">Cancel Subscription</h2>
          <p className="text-sm text-gray-600 mb-4">
            Canceling your subscription will immediately deactivate your phone number and you will lose access to all features.
          </p>

          {!showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Cancel Subscription
            </button>
          ) : (
            <div className="bg-red-50 rounded-lg p-4 border border-red-300">
              <p className="font-semibold text-red-900 mb-3">
                Are you sure you want to cancel?
              </p>
              <p className="text-sm text-red-700 mb-4">
                This action cannot be undone. Your phone number will be released and all data will be preserved but inaccessible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                >
                  {cancelLoading ? 'Canceling...' : 'Yes, Cancel Subscription'}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelLoading}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Keep Subscription
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
