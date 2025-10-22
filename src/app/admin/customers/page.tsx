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
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold">
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
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">
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
      </div>
    </div>
  )
}
