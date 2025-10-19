import { prisma } from '@/lib/db'
import { isAdmin } from '@/lib/auth-utils.server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  DollarSign,
  TrendingUp,
  Phone,
  MessageSquare,
  ShoppingCart,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

interface PlatformStats {
  totalBusinesses: number
  activeSubscriptions: number
  trialSubscriptions: number
  cancelledSubscriptions: number
  estimatedMRR: number
  todayRevenue: number
  weekRevenue: number
  newSignupsThisWeek: number
  totalOrders: number
  todayOrders: number
  totalSMS: number
  todaySMS: number
  phoneNumbersTotal: number
  phoneNumbersAvailable: number
  phoneNumbersAssigned: number
}

interface BusinessActivity {
  id: string
  businessName: string
  contactEmail: string
  subscriptionStatus: string
  subscriptionTier: string | null
  totalOrders: number
  totalSMS: number
  lastActive: Date | null
  createdAt: Date
}

async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const now = new Date()
    const startOfToday = new Date(now.setHours(0, 0, 0, 0))
    const startOfWeek = new Date(now.setDate(now.getDate() - 7))

    const [
      totalBusinesses,
      activeSubscriptions,
      trialSubscriptions,
      cancelledSubscriptions,
      starterCount,
      proCount,
      newSignupsThisWeek,
      totalOrders,
      todayOrders,
      totalSMS,
      todaySMS,
      phoneInventory
    ] = await Promise.all([
      prisma.businessCustomer.count(),
      prisma.businessCustomer.count({ where: { subscriptionStatus: 'active' } }),
      prisma.businessCustomer.count({ where: { subscriptionStatus: 'trial' } }),
      prisma.businessCustomer.count({ where: { subscriptionStatus: 'cancelled' } }),
      prisma.businessCustomer.count({ where: { subscriptionTier: 'starter', subscriptionStatus: { in: ['active', 'trial'] } } }),
      prisma.businessCustomer.count({ where: { subscriptionTier: 'pro', subscriptionStatus: { in: ['active', 'trial'] } } }),
      prisma.businessCustomer.count({
        where: {
          createdAt: { gte: startOfWeek }
        }
      }),
      prisma.order.count(),
      prisma.order.count({
        where: { createdAt: { gte: startOfToday } }
      }),
      prisma.smsLog.count(),
      prisma.smsLog.count({
        where: { createdAt: { gte: startOfToday } }
      }),
      prisma.phoneNumberInventory.groupBy({
        by: ['status'],
        _count: true
      })
    ])

    // Estimate MRR based on subscription tiers
    // Starter: $65/month, Pro: $125/month
    const estimatedMRR = (starterCount * 65) + (proCount * 125)

    // Estimate revenue (simplified - in reality you'd query Stripe)
    const todayRevenue = todayOrders * 0 // Orders are from end customers, not subscription revenue
    const weekRevenue = 0 // Would need to query Stripe for actual subscription revenue

    // Phone inventory stats
    const phoneNumbersTotal = phoneInventory.reduce((acc, group) => acc + group._count, 0)
    const phoneNumbersAvailable = phoneInventory.find(g => g.status === 'AVAILABLE')?._count || 0
    const phoneNumbersAssigned = phoneInventory.find(g => g.status === 'ASSIGNED')?._count || 0

    return {
      totalBusinesses,
      activeSubscriptions,
      trialSubscriptions,
      cancelledSubscriptions,
      estimatedMRR,
      todayRevenue,
      weekRevenue,
      newSignupsThisWeek,
      totalOrders,
      todayOrders,
      totalSMS,
      todaySMS,
      phoneNumbersTotal,
      phoneNumbersAvailable,
      phoneNumbersAssigned
    }
  } catch (error) {
    console.error('Failed to fetch platform stats:', error)
    // Return demo data if database fails
    return {
      totalBusinesses: 0,
      activeSubscriptions: 0,
      trialSubscriptions: 0,
      cancelledSubscriptions: 0,
      estimatedMRR: 0,
      todayRevenue: 0,
      weekRevenue: 0,
      newSignupsThisWeek: 0,
      totalOrders: 0,
      todayOrders: 0,
      totalSMS: 0,
      todaySMS: 0,
      phoneNumbersTotal: 0,
      phoneNumbersAvailable: 0,
      phoneNumbersAssigned: 0
    }
  }
}

async function getRecentBusinessActivity(): Promise<BusinessActivity[]> {
  try {
    const businesses = await prisma.businessCustomer.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        businessName: true,
        contactEmail: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          select: { id: true },
          take: 1
        }
      }
    })

    return await Promise.all(
      businesses.map(async (business) => {
        const [orderCount, smsCount, lastOrder] = await Promise.all([
          prisma.order.count({ where: { businessId: business.id } }),
          prisma.smsLog.count(),
          prisma.order.findFirst({
            where: { businessId: business.id },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true }
          })
        ])

        return {
          id: business.id,
          businessName: business.businessName,
          contactEmail: business.contactEmail,
          subscriptionStatus: business.subscriptionStatus,
          subscriptionTier: business.subscriptionTier,
          totalOrders: orderCount,
          totalSMS: smsCount,
          lastActive: lastOrder?.createdAt || null,
          createdAt: business.createdAt
        }
      })
    )
  } catch (error) {
    console.error('Failed to fetch business activity:', error)
    return []
  }
}

export default async function AdminDashboard() {
  // Check if user is admin - if not, show customer dashboard
  const userIsAdmin = await isAdmin()

  if (!userIsAdmin) {
    // Redirect to customer dashboard (account page)
    redirect('/admin/account')
  }

  const stats = await getPlatformStats()
  const recentActivity = await getRecentBusinessActivity()

  const statsCards = [
    {
      title: 'Total Businesses',
      value: stats.totalBusinesses,
      subtitle: `${stats.newSignupsThisWeek} new this week`,
      icon: Building2,
      color: 'bg-blue-50 text-blue-600',
      href: '/admin/businesses'
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      subtitle: `${stats.trialSubscriptions} trials`,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
      href: '/admin/businesses'
    },
    {
      title: 'Estimated MRR',
      value: `$${stats.estimatedMRR.toLocaleString()}`,
      subtitle: 'Monthly recurring revenue',
      icon: DollarSign,
      color: 'bg-yellow-50 text-yellow-600',
      href: '/admin/businesses'
    },
    {
      title: 'Platform Orders',
      value: stats.totalOrders.toLocaleString(),
      subtitle: `${stats.todayOrders} today`,
      icon: ShoppingCart,
      color: 'bg-purple-50 text-purple-600',
      href: '/admin/businesses'
    },
    {
      title: 'SMS Messages',
      value: stats.totalSMS.toLocaleString(),
      subtitle: `${stats.todaySMS} today`,
      icon: MessageSquare,
      color: 'bg-red-50 text-red-600',
      href: '/admin/businesses'
    },
    {
      title: 'Phone Numbers',
      value: stats.phoneNumbersTotal,
      subtitle: `${stats.phoneNumbersAvailable} available`,
      icon: Phone,
      color: 'bg-indigo-50 text-indigo-600',
      href: '/admin/phone-inventory'
    }
  ]

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      trial: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getActivityScore = (business: BusinessActivity) => {
    if (!business.lastActive) return 'Inactive'
    const daysSinceActive = Math.floor(
      (Date.now() - business.lastActive.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceActive === 0) return 'Active today'
    if (daysSinceActive === 1) return 'Active yesterday'
    if (daysSinceActive <= 7) return `Active ${daysSinceActive}d ago`
    if (daysSinceActive <= 30) return `Active ${Math.floor(daysSinceActive / 7)}w ago`
    return 'Inactive'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Platform Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor your EatCaterly platform performance and business health
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Subscription Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Subscription Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Active</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {stats.activeSubscriptions}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Trial</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {stats.trialSubscriptions}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Cancelled</span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {stats.cancelledSubscriptions}
              </span>
            </div>
            {stats.cancelledSubscriptions > 0 && stats.totalBusinesses > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    Churn rate: {((stats.cancelledSubscriptions / stats.totalBusinesses) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Phone Inventory Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Total Numbers</span>
              <span className="text-2xl font-bold text-gray-900">
                {stats.phoneNumbersTotal}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Available</span>
              <span className="text-2xl font-bold text-green-600">
                {stats.phoneNumbersAvailable}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Assigned</span>
              <span className="text-2xl font-bold text-blue-600">
                {stats.phoneNumbersAssigned}
              </span>
            </div>
            {stats.phoneNumbersAvailable < 5 && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-600 font-medium">
                    Low inventory! Order more numbers
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Business Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Business Activity
            </h3>
            <Link
              href="/admin/businesses"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all →
            </Link>
          </div>
          {recentActivity.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No businesses yet. Waiting for first signup!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentActivity.map((business) => (
                    <tr key={business.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {business.businessName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {business.contactEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                            business.subscriptionStatus
                          )}`}
                        >
                          {business.subscriptionStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {business.subscriptionTier || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {business.totalOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getActivityScore(business)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {business.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Admin Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/businesses">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
                <Building2 className="h-6 w-6 text-blue-600 mb-2" />
                <div className="font-medium text-gray-900">Manage Businesses</div>
                <div className="text-sm text-gray-500">View all customer accounts</div>
              </div>
            </Link>
            <Link href="/admin/phone-inventory">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
                <Phone className="h-6 w-6 text-indigo-600 mb-2" />
                <div className="font-medium text-gray-900">Phone Inventory</div>
                <div className="text-sm text-gray-500">Manage phone numbers</div>
              </div>
            </Link>
            <Link href="/admin/promo-codes">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
                <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
                <div className="font-medium text-gray-900">Promo Codes</div>
                <div className="text-sm text-gray-500">Create special offers</div>
              </div>
            </Link>
            <Link href="/admin/account">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
                <Users className="h-6 w-6 text-purple-600 mb-2" />
                <div className="font-medium text-gray-900">My Account</div>
                <div className="text-sm text-gray-500">View your business account</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
