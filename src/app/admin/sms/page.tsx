'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, ArrowDown, ArrowUp } from 'lucide-react'

interface SmsLog {
  id: string
  direction: 'INBOUND' | 'OUTBOUND'
  message: string
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'RECEIVED'
  customer: {
    name: string | null
    phoneNumber: string
  } | null
  createdAt: string
}

export default function SMSLogsPage() {
  const [logs, setLogs] = useState<SmsLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    // Mock empty data - replace with actual API
    setTimeout(() => {
      setLogs([])
      setLoading(false)
    }, 500)
  }, [])

  const statusColors: Record<string, string> = {
    SENT: 'bg-blue-100 text-blue-800',
    DELIVERED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    RECEIVED: 'bg-purple-100 text-purple-800'
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">SMS Logs</h1>
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">SMS Logs</h1>

        <div className="flex gap-2 mb-6">
          {['all', 'sent', 'delivered', 'failed', 'received'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {logs.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <MessageSquare className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No SMS Logs</h3>
            <p className="text-gray-600">
              SMS messages will appear here once you start sending menus to customers
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {log.direction === 'OUTBOUND' ? (
                      <ArrowUp className="h-5 w-5 text-blue-600" />
                    ) : (
                      <ArrowDown className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">
                          {log.customer?.name || 'Unknown'} - {log.customer?.phoneNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        statusColors[log.status] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {log.message}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
