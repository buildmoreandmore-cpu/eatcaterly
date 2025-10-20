'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DemoPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin dashboard in demo mode
    router.push('/admin?demo=true')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-gray-600">Redirecting to demo dashboard...</div>
    </div>
  )
}
