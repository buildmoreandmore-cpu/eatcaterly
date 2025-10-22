'use client'

import { useState, useEffect } from 'react'
import { Send, Users, Calendar, CheckSquare, Square, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
}

interface Menu {
  id: string
  title: string | null
  date: string
  isActive: boolean
  menuItems: MenuItem[]
}

interface Customer {
  id: string
  name: string | null
  phoneNumber: string
  email: string | null
  isActive: boolean
  totalOrders: number
}

export default function BroadcastMenuPage() {
  const router = useRouter()
  const [menus, setMenus] = useState<Menu[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedMenuId, setSelectedMenuId] = useState<string>('')
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      const [menusRes, customersRes] = await Promise.all([
        fetch('/api/menus'),
        fetch('/api/customers')
      ])

      if (menusRes.ok) {
        const menusData = await menusRes.json()
        setMenus(menusData)
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        // Filter only active customers
        setCustomers(customersData.filter((c: Customer) => c.isActive))
      }
    } catch (err) {
      setError('Failed to load data. Please try again.')
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  function toggleCustomer(customerId: string) {
    const newSet = new Set(selectedCustomerIds)
    if (newSet.has(customerId)) {
      newSet.delete(customerId)
    } else {
      newSet.add(customerId)
    }
    setSelectedCustomerIds(newSet)
  }

  function selectAll() {
    setSelectedCustomerIds(new Set(customers.map(c => c.id)))
  }

  function deselectAll() {
    setSelectedCustomerIds(new Set())
  }

  async function handleSendBroadcast() {
    if (!selectedMenuId) {
      setError('Please select a menu to broadcast')
      return
    }

    if (selectedCustomerIds.size === 0) {
      setError('Please select at least one customer')
      return
    }

    try {
      setSending(true)
      setError(null)

      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuId: selectedMenuId,
          customerIds: Array.from(selectedCustomerIds)
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setSelectedMenuId('')
        setSelectedCustomerIds(new Set())

        // Show success message for 3 seconds then redirect
        setTimeout(() => {
          router.push('/admin')
        }, 3000)
      } else {
        setError(data.error || 'Failed to send broadcast')
      }
    } catch (err) {
      setError('Failed to send broadcast. Please try again.')
      console.error('Broadcast error:', err)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Broadcast Menu</h1>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Broadcast Sent Successfully!
            </h2>
            <p className="text-gray-600 mb-4">
              Your menu has been sent to {selectedCustomerIds.size} customer{selectedCustomerIds.size !== 1 ? 's' : ''} via SMS.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    )
  }

  const selectedMenu = menus.find(m => m.id === selectedMenuId)

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Broadcast Menu</h1>
          <p className="text-gray-600">
            Select a menu and customers to send your daily specials via SMS
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Menu Selection */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold">Select Menu</h2>
          </div>

          {menus.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No menus available</p>
              <button
                onClick={() => router.push('/admin/menus')}
                className="text-blue-600 hover:underline"
              >
                Create a menu first
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  onClick={() => setSelectedMenuId(menu.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedMenuId === menu.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{menu.title || 'Untitled Menu'}</h3>
                        {menu.isActive && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(menu.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {menu.menuItems.length} item{menu.menuItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {selectedMenuId === menu.id ? (
                        <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                        </div>
                      ) : (
                        <div className="h-6 w-6 border-2 border-gray-300 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Menu Preview */}
        {selectedMenu && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold mb-3">Menu Preview</h3>
            <div className="bg-white rounded-lg p-4 space-y-2">
              {selectedMenu.menuItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start py-2 border-b last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                  </div>
                  <div className="font-bold text-gray-900 ml-4">
                    ${(item.price / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Selection */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold">Select Customers</h2>
              <span className="text-sm text-gray-500">
                ({selectedCustomerIds.size} selected)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                disabled={customers.length === 0}
                className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={deselectAll}
                disabled={selectedCustomerIds.size === 0}
                className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
              >
                Deselect All
              </button>
            </div>
          </div>

          {customers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No customers available</p>
              <button
                onClick={() => router.push('/admin/customers')}
                className="text-blue-600 hover:underline"
              >
                Add customers first
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => toggleCustomer(customer.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedCustomerIds.has(customer.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {selectedCustomerIds.has(customer.id) ? (
                        <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {customer.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {customer.phoneNumber}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {customer.totalOrders} order{customer.totalOrders !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Send Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.push('/admin')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSendBroadcast}
            disabled={!selectedMenuId || selectedCustomerIds.size === 0 || sending}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Send to {selectedCustomerIds.size} Customer{selectedCustomerIds.size !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
