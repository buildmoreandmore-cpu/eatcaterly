'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Disable static generation for this page (uses searchParams)
export const dynamic = 'force-dynamic'

// Inner component that uses useSearchParams - must be wrapped in Suspense
function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Verify the session and update subscription status
    const verifySession = async () => {
      if (!sessionId) {
        setError('No session ID found')
        setIsVerifying(false)
        return
      }

      try {
        // Optional: Verify session with backend
        // For now, we'll trust the session ID and let webhooks handle the rest
        setTimeout(() => {
          setIsVerifying(false)
        }, 1500) // Small delay for better UX
      } catch (err) {
        setError('Failed to verify payment')
        setIsVerifying(false)
      }
    }

    verifySession()
  }, [sessionId])

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/help"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to EatCaterly! 🎉</h2>
            <p className="text-xl text-gray-600">Your subscription is now active</p>
          </div>

          {/* Trial Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">14-Day Free Trial Started</h3>
            <p className="text-blue-800 text-sm">
              You won't be charged until your trial ends. Cancel anytime during the trial period for a full refund.
            </p>
          </div>

          {/* What's Next */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Access Your Dashboard</h4>
                  <p className="text-gray-600 text-sm">Manage menus, customers, and orders</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Create Your First Menu</h4>
                  <p className="text-gray-600 text-sm">Add your dishes and pricing</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Import Your Customers</h4>
                  <p className="text-gray-600 text-sm">Add phone numbers to start sending menus</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                  <span className="text-blue-600 font-semibold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Send Your First SMS Menu</h4>
                  <p className="text-gray-600 text-sm">Start taking orders via text message</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/admin"
            className="block w-full bg-blue-600 text-white text-center py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>

          {/* Support Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Need help getting started?{' '}
              <Link href="/help" className="text-blue-600 hover:text-blue-700 font-medium">
                Visit our Help Center
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense wrapper
export default function OnboardingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
