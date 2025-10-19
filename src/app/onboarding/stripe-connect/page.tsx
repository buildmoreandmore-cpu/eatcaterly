'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

// Disable static generation for this page (uses searchParams)
export const dynamic = 'force-dynamic'

interface OnboardingStatus {
  accountId: string
  onboardingComplete: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
}

// Inner component that uses useSearchParams - must be wrapped in Suspense
function StripeConnectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  // Check if returning from Stripe onboarding
  const isReturning = searchParams.get('return') === 'true'
  const accountId = searchParams.get('account_id')

  useEffect(() => {
    if (isReturning && accountId) {
      checkOnboardingStatus(accountId)
    }
  }, [isReturning, accountId])

  const checkOnboardingStatus = async (stripeAccountId: string) => {
    setIsCheckingStatus(true)
    try {
      const response = await fetch(`/api/stripe-connect/check-status?accountId=${stripeAccountId}`)
      const data = await response.json()

      if (data.success) {
        setOnboardingStatus({
          accountId: data.accountId,
          onboardingComplete: data.onboardingComplete,
          chargesEnabled: data.chargesEnabled,
          payoutsEnabled: data.payoutsEnabled,
        })
      } else {
        setError(data.error || 'Failed to check onboarding status')
      }
    } catch (err) {
      setError('Network error checking status')
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const handleConnectStripe = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stripe-connect/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.emailAddresses[0]?.emailAddress,
          userId: user?.id,
        }),
      })

      const data = await response.json()

      if (data.success && data.onboardingUrl) {
        // Redirect to Stripe-hosted onboarding
        window.location.href = data.onboardingUrl
      } else {
        setError(data.error || 'Failed to create Stripe account')
        setIsLoading(false)
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  const handleRefreshOnboarding = async () => {
    if (!onboardingStatus?.accountId) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stripe-connect/refresh-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: onboardingStatus.accountId,
        }),
      })

      const data = await response.json()

      if (data.success && data.onboardingUrl) {
        window.location.href = data.onboardingUrl
      } else {
        setError(data.error || 'Failed to refresh onboarding')
        setIsLoading(false)
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    router.push('/onboarding/plan')
  }

  const handleSkip = () => {
    router.push('/onboarding/plan')
  }

  // Checking status after return from Stripe
  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Checking your Stripe account status...</p>
        </div>
      </div>
    )
  }

  // Show success state if onboarding is complete
  if (onboardingStatus?.onboardingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Stripe Account Connected Successfully!</h2>
            <p className="text-xl text-gray-600">You're all set to accept payments from your customers</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">What's Enabled:</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-blue-800">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Charges Enabled: {onboardingStatus.chargesEnabled ? 'Yes' : 'Pending'}
              </li>
              <li className="flex items-center text-blue-800">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Payouts Enabled: {onboardingStatus.payoutsEnabled ? 'Yes' : 'Pending'}
              </li>
            </ul>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            Continue to Plan Selection
          </button>
        </div>
      </div>
    )
  }

  // Show incomplete state if onboarding not finished
  if (onboardingStatus && !onboardingStatus.onboardingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Onboarding Incomplete</h2>
            <p className="text-xl text-gray-600">Please finish setting up your Stripe account to accept payments</p>
          </div>

          <div className="space-y-4 mb-8">
            <button
              onClick={handleRefreshOnboarding}
              disabled={isLoading}
              className="w-full bg-orange-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300"
            >
              {isLoading ? 'Loading...' : 'Continue Setup'}
            </button>

            <button
              onClick={handleSkip}
              className="w-full border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
            >
              Skip for now
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default: Show connect page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600">Step 2 of 3</span>
            <span className="text-sm text-gray-500">Payment Setup</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '66%' }}></div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Connect Your Stripe Account</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Set up secure payment processing to accept payments from your customers via SMS orders
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Benefits */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Connect with Stripe?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Direct bank deposits</h4>
                  <p className="text-sm text-gray-600">Money goes directly to your bank account</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Secure payment processing</h4>
                  <p className="text-sm text-gray-600">Bank-level security for all transactions</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Access to Stripe Dashboard</h4>
                  <p className="text-sm text-gray-600">Track payments and manage your business</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Automatic payouts</h4>
                  <p className="text-sm text-gray-600">Daily or weekly automated transfers</p>
                </div>
              </div>
            </div>
          </div>

          {/* What you'll need */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">What you'll need:</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Business information (name, address, tax ID)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Bank account details for deposits</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Tax identification number (EIN or SSN)</span>
              </li>
            </ul>
          </div>

          {/* Fees */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">Payment Processing Fees</h3>
            <p className="text-sm text-gray-600">
              Standard Stripe processing fees apply: 2.9% + $0.30 per transaction. A small platform fee of 2% helps us
              maintain and improve EatCaterly.
            </p>
          </div>

          {/* Connect Button */}
          <button
            onClick={handleConnectStripe}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? 'Creating your Stripe account...' : 'Connect with Stripe'}
          </button>

          {/* Skip Option */}
          <div className="text-center">
            <button onClick={handleSkip} className="text-gray-600 hover:text-gray-800 text-sm">
              Skip for now
            </button>
            <p className="text-xs text-gray-500 mt-1">You'll need to complete this before accepting payments</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Trust Badges */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold text-gray-900 mb-1">Secure</h3>
            <p className="text-sm text-gray-600">Bank-level security</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-1">Fast Setup</h3>
            <p className="text-sm text-gray-600">Powered by Stripe</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-900 mb-1">Direct Deposits</h3>
            <p className="text-sm text-gray-600">To your bank account</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense wrapper
export default function StripeConnectOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <StripeConnectContent />
    </Suspense>
  )
}
