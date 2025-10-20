'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState, Suspense } from 'react'

interface AuthWrapperProps {
  children: React.ReactNode
}

function AuthWrapperContent({ children }: AuthWrapperProps) {
  const [isClient, setIsClient] = useState(false)

  // Wait for client-side mount to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // During SSR and initial render, just show children without auth checks
  // Middleware already handles route protection
  if (!isClient) {
    return <>{children}</>
  }

  // On client, just render children - middleware handles auth
  return <>{children}</>
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
  const [isClient, setIsClient] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Check for demo mode
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const demoParam = urlParams.get('demo') === 'true'
      const demoStorage = localStorage.getItem('authMode') === 'demo'
      setIsDemoMode(demoParam || demoStorage)
    }
  }, [])

  // For testing, always return authenticated
  return {
    user: null,
    isLoaded: true,
    isDemoMode,
    isAuthenticated: isClient // Authenticated once client-side mounted
  }
}