'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Users, ChefHat, ShoppingCart, MessageSquare, ArrowLeft } from 'lucide-react'

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'menus' | 'orders' | 'customers' | 'sms'>('menus')

  const demoMenus = [
    {
      id: 'demo-1',
      title: "Chef Maria's Friday Special",
      date: new Date(),
      isActive: true,
      menuItems: [
        { name: 'Grilled Salmon', description: 'With lemon herbs and roasted vegetables', price: 2400, category: 'main' },
        { name: 'Pasta Primavera', description: 'Fresh seasonal vegetables in garlic sauce', price: 1800, category: 'main' },
        { name: 'Caesar Salad', description: 'Crispy romaine with house-made dressing', price: 1200, category: 'appetizer' },
        { name: 'Tiramisu', description: 'Classic Italian dessert', price: 800, category: 'dessert' },
      ]
    }
  ]

  const demoOrders = [
    { id: '1', customer: 'John Smith', phone: '470-555-8812', amount: 4200, status: 'CONFIRMED', time: '1 hour ago' },
    { id: '2', customer: 'Sarah Johnson', phone: '470-555-0747', amount: 3000, status: 'PAID', time: '2 hours ago' },
    { id: '3', customer: 'Mike Davis', phone: '678-555-0123', amount: 2400, status: 'PREPARING', time: '30 min ago' },
    { id: '4', customer: 'Emily Wilson', phone: '404-555-0156', amount: 1800, status: 'READY', time: '15 min ago' },
  ]

  const demoCustomers = [
    { name: 'John Smith', phone: '470-555-8812', orders: 9, spent: 14850 },
    { name: 'Sarah Johnson', phone: '470-555-0747', orders: 6, spent: 8700 },
    { name: 'Mike Davis', phone: '678-555-0123', orders: 4, spent: 5000 },
    { name: 'Emily Wilson', phone: '404-555-0156', orders: 4, spent: 5000 },
    { name: 'Robert Martinez', phone: '404-555-0234', orders: 5, spent: 7250 },
  ]

  const demoSMS = [
    { direction: 'out', message: "Today's menu: Grilled Salmon $24, Pasta Primavera $18, Caesar Salad $12. Reply with your order!", customer: 'John Smith', status: 'delivered' },
    { direction: 'in', message: 'I would like 1 Grilled Salmon and 1 Caesar Salad', customer: 'John Smith', status: 'received' },
    { direction: 'out', message: 'Thanks! Your order total is $36. Payment link: https://pay.eatcaterly.com/abc123', customer: 'John Smith', status: 'delivered' },
  ]

  const statusColors: Record<string, string> = {
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
    PREPARING: 'bg-purple-100 text-purple-800',
    READY: 'bg-indigo-100 text-indigo-800',
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold">🎬 Demo Mode</span>
            <span className="text-sm opacity-90">Explore the platform with sample data</span>
          </div>
          <Link href="/" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">EatCaterly Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Chef Maria's Kitchen - Demo Account</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('menus')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${
                activeTab === 'menus'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ChefHat className="h-5 w-5" />
              Menu Management
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${
                activeTab === 'orders'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${
                activeTab === 'customers'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="h-5 w-5" />
              Customers
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${
                activeTab === 'sms'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              SMS Logs
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Menus Tab */}
        {activeTab === 'menus' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Menu Management</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold">
                + Create New Menu
              </button>
            </div>

            {demoMenus.map((menu) => (
              <div key={menu.id} className="bg-white border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{menu.title}</h3>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                        Active
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {menu.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {menu.menuItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-start border-b pb-3 last:border-b-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                      <div className="font-bold text-gray-900">
                        ${(item.price / 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                  <span className="font-semibold">{menu.menuItems.length}</span> items •
                  Total: <span className="font-semibold">
                    ${(menu.menuItems.reduce((sum, item) => sum + item.price, 0) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Orders</h2>
            <div className="space-y-4">
              {demoOrders.map((order) => (
                <div key={order.id} className="bg-white border rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">{order.customer}</h3>
                      <p className="text-sm text-gray-600">{order.phone}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.time}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${(order.amount / 100).toFixed(2)}
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                        statusColors[order.status] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Customers</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold">
                + Add Customer
              </button>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {demoCustomers.map((customer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.orders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${(customer.spent / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SMS Tab */}
        {activeTab === 'sms' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">SMS Logs</h2>
            <div className="space-y-3">
              {demoSMS.map((sms, index) => (
                <div key={index} className="bg-white border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {sms.direction === 'out' ? (
                        <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">{sms.customer}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          sms.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {sms.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {sms.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Banner */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Ready to start your catering business?</h3>
          <p className="mb-6 text-orange-100">Get started with a 14-day free trial. No credit card required.</p>
          <Link
            href="/login"
            className="inline-block bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors"
          >
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </div>
  )
}
