'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState, Suspense } from 'react'

interface AuthWrapperProps {
  children: React.ReactNode
}

function AuthWrapperContent({ children }: AuthWrapperProps) {
  const hasClerkKeys = typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_dummy_clerk_publishable'

  // Always call hooks but handle the result conditionally
  let clerkUser, clerkIsLoaded
  try {
    const clerkResult = useUser()
    clerkUser = hasClerkKeys ? clerkResult.user : null
    clerkIsLoaded = hasClerkKeys ? clerkResult.isLoaded : true
  } catch {
    clerkUser = null
    clerkIsLoaded = true
  }

  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for demo mode without useSearchParams during SSR
    if (typeof window !== 'undefined') {
      const demoParam = new URLSearchParams(window.location.search).get('demo')
      const authMode = localStorage.getItem('authMode')

      if (demoParam === 'true' || authMode === 'demo') {
        setIsDemoMode(true)
        setIsAuthenticated(true)
      } else if (clerkIsLoaded && clerkUser) {
        setIsDemoMode(false)
        setIsAuthenticated(true)
        // Clear any demo mode flags
        localStorage.removeItem('authMode')
      } else if (clerkIsLoaded && !clerkUser) {
        setIsAuthenticated(false)
        setIsDemoMode(false)
      }
    }
  }, [clerkUser, clerkIsLoaded])

  // Show loading while checking authentication
  if (!clerkIsLoaded && !isDemoMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // If not authenticated and not in demo mode, redirect to login
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  return (
    <div>
      {isDemoMode && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Demo Mode:</strong> You're using the demo version with sample data.
                <a href="/login" className="underline ml-1">Switch to live account</a>
              </p>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    }>
      <AuthWrapperContent>{children}</AuthWrapperContent>
    </Suspense>
  )
}

// Hook to get current auth state
export function useAuthState() {
  const hasClerkKeys = typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_dummy_clerk_publishable'

  // Always call hooks but handle the result conditionally
  let clerkUser, clerkIsLoaded
  try {
    const clerkResult = useUser()
    clerkUser = hasClerkKeys ? clerkResult.user : null
    clerkIsLoaded = hasClerkKeys ? clerkResult.isLoaded : true
  } catch {
    clerkUser = null
    clerkIsLoaded = true
  }

  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Check for demo mode without useSearchParams during SSR
    if (typeof window !== 'undefined') {
      const demoParam = new URLSearchParams(window.location.search).get('demo')
      const authMode = localStorage.getItem('authMode')

      if (demoParam === 'true' || authMode === 'demo') {
        setIsDemoMode(true)
      } else {
        setIsDemoMode(false)
      }
    }
  }, [])

  return {
    user: clerkUser,
    isLoaded: clerkIsLoaded,
    isDemoMode,
    isAuthenticated: isDemoMode || (clerkIsLoaded && !!clerkUser)
  }
}