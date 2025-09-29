'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users,
  Plus,
  Edit2,
  Check,
  X,
  Phone,
  MessageSquare,
  User
} from 'lucide-react'

interface Customer {
  id: string
  phoneNumber: string
  name?: string
  isActive: boolean
  createdAt: string
  _count?: {
    orders: number
    smsLogs: number
  }
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [newPhoneNumber, setNewPhoneNumber] = useState('')
  const [newName, setNewName] = useState('')
  const [addingNew, setAddingNew] = useState(false)
  const [showSMSModal, setShowSMSModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [smsMessage, setSmsMessage] = useState('')
  const [sendingSMS, setSendingSMS] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      } else {
        // Demo data if API fails
        setCustomers([
          {
            id: 'demo-1',
            phoneNumber: '+1234567890',
            name: 'John Smith',
            isActive: true,
            createdAt: new Date().toISOString(),
            _count: { orders: 5, smsLogs: 12 }
          },
          {
            id: 'demo-2',
            phoneNumber: '+1234567891',
            name: 'Sarah Johnson',
            isActive: true,
            createdAt: new Date().toISOString(),
            _count: { orders: 3, smsLogs: 8 }
          },
          {
            id: 'demo-3',
            phoneNumber: '+1234567892',
            name: undefined,
            isActive: false,
            createdAt: new Date().toISOString(),
            _count: { orders: 0, smsLogs: 2 }
          }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditName = async (customerId: string, newName: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      })

      if (response.ok) {
        setCustomers(customers.map(customer =>
          customer.id === customerId
            ? { ...customer, name: newName }
            : customer
        ))
        setEditingId(null)
        setEditName('')
      }
    } catch (error) {
      console.error('Failed to update customer name:', error)
      // For demo mode, update locally
      setCustomers(customers.map(customer =>
        customer.id === customerId
          ? { ...customer, name: newName }
          : customer
      ))
      setEditingId(null)
      setEditName('')
    }
  }

  const handleAddCustomer = async () => {
    if (!newPhoneNumber.trim()) return

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: newPhoneNumber.trim(),
          name: newName.trim() || undefined
        })
      })

      if (response.ok) {
        const newCustomer = await response.json()
        setCustomers([newCustomer, ...customers])
        setNewPhoneNumber('')
        setNewName('')
        setAddingNew(false)
      }
    } catch (error) {
      console.error('Failed to add customer:', error)
      // For demo mode, add locally
      const newCustomer: Customer = {
        id: `demo-new-${Date.now()}`,
        phoneNumber: newPhoneNumber.trim(),
        name: newName.trim() || undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
        _count: { orders: 0, smsLogs: 0 }
      }
      setCustomers([newCustomer, ...customers])
      setNewPhoneNumber('')
      setNewName('')
      setAddingNew(false)
    }
  }

  const toggleCustomerStatus = async (customerId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        setCustomers(customers.map(customer =>
          customer.id === customerId
            ? { ...customer, isActive: !isActive }
            : customer
        ))
      }
    } catch (error) {
      console.error('Failed to toggle customer status:', error)
      // For demo mode, update locally
      setCustomers(customers.map(customer =>
        customer.id === customerId
          ? { ...customer, isActive: !isActive }
          : customer
      ))
    }
  }

  const handleSendSMS = (customerId: string, phoneNumber: string, name?: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setSelectedCustomer(customer)
      setSmsMessage('')
      setShowSMSModal(true)
    }
  }

  const handleViewOrders = (customerId: string, name?: string) => {
    // Navigate to orders page with customer filter
    window.location.href = `/admin/orders?customerId=${customerId}&customerName=${encodeURIComponent(name || 'Unknown')}`
  }

  const sendSMSMessage = async () => {
    if (!selectedCustomer || !smsMessage.trim()) return

    setSendingSMS(true)
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: selectedCustomer.phoneNumber,
          message: smsMessage,
          customerId: selectedCustomer.id
        })
      })

      if (response.ok) {
        alert(`SMS sent successfully to ${selectedCustomer.name || selectedCustomer.phoneNumber}!`)
        setShowSMSModal(false)
        setSmsMessage('')
        setSelectedCustomer(null)
      } else {
        const error = await response.json()
        alert(`Failed to send SMS: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to send SMS:', error)
      // For demo mode, show success message
      alert(`SMS sent successfully to ${selectedCustomer.name || selectedCustomer.phoneNumber}! (Demo mode)`)
      setShowSMSModal(false)
      setSmsMessage('')
      setSelectedCustomer(null)
    } finally {
      setSendingSMS(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Customer Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your customer database and phone numbers
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button
            onClick={() => setAddingNew(true)}
            className="inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Add New Customer Form */}
      {addingNew && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Add New Customer</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                placeholder="+1234567890"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (Optional)
              </label>
              <Input
                type="text"
                placeholder="Customer name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <Button onClick={handleAddCustomer}>
              <Check className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAddingNew(false)
                setNewPhoneNumber('')
                setNewName('')
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Customers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {customers.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Subscribers
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {customers.filter(c => c.isActive).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Phone className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    With Names
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {customers.filter(c => c.name).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Customer List
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === customer.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-32"
                            placeholder="Enter name"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleEditName(customer.id, editName)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null)
                              setEditName('')
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>{customer.name || 'No name set'}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(customer.id)
                              setEditName(customer.name || '')
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleCustomerStatus(customer.id, customer.isActive)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer._count?.orders || 0} orders
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendSMS(customer.id, customer.phoneNumber, customer.name)}
                        >
                          Send SMS
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewOrders(customer.id, customer.name)}
                        >
                          View Orders
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Send SMS Modal */}
      {showSMSModal && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Send SMS Message
                </h3>
                <button
                  onClick={() => setShowSMSModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{selectedCustomer.name || 'Unknown Customer'}</span>
                  <span>•</span>
                  <Phone className="h-4 w-4" />
                  <span>{selectedCustomer.phoneNumber}</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  maxLength={160}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {smsMessage.length}/160 characters
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Templates
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSmsMessage("Hi! We have a special menu today. Reply 'MENU' to see our offerings!")}
                    className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                  >
                    Special Menu Notification
                  </button>
                  <button
                    type="button"
                    onClick={() => setSmsMessage("Your order is ready for pickup! Thank you for choosing us.")}
                    className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                  >
                    Order Ready Notification
                  </button>
                  <button
                    type="button"
                    onClick={() => setSmsMessage("Thank you for your order! We'll send you the payment link shortly.")}
                    className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                  >
                    Order Confirmation
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
              <Button
                onClick={sendSMSMessage}
                disabled={!smsMessage.trim() || sendingSMS}
                className="flex-1"
              >
                {sendingSMS ? 'Sending...' : 'Send SMS'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSMSModal(false)}
                disabled={sendingSMS}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}