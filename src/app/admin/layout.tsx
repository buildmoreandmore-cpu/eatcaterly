'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth, UserButton } from '@clerk/nextjs'
import AuthWrapper, { useAuthState } from '@/components/auth/AuthWrapper'
import {
  Home,
  Users,
  ChefHat,
  ShoppingCart,
  MessageSquare,
  Settings,
  LogOut,
  Building2,
  Phone,
  Ticket
} from 'lucide-react'
import { checkIsAdminEmail } from '@/lib/auth-utils'

interface AdminLayoutProps {
  children: ReactNode
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [isInDemoMode, setIsInDemoMode] = useState(false)

  const hasClerkKeys = typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_dummy_clerk_publishable'

  // Always call hooks (React rules of hooks)
  let authResult
  let clerkSignOut
  try {
    authResult = useAuth()
    clerkSignOut = hasClerkKeys ? authResult.signOut : async () => {}
  } catch {
    authResult = { user: null }
    clerkSignOut = async () => {}
  }

  const { user: authStateUser, isDemoMode } = useAuthState()

  // Use Clerk user if available, otherwise fall back to authState user
  const user = authResult.user || authStateUser

  // Check if user is admin
  const userEmail = (user as any)?.emailAddresses?.[0]?.emailAddress
  const isUserAdmin = checkIsAdminEmail(userEmail)

  // Check if we're in demo mode from URL or localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const demoParam = urlParams.get('demo') === 'true'
      const authMode = localStorage.getItem('authMode')
      setIsInDemoMode(demoParam === true || authMode === 'demo')
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const demoParam = new URLSearchParams(window.location.search).get('demo')
      const authMode = localStorage.getItem('authMode')
      setIsInDemoMode(demoParam === 'true' || authMode === 'demo')
    }
  }, [])

  const handleLogout = async () => {
    if (isDemoMode) {
      // Demo mode logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('authMode')
      }
      window.location.href = '/'
    } else {
      // Clerk logout
      await clerkSignOut()
      window.location.href = '/'
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home, adminOnly: false, businessOnly: false },
    { name: 'Customers', href: '/admin/customers', icon: Users, adminOnly: false, businessOnly: true },
    { name: 'Menu Management', href: '/admin/menus', icon: ChefHat, adminOnly: false, businessOnly: true },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, adminOnly: false, businessOnly: true },
    { name: 'SMS Logs', href: '/admin/sms', icon: MessageSquare, adminOnly: false, businessOnly: true },
    { name: 'Settings', href: '/admin/settings', icon: Settings, adminOnly: false, businessOnly: false },
    { name: 'Businesses', href: '/admin/businesses', icon: Building2, adminOnly: true, businessOnly: false },
    { name: 'Phone Inventory', href: '/admin/phone-inventory', icon: Phone, adminOnly: true, businessOnly: false },
    { name: 'Promo Codes', href: '/admin/promo-codes', icon: Ticket, adminOnly: true, businessOnly: false },
  ]

  // Filter navigation based on user role
  // Platform admins see: Dashboard, Businesses, Phone Inventory, Promo Codes, Settings
  // Business customers see: Dashboard, Customers, Menus, Orders, SMS Logs, Settings
  const filteredNavigation = navigation.filter(item => {
    if (item.adminOnly && !isUserAdmin) return false // Hide admin-only items from non-admins
    if (item.businessOnly && isUserAdmin) return false // Hide business-only items from platform admins
    return true
  })

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">SMS Food Admin</h1>
        </div>

        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              // Add demo parameter to href if in demo mode
              const href = isInDemoMode ? `${item.href}?demo=true` : item.href
              return (
                <li key={item.name}>
                  <Link
                    href={href}
                    className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-6">
            <h2 className="text-lg font-semibold text-gray-900">
              EatCaterly Admin {isDemoMode && <span className="text-yellow-600">(Demo)</span>}
            </h2>
            <div className="flex items-center space-x-4">
              {!isDemoMode && user && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {(user as any).emailAddresses?.[0]?.emailAddress || ''}
                  </span>
                  <UserButton afterSignOutUrl="/" />
                </div>
              )}
              {isDemoMode && (
                <span className="text-sm text-gray-500">
                  Demo User - {new Date().toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthWrapper>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthWrapper>
  )
}