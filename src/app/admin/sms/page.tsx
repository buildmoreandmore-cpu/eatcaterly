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
    const urlParams = new URLSearchParams(window.location.search)
    const isDemoMode = urlParams.get('demo') === 'true' || (typeof window !== 'undefined' && localStorage.getItem('authMode') === 'demo')

    if (isDemoMode) {
      loadDemoLogs()
    } else {
      setTimeout(() => {
        setLogs([])
        setLoading(false)
      }, 500)
    }
  }, [])

  function loadDemoLogs() {
    const demoLogs: SmsLog[] = [
      { id: '1', direction: 'OUTBOUND', message: "Today's menu: Grilled Salmon $24, Pasta Primavera $18, Caesar Salad $12. Reply with your order!", status: 'DELIVERED', customer: { name: 'John Smith', phoneNumber: '470-555-8812' }, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: '2', direction: 'INBOUND', message: 'I would like 1 Grilled Salmon and 1 Caesar Salad', status: 'RECEIVED', customer: { name: 'John Smith', phoneNumber: '470-555-8812' }, createdAt: new Date(Date.now() - 3300000).toISOString() },
      { id: '3', direction: 'OUTBOUND', message: 'Thanks! Your order total is $36. Payment link: https://pay.eatcaterly.com/abc123', status: 'DELIVERED', customer: { name: 'John Smith', phoneNumber: '470-555-8812' }, createdAt: new Date(Date.now() - 3000000).toISOString() },
      { id: '4', direction: 'OUTBOUND', message: "Hi! Here's today's fresh menu. Text back to order!", status: 'DELIVERED', customer: { name: 'Sarah Johnson', phoneNumber: '470-555-0747' }, createdAt: new Date(Date.now() - 7200000).toISOString() },
    ]
    setLogs(demoLogs)
    setLoading(false)
  }

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
