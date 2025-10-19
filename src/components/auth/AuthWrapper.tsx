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

  useEffect(() => {
    setIsClient(true)
  }, [])

  // For testing, always return authenticated
  return {
    user: null,
    isLoaded: true,
    isDemoMode: false,
    isAuthenticated: isClient // Authenticated once client-side mounted
  }
}