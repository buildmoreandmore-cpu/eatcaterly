'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Business {
  id: string
  businessName: string
  email: string
  zipCode: string
  assignedPhoneNumber?: string
  ezTextingNumberId?: string
  subscriptionStatus: string
  subscriptionTier?: string
  createdAt: string
  updatedAt: string
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    hasPhoneNumber: 'all', // 'all', 'yes', 'no'
    search: '',
  })

  const loadBusinesses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.hasPhoneNumber === 'no') {
        params.set('noPhoneNumber', 'true')
      }

      const response = await fetch(`/api/admin/businesses?${params}`)
      const data = await response.json()

      if (data.success) {
        let filtered = data.businesses

        // Client-side filtering
        if (filter.hasPhoneNumber === 'yes') {
          filtered = filtered.filter((b: Business) => b.assignedPhoneNumber)
        }

        if (filter.search) {
          const search = filter.search.toLowerCase()
          filtered = filtered.filter(
            (b: Business) =>
              b.businessName.toLowerCase().includes(search) ||
              b.email.toLowerCase().includes(search) ||
              b.assignedPhoneNumber?.includes(search)
          )
        }

        setBusinesses(filtered)
      }
    } catch (error) {
      console.error('Failed to load businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBusinesses()
  }, [filter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'TRIAL':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const stats = {
    total: businesses.length,
    withPhone: businesses.filter((b) => b.assignedPhoneNumber).length,
    withoutPhone: businesses.filter((b) => !b.assignedPhoneNumber).length,
    active: businesses.filter((b) => b.subscriptionStatus === 'ACTIVE').length,
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Businesses</h1>
            <p className="text-gray-600 mt-1">Manage all business accounts</p>
          </div>
          <Link
            href="/admin/phone-inventory"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Phone Inventory
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Total Businesses</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">With Phone Number</div>
            <div className="text-3xl font-bold text-green-600">{stats.withPhone}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Without Phone Number</div>
            <div className="text-3xl font-bold text-red-600">{stats.withoutPhone}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Active Subscriptions</div>
            <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search business, email, or phone..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number Status
              </label>
              <select
                value={filter.hasPhoneNumber}
                onChange={(e) => setFilter({ ...filter, hasPhoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Businesses</option>
                <option value="yes">Has Phone Number</option>
                <option value="no">No Phone Number</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilter({ hasPhoneNumber: 'all', search: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Businesses Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : businesses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No businesses found.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zip Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {businesses.map((business) => (
                  <tr key={business.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {business.businessName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {business.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {business.assignedPhoneNumber ? (
                        <span className="text-green-600 font-medium">
                          {business.assignedPhoneNumber}
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">No phone number</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {business.zipCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          business.subscriptionStatus
                        )}`}
                      >
                        {business.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {business.subscriptionTier || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(business.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Results Count */}
        {!loading && businesses.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {businesses.length} business{businesses.length !== 1 ? 'es' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
