import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import {
  Users,
  DollarSign,
  ShoppingCart,
  MessageSquare,
  Phone,
  Settings,
  Menu as MenuIcon
} from 'lucide-react'

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

async function getBusinessStats(businessId: string): Promise<BusinessStats> {
  try {
    const now = new Date()
    const startOfToday = new Date(now.setHours(0, 0, 0, 0))

    const [totalCustomers, totalOrders, totalSMS, todayOrders, todaySMS, paidOrders] = await Promise.all([
      prisma.customer.count({ where: { businessId } }),
      prisma.order.count({ where: { businessId } }),
      prisma.smsLog.count(),
      prisma.order.count({ where: { businessId, createdAt: { gte: startOfToday } } }),
      prisma.smsLog.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.count({ where: { businessId, status: 'PAID' } })
    ])

    // Calculate total revenue from paid orders
    const paidOrdersData = await prisma.order.findMany({
      where: { businessId, status: 'PAID' },
      select: { total: true }
    })
    const totalRevenue = paidOrdersData.reduce((sum, order) => sum + order.total, 0)

    return {
      totalCustomers,
      activeCustomers: totalCustomers,
      totalOrders,
      paidOrders,
      totalRevenue,
      todayOrders,
      totalSMS,
      todaySMS
    }
  } catch (error) {
    console.error('Failed to fetch business stats:', error)
    return {
      totalCustomers: 0,
      activeCustomers: 0,
      totalOrders: 0,
      paidOrders: 0,
      totalRevenue: 0,
      todayOrders: 0,
      totalSMS: 0,
      todaySMS: 0
    }
  }
}

async function getTodaysMenu(businessId: string) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const menu = await prisma.menu.findFirst({
      where: {
        businessId,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        menuItems: true
      }
    })

    return menu
  } catch (error) {
    console.error('Failed to fetch todays menu:', error)
    return null
  }
}

async function getBusinessByEmail(email: string) {
  try {
    const business = await prisma.businessCustomer.findUnique({
      where: { contactEmail: email }
    })
    return business
  } catch (error) {
    console.error('Failed to fetch business:', error)
    return null
  }
}

export default async function BusinessDashboard() {
  // Get current user from Clerk
  const user = await currentUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to view your dashboard.</p>
        </div>
      </div>
    )
  }

  // Get user's primary email
  const email = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Not Found</h2>
          <p className="text-gray-600">Unable to retrieve your email address.</p>
        </div>
      </div>
    )
  }

  // Fetch business data
  const business = await getBusinessByEmail(email)

  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Business Found</h2>
          <p className="text-gray-600 mb-4">
            We couldn't find a business account associated with {email}.
          </p>
          <Link
            href="/onboarding"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Complete Onboarding
          </Link>
        </div>
      </div>
    )
  }

  // Fetch business stats and menu
  const [stats, todaysMenu] = await Promise.all([
    getBusinessStats(business.id),
    getTodaysMenu(business.id)
  ])

  const statsCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      subtitle: `${stats.activeCustomers} active`,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      href: '/admin/customers'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      subtitle: `${stats.todayOrders} today`,
      icon: ShoppingCart,
      color: 'bg-purple-50 text-purple-600',
      href: '/admin/orders'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.totalRevenue / 100).toFixed(2)}`,
      subtitle: `${stats.paidOrders} paid orders`,
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
      href: '/admin/orders'
    },
    {
      title: 'SMS Sent',
      value: stats.totalSMS,
      subtitle: `${stats.todaySMS} today`,
      icon: MessageSquare,
      color: 'bg-red-50 text-red-600',
      href: '/admin/sms'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Welcome back, {business.businessName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your business today
          </p>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-1" />
            <span className="font-mono">{business.assignedPhoneNumber}</span>
            {business.city && business.state && (
              <span className="ml-2 text-gray-400">
                • {business.city}, {business.state}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-md ${stat.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.title}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stat.value}
                        </dd>
                        <dd className="text-sm text-gray-500">
                          {stat.subtitle}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Today's Menu */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Today's Menu
            </h3>
            <Link
              href="/admin/menus"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Manage Menus →
            </Link>
          </div>
          {!todaysMenu ? (
            <div className="text-center py-8 text-gray-500">
              <MenuIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No menu set for today</p>
              <Link
                href="/admin/menus"
                className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
              >
                Create Today's Menu
              </Link>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">{todaysMenu.name}</h4>
                {todaysMenu.description && (
                  <p className="text-sm text-gray-600 mt-1">{todaysMenu.description}</p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {todaysMenu.menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-gray-900">{item.name}</h5>
                        {item.description && (
                          <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        ${(item.price / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/customers">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
                <Users className="h-6 w-6 text-blue-600 mb-2" />
                <div className="font-medium text-gray-900">Customers</div>
                <div className="text-sm text-gray-500">View customer database</div>
              </div>
            </Link>
            <Link href="/admin/menus">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
                <MenuIcon className="h-6 w-6 text-purple-600 mb-2" />
                <div className="font-medium text-gray-900">Menu Management</div>
                <div className="text-sm text-gray-500">Update daily menu</div>
              </div>
            </Link>
            <Link href="/admin/orders">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
                <ShoppingCart className="h-6 w-6 text-green-600 mb-2" />
                <div className="font-medium text-gray-900">Orders</div>
                <div className="text-sm text-gray-500">Manage incoming orders</div>
              </div>
            </Link>
            <Link href="/admin/sms">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
                <MessageSquare className="h-6 w-6 text-red-600 mb-2" />
                <div className="font-medium text-gray-900">SMS Logs</div>
                <div className="text-sm text-gray-500">Track message delivery</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Account Information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <div className="text-sm text-gray-500">Subscription Status</div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    business.subscriptionStatus === 'active'
                      ? 'bg-green-100 text-green-800'
                      : business.subscriptionStatus === 'trial'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {business.subscriptionStatus}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Current Plan</div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {business.subscriptionTier ? (
                  <span className="capitalize">{business.subscriptionTier}</span>
                ) : (
                  <span className="text-gray-400">Not selected</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Account Actions</div>
              <div className="mt-1">
                <Link
                  href="/admin/account"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Manage Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
