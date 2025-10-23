'use client'

import { useState, useEffect } from 'react'

interface PhoneNumber {
  id: string
  phoneNumber: string
  areaCode: string
  status: string
  currentBusinessId?: string
  previousBusinessId?: string
  monthlyPrice?: number
  cooldownUntil?: string
  assignedAt?: string
  releasedAt?: string
}

interface InventoryStats {
  total: number
  available: number
  assigned: number
  cooldown: number
  reserved: number
  byAreaCode: Record<string, { total: number; available: number; assigned: number }>
}

interface Business {
  id: string
  businessName: string
  email: string
  zipCode: string
  subscriptionStatus: string
}

export default function PhoneInventoryPage() {
  const [numbers, setNumbers] = useState<PhoneNumber[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [filter, setFilter] = useState({
    areaCode: '',
    status: '',
    search: '',
  })

  // Assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusinessId, setSelectedBusinessId] = useState('')
  const [assigning, setAssigning] = useState(false)

  // Reassignment modal state
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([])
  const [reassigning, setReassigning] = useState(false)
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)

  const loadNumbers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.areaCode) params.set('areaCode', filter.areaCode)
      if (filter.status) params.set('status', filter.status)
      if (filter.search) params.set('search', filter.search)

      const response = await fetch(`/api/admin/phone-numbers?${params}`)
      const data = await response.json()

      if (data.success) {
        setNumbers(data.numbers)
      }
    } catch (error) {
      console.error('Failed to load numbers:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/phone-numbers?stats=true')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const syncWithEZTexting = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/admin/phone-numbers/sync', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        alert(`Sync complete! Added: ${data.added}, Updated: ${data.updated}`)
        loadNumbers()
        loadStats()
      } else {
        alert(`Sync failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to sync:', error)
      alert('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const loadBusinessesWithoutNumbers = async () => {
    try {
      const response = await fetch('/api/admin/businesses?noPhoneNumber=true')
      const data = await response.json()

      if (data.success) {
        setBusinesses(data.businesses)
      }
    } catch (error) {
      console.error('Failed to load businesses:', error)
    }
  }

  const openAssignModal = (number: PhoneNumber) => {
    setSelectedNumber(number)
    setSelectedBusinessId('')
    setShowAssignModal(true)
    loadBusinessesWithoutNumbers()
  }

  const closeAssignModal = () => {
    setShowAssignModal(false)
    setSelectedNumber(null)
    setSelectedBusinessId('')
  }

  const assignNumber = async () => {
    if (!selectedNumber || !selectedBusinessId) {
      alert('Please select a business')
      return
    }

    setAssigning(true)
    try {
      const response = await fetch('/api/admin/phone-numbers/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumberId: selectedNumber.id,
          businessId: selectedBusinessId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`Success! ${selectedNumber.phoneNumber} assigned to ${data.business.businessName}`)
        closeAssignModal()
        loadNumbers()
        loadStats()
      } else {
        alert(`Assignment failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to assign number:', error)
      alert('Assignment failed')
    } finally {
      setAssigning(false)
    }
  }

  const loadAllBusinesses = async () => {
    try {
      const response = await fetch('/api/admin/businesses')
      const data = await response.json()

      if (data.success) {
        setAllBusinesses(data.businesses)
      }
    } catch (error) {
      console.error('Failed to load businesses:', error)
    }
  }

  const openReassignModal = async (number: PhoneNumber) => {
    setSelectedNumber(number)
    setSelectedBusinessId('')
    setShowReassignModal(true)

    // Load the current business info
    if (number.currentBusinessId) {
      try {
        const response = await fetch(`/api/admin/businesses`)
        const data = await response.json()
        if (data.success) {
          const current = data.businesses.find((b: Business) => b.id === number.currentBusinessId)
          setCurrentBusiness(current || null)
          setAllBusinesses(data.businesses.filter((b: Business) => b.id !== number.currentBusinessId))
        }
      } catch (error) {
        console.error('Failed to load businesses:', error)
      }
    }
  }

  const closeReassignModal = () => {
    setShowReassignModal(false)
    setSelectedNumber(null)
    setSelectedBusinessId('')
    setCurrentBusiness(null)
  }

  const reassignNumber = async () => {
    if (!selectedNumber || !selectedBusinessId || !currentBusiness) {
      alert('Please select a business')
      return
    }

    setReassigning(true)
    try {
      const response = await fetch('/api/admin/phone-numbers/reassign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromBusinessId: currentBusiness.id,
          toBusinessId: selectedBusinessId,
          phoneNumber: selectedNumber.phoneNumber,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`Success! ${selectedNumber.phoneNumber} reassigned from ${currentBusiness.businessName} to ${data.toBusiness.businessName}`)
        closeReassignModal()
        loadNumbers()
        loadStats()
      } else {
        alert(`Reassignment failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to reassign number:', error)
      alert('Reassignment failed')
    } finally {
      setReassigning(false)
    }
  }

  useEffect(() => {
    loadNumbers()
    loadStats()
  }, [filter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800'
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800'
      case 'COOLDOWN':
        return 'bg-yellow-100 text-yellow-800'
      case 'RESERVED':
        return 'bg-purple-100 text-purple-800'
      case 'RETIRED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Phone Number Inventory</h1>
          <button
            onClick={syncWithEZTexting}
            disabled={syncing}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {syncing ? 'Syncing...' : 'Sync with EZTexting'}
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600 mb-1">Total Numbers</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600 mb-1">Available</div>
              <div className="text-3xl font-bold text-green-600">{stats.available}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600 mb-1">Assigned</div>
              <div className="text-3xl font-bold text-blue-600">{stats.assigned}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600 mb-1">Cooldown</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.cooldown}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600 mb-1">Reserved</div>
              <div className="text-3xl font-bold text-purple-600">{stats.reserved}</div>
            </div>
          </div>
        )}

        {/* Area Code Stats */}
        {stats && Object.keys(stats.byAreaCode).length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">By Area Code</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.byAreaCode).map(([areaCode, data]) => (
                <div key={areaCode} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-lg font-bold text-gray-900 mb-2">{areaCode}</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-semibold">{data.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-semibold text-green-600">{data.available}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assigned:</span>
                      <span className="font-semibold text-blue-600">{data.assigned}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search phone number..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area Code
              </label>
              <select
                value={filter.areaCode}
                onChange={(e) => setFilter({ ...filter, areaCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Area Codes</option>
                <option value="404">404</option>
                <option value="470">470</option>
                <option value="678">678</option>
                <option value="770">770</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="COOLDOWN">Cooldown</option>
                <option value="RESERVED">Reserved</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilter({ areaCode: '', status: '', search: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Numbers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : numbers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No phone numbers found. Click "Sync with EZTexting" to import your numbers.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Area Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Released
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cooldown Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {numbers.map((number) => (
                  <tr key={number.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {number.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {number.areaCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(number.status)}`}>
                        {number.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(number.assignedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(number.releasedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(number.cooldownUntil)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {number.monthlyPrice ? `$${number.monthlyPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {number.status === 'AVAILABLE' && (
                        <button
                          onClick={() => openAssignModal(number)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Assign
                        </button>
                      )}
                      {number.status === 'ASSIGNED' && (
                        <button
                          onClick={() => openReassignModal(number)}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Reassign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Results Count */}
        {!loading && numbers.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {numbers.length} number{numbers.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Assign Number Modal */}
        {showAssignModal && selectedNumber && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Assign Phone Number
              </h2>

              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-1">Phone Number</div>
                  <div className="text-xl font-bold text-gray-900">
                    {selectedNumber.phoneNumber}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Area Code: {selectedNumber.areaCode}
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Business (without phone number)
                </label>
                <select
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a business...</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.businessName} - {business.email} ({business.zipCode})
                    </option>
                  ))}
                </select>

                {businesses.length === 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    No businesses without phone numbers found.
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeAssignModal}
                  disabled={assigning}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={assignNumber}
                  disabled={!selectedBusinessId || assigning}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {assigning ? 'Assigning...' : 'Assign Number'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reassign Number Modal */}
        {showReassignModal && selectedNumber && currentBusiness && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Reassign Phone Number
              </h2>

              <div className="mb-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-1">Phone Number</div>
                  <div className="text-xl font-bold text-gray-900">
                    {selectedNumber.phoneNumber}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Area Code: {selectedNumber.areaCode}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-1">Currently Assigned To</div>
                  <div className="font-bold text-gray-900">{currentBusiness.businessName}</div>
                  <div className="text-sm text-gray-500">{currentBusiness.email}</div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reassign To (different business)
                </label>
                <select
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Choose a business...</option>
                  {allBusinesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.businessName} - {business.email} ({business.zipCode})
                    </option>
                  ))}
                </select>

                {allBusinesses.length === 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    No other businesses found.
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeReassignModal}
                  disabled={reassigning}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={reassignNumber}
                  disabled={!selectedBusinessId || reassigning}
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {reassigning ? 'Reassigning...' : 'Reassign Number'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
