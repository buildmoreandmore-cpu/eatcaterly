'use client'

import { useState, useEffect } from 'react'
import { Phone, RefreshCw, Link as LinkIcon, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface PhoneNumber {
  id: string
  phoneNumber: string
  ezTextingNumberId: string | null
  areaCode: string
  status: string
  currentBusinessId: string | null
}

interface Business {
  id: string
  businessName: string
  assignedPhoneNumber: string | null
  ezTextingNumberId: string | null
}

export default function PhoneNumberManagementPage() {
  const [phones, setPhones] = useState<PhoneNumber[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedBusiness, setSelectedBusiness] = useState<string>('')
  const [selectedPhone, setSelectedPhone] = useState<string>('')
  const [manualPhoneNumber, setManualPhoneNumber] = useState<string>('')
  const [manualPhoneId, setManualPhoneId] = useState<string>('')
  const [updatingPhoneId, setUpdatingPhoneId] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      const [phonesRes, businessesRes] = await Promise.all([
        fetch('/api/admin/sync-phone-numbers'),
        fetch('/api/admin/businesses')
      ])

      if (phonesRes.ok) {
        const data = await phonesRes.json()
        setPhones(data.phones || [])
      }

      if (businessesRes.ok) {
        const data = await businessesRes.json()
        setBusinesses(data.businesses || [])
      }
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSync() {
    try {
      setSyncing(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/admin/sync-phone-numbers', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || 'Phone numbers synced successfully')
        await loadData()
      } else {
        setError(data.error || 'Failed to sync phone numbers')
      }
    } catch (err) {
      setError('Failed to sync phone numbers')
      console.error(err)
    } finally {
      setSyncing(false)
    }
  }

  async function handleAssign() {
    if (!selectedBusiness || !selectedPhone) {
      setError('Please select both a business and a phone number')
      return
    }

    try {
      setAssigning(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/admin/assign-phone-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness,
          phoneNumber: selectedPhone
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || 'PhoneID assigned successfully')
        setSelectedBusiness('')
        setSelectedPhone('')
        await loadData()
      } else {
        setError(data.error || 'Failed to assign PhoneID')
      }
    } catch (err) {
      setError('Failed to assign PhoneID')
      console.error(err)
    } finally {
      setAssigning(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Phone Number Management</h1>
              <p className="text-gray-600">
                Sync phone numbers from EZTexting and assign PhoneIDs to businesses
              </p>
            </div>
            <a
              href="/admin/debug-sms"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              View SMS Debug Dashboard
            </a>
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-800">{success}</p>
            </div>
            <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Sync Phone Numbers */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold">Sync from EZTexting</h2>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              {syncing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Sync Phone Numbers
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Fetch all phone numbers and PhoneIDs from your EZTexting account
          </p>

          {/* Manual PhoneID Entry */}
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-semibold mb-3 text-gray-700">Or Manually Enter PhoneID</h3>
            <p className="text-sm text-gray-600 mb-3">
              If automatic sync fails, manually enter the PhoneID from EZTexting dashboard
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Phone Number (e.g., +14702562470)"
                value={manualPhoneNumber}
                onChange={(e) => setManualPhoneNumber(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 text-sm"
              />
              <input
                type="text"
                placeholder="PhoneID from EZTexting"
                value={manualPhoneId}
                onChange={(e) => setManualPhoneId(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 text-sm"
              />
            </div>
            <button
              onClick={async () => {
                if (!manualPhoneNumber || !manualPhoneId) {
                  setError('Both phone number and PhoneID are required')
                  return
                }
                try {
                  setUpdatingPhoneId(true)
                  setError(null)
                  const response = await fetch('/api/admin/update-phone-id', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      phoneNumber: manualPhoneNumber,
                      ezTextingNumberId: manualPhoneId
                    })
                  })
                  const data = await response.json()
                  if (response.ok) {
                    setSuccess(data.message)
                    setManualPhoneNumber('')
                    setManualPhoneId('')
                    await loadData()
                  } else {
                    setError(data.error)
                  }
                } catch (err) {
                  setError('Failed to update PhoneID')
                } finally {
                  setUpdatingPhoneId(false)
                }
              }}
              disabled={updatingPhoneId}
              className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 text-sm"
            >
              {updatingPhoneId ? 'Updating...' : 'Save PhoneID'}
            </button>
          </div>
        </div>

        {/* Phone Numbers List */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold">Phone Number Inventory</h2>
            <span className="text-sm text-gray-500">({phones.length} total)</span>
          </div>

          {phones.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Phone className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No phone numbers in inventory</p>
              <p className="text-sm mt-1">Click "Sync Phone Numbers" to fetch from EZTexting</p>
            </div>
          ) : (
            <div className="space-y-2">
              {phones.map((phone) => (
                <div key={phone.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{phone.phoneNumber}</div>
                      <div className="text-sm text-gray-600">
                        PhoneID: {phone.ezTextingNumberId || 'Not Set'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Area Code: {phone.areaCode} • Status: {phone.status}
                      </div>
                    </div>
                    <div className="text-right">
                      {phone.status === 'ASSIGNED' ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                          Assigned
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-semibold">
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assign PhoneID to Business */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold">Assign PhoneID to Business</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Business
              </label>
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select a business --</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.businessName}
                    {business.ezTextingNumberId ? ' ✅ (Has PhoneID)' : ' ❌ (Needs PhoneID)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Phone Number
              </label>
              <select
                value={selectedPhone}
                onChange={(e) => setSelectedPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select a phone number --</option>
                {phones
                  .filter(p => p.ezTextingNumberId)
                  .map((phone) => (
                    <option key={phone.id} value={phone.phoneNumber}>
                      {phone.phoneNumber} (PhoneID: {phone.ezTextingNumberId})
                      {phone.status === 'ASSIGNED' ? ' - Currently Assigned' : ''}
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={handleAssign}
              disabled={!selectedBusiness || !selectedPhone || assigning}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
            >
              {assigning ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <LinkIcon className="h-5 w-5" />
                  Assign PhoneID
                </>
              )}
            </button>
          </div>

          {/* Current Assignments */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-3">Current Assignments</h3>
            <div className="space-y-2">
              {businesses
                .filter(b => b.ezTextingNumberId)
                .map((business) => (
                  <div key={business.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{business.businessName}</div>
                      <div className="text-sm text-gray-600">
                        {business.assignedPhoneNumber}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      PhoneID: {business.ezTextingNumberId}
                    </div>
                  </div>
                ))}
              {businesses.filter(b => b.ezTextingNumberId).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No PhoneIDs assigned yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
