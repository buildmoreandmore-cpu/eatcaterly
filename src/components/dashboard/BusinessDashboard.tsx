'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, DollarSign, ShoppingCart, MessageSquare, Send } from 'lucide-react'

interface BusinessStats {
  totalCustomers: number
  activeCustomers: number
  totalOrders: number
  paidOrders: number
  totalRevenue: number
  todayOrders: number
  totalSMS: number
  todaySMS: number
}

export default function BusinessDashboard() {
  const [stats, setStats] = useState<BusinessStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    totalOrders: 0,
    paidOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    totalSMS: 0,
    todaySMS: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load stats from API
    loadBusinessStats()
  }, [])

  async function loadBusinessStats() {
    try {
      setLoading(false)
      // For now, using demo data
      // In production, this would fetch from /api/business/stats
    } catch (error) {
      console.error('Failed to load business stats:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold leading-7 text-gray-900 sm:text-2xl lg:text-3xl sm:tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Welcome to your SMS Food Delivery admin panel
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link href="/admin/sms">
            <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
              <Send className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Broadcast Menu</span>
              <span className="sm:hidden">Broadcast</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 sm:p-3 rounded-md bg-blue-50">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                    Total Customers
                  </dt>
                  <dd className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {stats.totalCustomers}
                  </dd>
                  <dd className="text-xs sm:text-sm text-gray-500">
                    {stats.activeCustomers} active
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 sm:p-3 rounded-md bg-green-50">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                    Total Orders
                  </dt>
                  <dd className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {stats.totalOrders}
                  </dd>
                  <dd className="text-xs sm:text-sm text-gray-500">
                    {stats.paidOrders} paid
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 sm:p-3 rounded-md bg-yellow-50">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                    Revenue
                  </dt>
                  <dd className="text-xl sm:text-2xl font-semibold text-gray-900">
                    ${(stats.totalRevenue / 100).toFixed(2)}
                  </dd>
                  <dd className="text-xs sm:text-sm text-gray-500">
                    Total earned
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 sm:p-3 rounded-md bg-purple-50">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                    Today's Orders
                  </dt>
                  <dd className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {stats.todayOrders}
                  </dd>
                  <dd className="text-xs sm:text-sm text-gray-500">
                    Orders today
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 sm:p-3 rounded-md bg-red-50">
                  <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                    SMS Messages
                  </dt>
                  <dd className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {stats.totalSMS}
                  </dd>
                  <dd className="text-xs sm:text-sm text-gray-500">
                    {stats.todaySMS} sent today
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Menu Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Today's Menu
          </h3>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No menu set for today</p>
            <Link href="/admin/menus">
              <button className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                Create Today's Menu
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/menus">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
                <div className="font-medium text-gray-900 mb-1">Manage Menus</div>
                <div className="text-sm text-gray-500">Create daily menus with calendar</div>
              </div>
            </Link>
            <Link href="/admin/customers">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
                <div className="font-medium text-gray-900 mb-1">Manage Customers</div>
                <div className="text-sm text-gray-500">Add names to phone numbers</div>
              </div>
            </Link>
            <Link href="/admin/sms">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
                <div className="font-medium text-gray-900 mb-1">Send SMS</div>
                <div className="text-sm text-gray-500">Message customers</div>
              </div>
            </Link>
            <Link href="/admin/orders">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
                <div className="font-medium text-gray-900 mb-1">View Orders</div>
                <div className="text-sm text-gray-500">Check recent orders</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
