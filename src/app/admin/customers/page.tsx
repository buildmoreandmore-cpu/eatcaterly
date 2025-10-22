'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Trash2 } from 'lucide-react'

interface Customer {
  id: string
  name: string | null
  phoneNumber: string
  email: string | null
  isActive: boolean
  totalOrders: number
  totalSpent: number
  createdAt: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
  })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const isDemoMode = urlParams.get('demo') === 'true' || (typeof window !== 'undefined' && localStorage.getItem('authMode') === 'demo')

    if (isDemoMode) {
      loadDemoCustomers()
    } else {
      loadCustomers()
    }
  }, [])

  function loadDemoCustomers() {
    const demoCustomers: Customer[] = [
      { id: '1', name: 'John Smith', phoneNumber: '470-555-8812', email: 'john.smith@email.com', isActive: true, totalOrders: 9, totalSpent: 14850, createdAt: new Date(Date.now() - 2592000000).toISOString() },
      { id: '2', name: 'Sarah Johnson', phoneNumber: '470-555-0747', email: 'sarah.j@email.com', isActive: true, totalOrders: 6, totalSpent: 8700, createdAt: new Date(Date.now() - 1728000000).toISOString() },
      { id: '3', name: 'Mike Davis', phoneNumber: '678-555-0123', email: 'mike.d@email.com', isActive: true, totalOrders: 4, totalSpent: 5000, createdAt: new Date(Date.now() - 864000000).toISOString() },
      { id: '4', name: 'Emily Wilson', phoneNumber: '404-555-0156', email: 'emily.w@email.com', isActive: true, totalOrders: 4, totalSpent: 5000, createdAt: new Date(Date.now() - 604800000).toISOString() },
      { id: '5', name: 'Robert Martinez', phoneNumber: '404-555-0234', email: null, isActive: true, totalOrders: 5, totalSpent: 7250, createdAt: new Date(Date.now() - 1209600000).toISOString() },
    ]
    setCustomers(demoCustomers)
    setLoading(false)
  }

  async function loadCustomers() {
    try {
      setLoading(true)
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Failed to load customers:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleOpenModal() {
    setShowAddModal(true)
    setError(null)
    setFormData({ name: '', phoneNumber: '', email: '' })
  }

  function handleCloseModal() {
    setShowAddModal(false)
    setError(null)
    setFormData({ name: '', phoneNumber: '', email: '' })
  }

  async function handleAddCustomer() {
    setError(null)

    // Validate
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setShowAddModal(false)
        setFormData({ name: '', phoneNumber: '', email: '' })
        loadCustomers() // Reload customer list
      } else {
        setError(data.error || 'Failed to add customer')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Customers</h1>
        <div className="text-gray-500">Loading customers...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Customers</h1>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            <Plus className="h-5 w-5" />
            Add Customer
          </button>
        </div>

        {customers.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Customers Yet</h3>
            <p className="text-gray-600 mb-4">
              Add customers to start sending them your daily menus via SMS
            </p>
            <button
              onClick={handleOpenModal}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Add Your First Customer
            </button>
          </div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.name || 'Unknown'}
                      </div>
                      {customer.email && (
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${(customer.totalSpent / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Add New Customer</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="customer@email.com"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomer}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Customer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
