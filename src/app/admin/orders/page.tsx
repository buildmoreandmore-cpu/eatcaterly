'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ShoppingCart,
  Search,
  Filter,
  Clock,
  User,
  Phone,
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Calendar
} from 'lucide-react'

interface OrderItem {
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  customerId: string
  menuId?: string
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'
  items: Record<string, OrderItem>
  paymentId?: string
  paymentUrl?: string
  createdAt: string
  updatedAt: string
  customer?: {
    id: string
    phoneNumber: string
    name?: string
  }
  menu?: {
    id: string
    title: string
    date: string
  }
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  READY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const statusIcons = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PAID: DollarSign,
  PREPARING: Package,
  READY: AlertCircle,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        // Demo data if API fails
        setOrders([
          {
            id: 'order-1',
            customerId: 'cust-1',
            menuId: 'menu-1',
            totalAmount: 2150,
            status: 'PAID',
            items: {
              'item-1': {
                name: 'Grilled Chicken Sandwich',
                price: 1200,
                quantity: 1
              },
              'item-2': {
                name: 'Caesar Salad',
                price: 950,
                quantity: 1
              }
            },
            paymentId: 'pi_demo_123',
            paymentUrl: 'https://demo-payment.stripe.com',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 3000000).toISOString(),
            customer: {
              id: 'cust-1',
              phoneNumber: '+1234567890',
              name: 'John Smith'
            },
            menu: {
              id: 'menu-1',
              title: "Today's Fresh Menu",
              date: new Date().toISOString().split('T')[0]
            }
          },
          {
            id: 'order-2',
            customerId: 'cust-2',
            menuId: 'menu-1',
            totalAmount: 1350,
            status: 'PREPARING',
            items: {
              'item-3': {
                name: 'Fish Tacos',
                price: 1350,
                quantity: 1
              }
            },
            paymentId: 'pi_demo_124',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            updatedAt: new Date(Date.now() - 1200000).toISOString(),
            customer: {
              id: 'cust-2',
              phoneNumber: '+1234567891',
              name: 'Sarah Johnson'
            },
            menu: {
              id: 'menu-1',
              title: "Today's Fresh Menu",
              date: new Date().toISOString().split('T')[0]
            }
          },
          {
            id: 'order-3',
            customerId: 'cust-3',
            menuId: 'menu-1',
            totalAmount: 950,
            status: 'PENDING',
            items: {
              'item-2': {
                name: 'Caesar Salad',
                price: 950,
                quantity: 1
              }
            },
            createdAt: new Date(Date.now() - 900000).toISOString(),
            updatedAt: new Date(Date.now() - 900000).toISOString(),
            customer: {
              id: 'cust-3',
              phoneNumber: '+1234567892',
              name: undefined
            },
            menu: {
              id: 'menu-1',
              title: "Today's Fresh Menu",
              date: new Date().toISOString().split('T')[0]
            }
          },
          {
            id: 'order-4',
            customerId: 'cust-1',
            menuId: 'menu-2',
            totalAmount: 1800,
            status: 'DELIVERED',
            items: {
              'item-4': {
                name: 'BBQ Burger',
                price: 1400,
                quantity: 1
              },
              'item-5': {
                name: 'Sweet Potato Fries',
                price: 400,
                quantity: 1
              }
            },
            paymentId: 'pi_demo_125',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 82800000).toISOString(),
            customer: {
              id: 'cust-1',
              phoneNumber: '+1234567890',
              name: 'John Smith'
            },
            menu: {
              id: 'menu-2',
              title: "Yesterday's Special",
              date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
            }
          },
          {
            id: 'order-5',
            customerId: 'cust-4',
            menuId: 'menu-1',
            totalAmount: 2250,
            status: 'CANCELLED',
            items: {
              'item-1': {
                name: 'Grilled Chicken Sandwich',
                price: 1200,
                quantity: 1
              },
              'item-6': {
                name: 'Chocolate Brownie',
                price: 550,
                quantity: 1
              },
              'item-7': {
                name: 'Iced Coffee',
                price: 500,
                quantity: 1
              }
            },
            createdAt: new Date(Date.now() - 600000).toISOString(),
            updatedAt: new Date(Date.now() - 300000).toISOString(),
            customer: {
              id: 'cust-4',
              phoneNumber: '+1234567893',
              name: 'Mike Wilson'
            },
            menu: {
              id: 'menu-1',
              title: "Today's Fresh Menu",
              date: new Date().toISOString().split('T')[0]
            }
          }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setOrders(orders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() }
            : order
        ))
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
      // For demo mode, update locally
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() }
          : order
      ))
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.phoneNumber.includes(searchTerm) ||
      (order.customer?.name && order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      Object.values(order.items).some(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`
  }

  const getOrderItems = (items: Record<string, OrderItem>) => {
    return Object.values(items)
  }

  const getTotalQuantity = (items: Record<string, OrderItem>) => {
    return Object.values(items).reduce((total, item) => total + item.quantity, 0)
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
            Order Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage customer orders
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <Button
            onClick={fetchOrders}
            className="inline-flex items-center"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Refresh Orders
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {orders.length}
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
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Paid Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {orders.filter(order => order.status === 'PAID' || order.status === 'PREPARING' || order.status === 'READY' || order.status === 'DELIVERED').length}
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
                <Package className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    In Progress
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {orders.filter(order => ['CONFIRMED', 'PAID', 'PREPARING', 'READY'].includes(order.status)).length}
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
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatPrice(orders.filter(order => ['PAID', 'PREPARING', 'READY', 'DELIVERED'].includes(order.status)).reduce((total, order) => total + order.totalAmount, 0))}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Orders
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders, customers, items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PAID">Paid</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('ALL')
              }}
              className="w-full"
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Orders ({filteredOrders.length} orders)
          </h3>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'No orders have been placed yet'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const StatusIcon = statusIcons[order.status]
                    const orderItems = getOrderItems(order.items)

                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id.slice(-6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.customer?.name || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {order.customer?.phoneNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {orderItems.slice(0, 2).map((item, index) => (
                              <div key={index} className="truncate max-w-40">
                                {item.quantity}x {item.name}
                              </div>
                            ))}
                            {orderItems.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{orderItems.length - 2} more
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatTimestamp(order.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order)
                                setShowOrderDetails(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                              <div className="relative group">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <div className="absolute hidden group-hover:block top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-40">
                                  {['PENDING', 'CONFIRMED', 'PAID', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']
                                    .filter(status => status !== order.status)
                                    .map(status => (
                                      <button
                                        key={status}
                                        onClick={() => updateOrderStatus(order.id, status)}
                                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                      >
                                        {status}
                                      </button>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Order Details - #{selectedOrder.id.slice(-6)}
                </h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Information</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-4">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{selectedOrder.customer?.name || 'Unknown Customer'}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {selectedOrder.customer?.phoneNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
                <div className="space-y-2">
                  {getOrderItems(selectedOrder.items).map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
                        <div className="text-sm text-gray-500">{formatPrice(item.price)} each</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Order Summary</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span>{getTotalQuantity(selectedOrder.items)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Amount:</span>
                    <span>{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Date:</span>
                    <span>{formatTimestamp(selectedOrder.createdAt)}</span>
                  </div>
                  {selectedOrder.paymentUrl && (
                    <div className="flex justify-between">
                      <span>Payment Link:</span>
                      <a href={selectedOrder.paymentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        View Payment
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <Button
                onClick={() => setShowOrderDetails(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}