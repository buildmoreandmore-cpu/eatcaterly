import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import {
  Users,
  ShoppingCart,
  DollarSign,
  MessageSquare,
  Send,
  TrendingUp
} from 'lucide-react'

async function getDashboardStats() {
  const [
    totalCustomers,
    activeCustomers,
    totalOrders,
    paidOrders,
    totalRevenue,
    todaysOrders,
    smsCount
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PAID' } }),
    prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true }
    }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.smsLog.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
  ])

  return {
    totalCustomers,
    activeCustomers,
    totalOrders,
    paidOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    todaysOrders,
    smsCount
  }
}

async function getTodaysMenu() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const menu = await prisma.menu.findFirst({
    where: { date: today },
    include: {
      menuItems: {
        where: { isAvailable: true },
        orderBy: { name: 'asc' }
      }
    }
  })

  return menu
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()
  const todaysMenu = await getTodaysMenu()

  const statsCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      subtitle: `${stats.activeCustomers} active`,
      icon: Users,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      subtitle: `${stats.paidOrders} paid`,
      icon: ShoppingCart,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Revenue',
      value: `$${(stats.totalRevenue / 100).toFixed(2)}`,
      subtitle: 'Total earned',
      icon: DollarSign,
      color: 'bg-yellow-50 text-yellow-600'
    },
    {
      title: 'Today\'s Orders',
      value: stats.todaysOrders,
      subtitle: 'Orders today',
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'SMS Messages',
      value: stats.smsCount,
      subtitle: 'Sent today',
      icon: MessageSquare,
      color: 'bg-red-50 text-red-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to your SMS Food Delivery admin panel
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <form action="/api/sms/broadcast" method="POST">
            <Button type="submit" className="inline-flex items-center">
              <Send className="mr-2 h-4 w-4" />
              Broadcast Menu
            </Button>
          </form>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white overflow-hidden shadow rounded-lg">
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
          )
        })}
      </div>

      {/* Today's Menu */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Today's Menu
          </h3>
          {todaysMenu ? (
            <div>
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">{todaysMenu.title}</h4>
                <p className="text-sm text-gray-500">
                  {todaysMenu.date.toLocaleDateString()} • {todaysMenu.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {todaysMenu.menuItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-gray-900">{item.name}</h5>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        {item.category && (
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mt-2">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${(item.price / 100).toFixed(2)}
                        </p>
                        <p className={`text-xs ${item.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No menu set for today</p>
              <Button className="mt-4">
                Create Today's Menu
              </Button>
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
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Create Menu</div>
                <div className="text-sm text-gray-500">Set up today's offerings</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">View Orders</div>
                <div className="text-sm text-gray-500">Check recent orders</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Send SMS</div>
                <div className="text-sm text-gray-500">Message customers</div>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Reports</div>
                <div className="text-sm text-gray-500">View analytics</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}