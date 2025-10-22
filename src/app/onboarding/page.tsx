'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'

const ADMIN_EMAIL = 'eatcaterly@gmail.com'

interface OnboardingResult {
  success: boolean
  data?: {
    businessId: string
    businessName: string
    assignedPhoneNumber: string
    areaCode: string
    location: {
      city: string
      state: string
    }
  }
  error?: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (isLoaded && user) {
      const userEmail = user.emailAddresses.find(
        email => email.id === user.primaryEmailAddressId
      )?.emailAddress?.toLowerCase().trim()

      if (userEmail === ADMIN_EMAIL.toLowerCase().trim()) {
        router.push('/admin')
      }
    }
  }, [isLoaded, user, router])

  const [formData, setFormData] = useState({
    businessName: '',
    contactName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Test User',
    contactEmail: user?.emailAddresses[0]?.emailAddress || 'test@example.com',
    zipCode: '',
    promoCode: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<OnboardingResult | null>(null)
  const [error, setError] = useState<string>('')
  const [showPromoField, setShowPromoField] = useState(false)
  const [validatingPromo, setValidatingPromo] = useState(false)
  const [promoValid, setPromoValid] = useState(false)
  const [promoData, setPromoData] = useState<any>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setError('')

    // Reset promo validation if promo code changes
    if (name === 'promoCode') {
      setPromoValid(false)
      setPromoData(null)
    }
  }

  const validatePromoCode = async () => {
    if (!formData.promoCode.trim()) {
      setError('Please enter a promo code')
      return
    }

    setValidatingPromo(true)
    setError('')

    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: formData.promoCode }),
      })

      const data = await response.json()

      if (data.success) {
        setPromoValid(true)
        setPromoData(data.promoCode)
        // Success message will be shown in UI
      } else {
        setError(data.error || 'Invalid promo code')
        setPromoValid(false)
        setPromoData(null)
      }
    } catch (err) {
      setError('Failed to validate promo code')
      setPromoValid(false)
      setPromoData(null)
    } finally {
      setValidatingPromo(false)
    }
  }

  const validateForm = () => {
    if (!formData.businessName.trim()) {
      setError('Business name is required')
      return false
    }

    if (!formData.zipCode.trim()) {
      setError('Zip code is required')
      return false
    }

    // Validate zip code format
    const zipRegex = /^\d{5}$/
    if (!zipRegex.test(formData.zipCode)) {
      setError('Please enter a valid 5-digit zip code')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          clerkUserId: user?.id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to complete onboarding')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    // Pass business ID and promo code data to plan selection page
    const params = new URLSearchParams()

    // Always pass businessId if available
    if (result?.data?.businessId) {
      params.set('businessId', result.data.businessId)
    }

    // Pass promo code if valid
    if (promoValid && promoData) {
      params.set('promoCode', formData.promoCode)
      params.set('promoId', promoData.id)
    }

    router.push(`/onboarding/plan?${params.toString()}`)
  }

  // Skip loading check for testing without authentication
  // if (!isLoaded) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-lg text-gray-600">Loading...</div>
  //     </div>
  //   )
  // }

  // Success state - show assigned phone number
  if (result?.success) {
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-600">Your business profile is complete</p>
            </div>

            {/* Phone Number Display - Only show if phone number was assigned */}
            {result.data?.assignedPhoneNumber && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Your A2P-Compliant Phone Number</p>
                  <div className="text-4xl font-bold text-blue-600 mb-2 font-mono">
                    {result.data.assignedPhoneNumber}
                  </div>
                  <p className="text-gray-700">
                    Local to {result.data?.location.city}, {result.data?.location.state}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Area Code: {result.data?.areaCode}</p>
                </div>
              </div>
            )}

            {/* Message for users without assigned number (promo code with free phone) */}
            {!result.data?.assignedPhoneNumber && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <p className="text-lg text-gray-700 mb-2">
                    Your business profile has been created successfully!
                  </p>
                  <p className="text-sm text-gray-600">
                    A dedicated phone number will be assigned to you after completing your subscription.
                  </p>
                </div>
              </div>
            )}

            {/* Business Details */}
            <div className="space-y-3 mb-8">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Business Name</span>
                <span className="font-semibold text-gray-900">{result.data?.businessName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Contact</span>
                <span className="font-semibold text-gray-900">{formData.contactName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Email</span>
                <span className="font-semibold text-gray-900">{formData.contactEmail}</span>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Plan Selection
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Form state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Sign Out Button */}
          <div className="mb-4 text-right">
            <button
              onClick={() => signOut(() => router.push('/'))}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Sign out and start over
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">Step 1 of 2</span>
              <span className="text-sm text-gray-500">Business Information</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Business Profile
            </h1>
            <p className="text-gray-600">
              Tell us about your business and we'll assign you a local A2P-compliant phone number
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g., Mike's Pizza"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Contact Name */}
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Zip Code */}
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code *
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="90210"
                maxLength={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-center text-lg"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll assign you a local phone number for your area
              </p>
            </div>

            {/* Promo Code Section */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => setShowPromoField(!showPromoField)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
              >
                {showPromoField ? '- Hide' : '+ Have a promo code?'}
              </button>

              {showPromoField && (
                <div className="mt-4">
                  <label htmlFor="promoCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="promoCode"
                      name="promoCode"
                      value={formData.promoCode}
                      onChange={handleChange}
                      placeholder="Enter code"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={validatePromoCode}
                      disabled={validatingPromo || !formData.promoCode.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {validatingPromo ? 'Checking...' : 'Apply'}
                    </button>
                  </div>

                  {/* Promo Valid Message */}
                  {promoValid && promoData && (
                    <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-800">Promo code applied!</p>
                          <p className="text-xs text-green-700 mt-1">
                            {promoData.discountType === 'PERCENTAGE'
                              ? `${promoData.discountValue}% discount`
                              : `$${(promoData.discountValue / 100).toFixed(2)} off`}
                            {promoData.freePhoneNumber && ' + Free phone number'}
                            {promoData.freeSubscription && ' + Free subscription'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.businessName || !formData.zipCode}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Assigning your number...' : 'Continue'}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>What's next?</strong> We'll assign you a local phone number from your area code and set up your A2P-compliant messaging service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
