'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

interface SubscriptionInfo {
  subscriptionStatus: string
  subscriptionTier: string
  phoneNumber: string
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      loadSubscriptionInfo()
    }
  }, [isLoaded])

  async function loadSubscriptionInfo() {
    try {
      const email = user?.emailAddresses[0]?.emailAddress
      if (!email) {
        setLoading(false)
        return
      }

      // Get business info
      const businessRes = await fetch(`/api/business/me?email=${encodeURIComponent(email)}`)
      if (!businessRes.ok) {
        setLoading(false)
        return
      }

      const businessData = await businessRes.json()
      if (!businessData.success || !businessData.businessId) {
        setLoading(false)
        return
      }

      // Get subscription info
      const subRes = await fetch(`/api/business/subscription?businessId=${businessData.businessId}`)
      if (subRes.ok) {
        const subData = await subRes.json()
        setSubscription({
          subscriptionStatus: subData.subscriptionStatus || 'unknown',
          subscriptionTier: businessData.subscriptionTier || 'unknown',
          phoneNumber: subData.phoneNumber || 'N/A'
        })
      }
    } catch (error) {
      console.error('Failed to load subscription info:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Account Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email Address
              </label>
              <div className="text-base text-gray-900">
                {user?.emailAddresses[0]?.emailAddress || 'N/A'}
              </div>
            </div>
            {subscription && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Subscription Plan
                  </label>
                  <div className="text-base text-gray-900 capitalize">
                    {subscription.subscriptionTier}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Subscription Status
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.subscriptionStatus === 'active'
                        ? 'bg-green-100 text-green-800'
                        : subscription.subscriptionStatus === 'trialing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscription.subscriptionStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Business Phone Number
                  </label>
                  <div className="text-base text-gray-900 font-mono">
                    {subscription.phoneNumber}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Billing & Subscription Management */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Billing & Subscription
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Manage your subscription, view billing history, and update payment methods.
          </p>
          <Link href="/admin/account">
            <button className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
              Manage Billing
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
