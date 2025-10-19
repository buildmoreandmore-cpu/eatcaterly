'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

type PlanType = 'starter' | 'pro' | null

interface Plan {
  id: PlanType
  name: string
  price: number
  description: string
  popular: boolean
  features: string[]
}

export default function PlanSelectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState<string | null>(null)
  const [promoData, setPromoData] = useState<any>(null)
  const [loadingPromo, setLoadingPromo] = useState(false)

  useEffect(() => {
    const id = searchParams.get('businessId')
    if (id) {
      setBusinessId(id)
    }

    // Load and validate promo code from URL
    const code = searchParams.get('promoCode')
    const promoId = searchParams.get('promoId')
    if (code && promoId) {
      setPromoCode(code)
      validatePromoCode(code)
    }
  }, [searchParams])

  const validatePromoCode = async (code: string) => {
    setLoadingPromo(true)
    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (data.success) {
        setPromoData(data.promoCode)
      } else {
        setPromoCode(null)
        setPromoData(null)
      }
    } catch (err) {
      setPromoCode(null)
      setPromoData(null)
    } finally {
      setLoadingPromo(false)
    }
  }

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 65,
      description: 'Perfect for small food businesses and food trucks',
      popular: false,
      features: [
        'A2P-compliant phone number included',
        'Up to 100 customers',
        'Daily menu updates',
        'SMS ordering',
        'Basic payment processing',
        'Order management',
        'Email support',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 125,
      description: 'Ideal for restaurants and catering businesses',
      popular: true,
      features: [
        'A2P-compliant phone number included',
        'Unlimited customers',
        'Advanced menu management',
        'SMS + email marketing',
        'Priority payment processing',
        'Event catering tools',
        'Analytics & reporting',
        'Priority support',
        'Custom branding',
      ],
    },
  ]

  const calculateDiscountedPrice = (originalPrice: number): number => {
    if (!promoData || !promoData.freeSubscription) return originalPrice

    if (promoData.discountType === 'PERCENTAGE') {
      const discount = (originalPrice * promoData.discountValue) / 100
      return Math.max(0, originalPrice - discount)
    } else {
      // FIXED_AMOUNT (in cents, so divide by 100)
      const discountAmount = promoData.discountValue / 100
      return Math.max(0, originalPrice - discountAmount)
    }
  }

  const handleSelectPlan = (planId: PlanType) => {
    setSelectedPlan(planId)
    setError('')
  }

  const handleContinue = async () => {
    if (!selectedPlan) {
      setError('Please select a plan to continue')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const selectedPlanData = plans.find(p => p.id === selectedPlan)
      const discountedPrice = calculateDiscountedPrice(selectedPlanData?.price || 0)

      // If 100% discount, skip Stripe and create business directly
      if (discountedPrice === 0 && promoData) {
        const response = await fetch('/api/onboarding/complete-free', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan: selectedPlan,
            promoCodeId: promoData.id,
            promoCode: promoCode,
            businessId: businessId || undefined,
            email: user?.emailAddresses[0]?.emailAddress || 'test@example.com',
          }),
        })

        const data = await response.json()

        if (data.success) {
          // Redirect to success page
          router.push('/onboarding/success')
        } else {
          setError(data.error || 'Failed to complete signup')
          setIsLoading(false)
        }
      } else {
        // Create Stripe checkout session (with or without discount)
        const endpoint = businessId ? '/api/create-checkout' : '/api/test-checkout'
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan: selectedPlan,
            businessId: businessId || undefined,
            email: user?.emailAddresses[0]?.emailAddress || 'test@example.com',
            promoCodeId: promoData?.id,
            promoCode: promoCode,
          }),
        })

        const data = await response.json()

        if (data.success && data.checkoutUrl) {
          // Redirect to Stripe checkout
          window.location.href = data.checkoutUrl
        } else {
          setError(data.error || 'Failed to create checkout session')
          setIsLoading(false)
        }
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Progress Indicator */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600">Step 2 of 2</span>
            <span className="text-sm text-gray-500">Plan Selection</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the plan that best fits your business needs. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card relative bg-white rounded-2xl p-8 shadow-lg transition-all ${
                selectedPlan === plan.id
                  ? 'border-4 border-blue-500 ring-4 ring-blue-100 selected'
                  : 'border-2 border-gray-200'
              } ${plan.popular ? 'border-orange-300' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  {promoData && promoData.freeSubscription ? (
                    <div>
                      <div className="text-gray-400 line-through text-2xl">${plan.price}</div>
                      <div className="text-5xl font-bold text-green-600">
                        ${calculateDiscountedPrice(plan.price)}
                      </div>
                      <span className="text-gray-500 ml-2">per month</span>
                      {calculateDiscountedPrice(plan.price) === 0 && (
                        <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                          FREE with {promoCode}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-500 ml-2">per month</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Select Button */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                  selectedPlan === plan.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : plan.popular
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {selectedPlan === plan.id ? `Selected ✓` : `Select ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        {selectedPlan && (
          <div className="max-w-md mx-auto">
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating checkout session...' : 'Continue to Payment'}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-1">Secure Payment</h3>
              <p className="text-sm text-gray-600">Powered by Stripe</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="font-semibold text-gray-900 mb-1">14-Day Free Trial</h3>
              <p className="text-sm text-gray-600">Cancel anytime, no questions asked</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-2">💳</div>
              <h3 className="font-semibold text-gray-900 mb-1">Money-Back Guarantee</h3>
              <p className="text-sm text-gray-600">30 days, hassle-free</p>
            </div>
          </div>
        </div>

        {/* FAQ or Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Questions about pricing?{' '}
            <a href="/help" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact our team
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
