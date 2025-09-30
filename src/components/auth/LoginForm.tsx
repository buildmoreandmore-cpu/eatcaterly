'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignIn } from '@clerk/nextjs'

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: 'admin@eatcaterly.com',
    password: 'admin123'
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'live' | 'demo'>('demo')
  const router = useRouter()

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      // Demo authentication - in real app, this would be an API call
      if (formData.email === 'admin@eatcaterly.com' && formData.password === 'admin123') {
        // Set authentication (in real app, would use proper auth context/session)
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('authMode', 'demo')
        // Add demo mode to redirect URL
        router.push('/admin?demo=true')
      } else {
        setErrors({ general: 'Invalid credentials' })
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'live'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Live Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'demo'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Demo Mode
          </button>
        </nav>
      </div>

      {/* Live Login Tab */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
           process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_dummy_clerk_publishable' ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="text-blue-800 font-medium mb-1">Live Users:</p>
                <p className="text-blue-600">Sign in with your Google account to access your EatCaterly dashboard.</p>
              </div>

              <div className="flex justify-center">
                <SignIn
                  redirectUrl="/admin"
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-orange-500 hover:bg-orange-600',
                      socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
                      card: 'shadow-none border-0'
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
              <p className="text-yellow-800 font-medium mb-1">Clerk Authentication Not Configured</p>
              <p className="text-yellow-600">
                Add your Clerk publishable key to enable Google OAuth login.
                For now, please use Demo Mode to test the platform.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Demo Mode Tab */}
      {activeTab === 'demo' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign In to Demo'}
          </button>

          {/* Demo credentials hint */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
            <p className="text-green-800 font-medium mb-1">Demo credentials (already filled):</p>
            <p className="text-green-600">Email: admin@eatcaterly.com</p>
            <p className="text-green-600">Password: admin123</p>
            <p className="text-green-500 text-xs mt-2">* Try all features without creating an account</p>
          </div>
        </form>
      )}
    </div>
  )
}