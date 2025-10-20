'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'

interface Order {
  id: string
  customer: {
    name: string | null
    phoneNumber: string
  }
  items: any
  totalAmount: number
  status: string
  createdAt: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const isDemoMode = urlParams.get('demo') === 'true' || (typeof window !== 'undefined' && localStorage.getItem('authMode') === 'demo')

    if (isDemoMode) {
      loadDemoOrders()
    } else {
      loadOrders()
    }
  }, [])

  function loadDemoOrders() {
    const demoOrders: Order[] = [
      { id: '1', customer: { name: 'John Smith', phoneNumber: '470-555-8812' }, items: {}, totalAmount: 4200, status: 'CONFIRMED', createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: '2', customer: { name: 'Sarah Johnson', phoneNumber: '470-555-0747' }, items: {}, totalAmount: 3000, status: 'PAID', createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: '3', customer: { name: 'Mike Davis', phoneNumber: '678-555-0123' }, items: {}, totalAmount: 2400, status: 'PREPARING', createdAt: new Date(Date.now() - 1800000).toISOString() },
      { id: '4', customer: { name: 'Emily Wilson', phoneNumber: '404-555-0156' }, items: {}, totalAmount: 1800, status: 'READY', createdAt: new Date(Date.now() - 900000).toISOString() },
    ]
    setOrders(demoOrders)
    setLoading(false)
  }

  async function loadOrders() {
    try {
      setLoading(true)
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        loadOrders()
      } else {
        alert('Failed to update order status')
      }
    } catch (error) {
      alert('Failed to update order status')
    }
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status.toLowerCase() === filter)

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
    PREPARING: 'bg-purple-100 text-purple-800',
    READY: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }

  const statusOptions = ['PENDING', 'CONFIRMED', 'PAID', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Orders</h1>
        <div className="text-gray-500">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Orders</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'pending', 'confirmed', 'paid', 'preparing', 'ready', 'delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{order.customer.name || 'Unknown Customer'}</h3>
                    <p className="text-sm text-gray-600">{order.customer.phoneNumber}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${(order.totalAmount / 100).toFixed(2)}
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                      statusColors[order.status] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <label className="text-sm font-medium text-gray-700 self-center">Status:</label>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
