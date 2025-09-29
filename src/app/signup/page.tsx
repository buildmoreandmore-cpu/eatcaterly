'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Phone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface SignupResult {
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
    message: string
  }
  error?: string
}

export default function CustomerSignup() {
  const [formData, setFormData] = useState({
    zipCode: '',
    businessName: '',
    contactName: '',
    contactEmail: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<SignupResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/customers/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Phone className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Get Your Local SMS Number</h2>
          <p className="mt-2 text-gray-600">
            Enter your zip code to get assigned a local phone number for SMS food delivery
          </p>
        </div>

        {!result?.success ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Zip Code
                </label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  maxLength={5}
                  placeholder="30309"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="text-center text-lg font-mono"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  We serve the Atlanta metro area (404, 470, 678, 770)
                </p>
              </div>

              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <Input
                  id="businessName"
                  name="businessName"
                  type="text"
                  placeholder="Mike's Deli"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                <Input
                  id="contactName"
                  name="contactName"
                  type="text"
                  placeholder="Mike Johnson"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  placeholder="mike@mikesdeli.com"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {result?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                  <p className="text-sm text-red-700">{result.error}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning Number...
                </>
              ) : (
                'Get My Local SMS Number'
              )}
            </Button>
          </form>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-green-900">Success!</h3>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {result.data?.assignedPhoneNumber}
                  </div>
                  <div className="text-sm text-gray-600">
                    Your local SMS number for {result.data?.location.city}, GA
                  </div>
                </div>
              </div>

              <div className="text-sm text-green-800 space-y-2">
                <p><strong>Business:</strong> {result.data?.businessName}</p>
                <p><strong>Area Code:</strong> {result.data?.areaCode} (Local to your zip code)</p>
                <p><strong>Location:</strong> {result.data?.location.city}, {result.data?.location.state}</p>
              </div>

              <div className="pt-4 border-t border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Next Steps:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Check your email for setup instructions</li>
                  <li>• Configure your SMS menu and pricing</li>
                  <li>• Start receiving orders via SMS!</li>
                </ul>
              </div>
            </div>

            <Button
              className="w-full mt-6"
              onClick={() => window.location.href = '/admin'}
            >
              Go to Dashboard
            </Button>
          </div>
        )}

        <div className="text-center">
          <div className="text-xs text-gray-500 space-y-1">
            <p>Supported areas: Atlanta, Marietta, Lawrenceville, Decatur, and more</p>
            <p>Local numbers help build trust with your customers</p>
          </div>
        </div>
      </div>
    </div>
  )
}