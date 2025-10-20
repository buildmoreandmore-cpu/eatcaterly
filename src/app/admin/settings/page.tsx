'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to account page which has all the settings
    router.push('/admin/account')
  }, [router])

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <div className="text-gray-500">Redirecting...</div>
      </div>
    </div>
  )
}
