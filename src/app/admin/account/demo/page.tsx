'use client'

import { useState } from 'react'

export default function DemoAccountPage() {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  // Demo data
  const subscription = {
    phoneNumber: '+1 (404) 555-1234',
    subscriptionStatus: 'active',
    items: [
      { description: 'Phone Number', amount: 30, interval: 'month' },
      { description: 'Starter Plan', amount: 35, interval: 'month' }
    ],
    totalMonthly: 65,
    nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  }

  const invoices = [
    {
      id: 'in_1',
      number: 'INV-0001',
      amount: 65,
      status: 'paid',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      pdfUrl: '#',
      hostedUrl: '#'
    },
    {
      id: 'in_2',
      number: 'INV-0002',
      amount: 65,
      status: 'paid',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      pdfUrl: '#',
      hostedUrl: '#'
    },
    {
      id: 'in_3',
      number: 'INV-0003',
      amount: 30,
      status: 'paid',
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      pdfUrl: '#',
      hostedUrl: '#'
    }
  ]

  function handleCancelSubscription() {
    setCancelLoading(true)
    setTimeout(() => {
      alert('Demo: Subscription would be canceled here')
      setCancelLoading(false)
      setShowCancelConfirm(false)
    }, 1000)
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Demo Mode</h3>
                <p className="text-sm text-blue-700">
                  This is a demo of the Business Account Settings page. All data shown is sample data.
                </p>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        </div>

        {/* Phone Number Section */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Phone Number</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-mono text-gray-900">{subscription.phoneNumber}</div>
              <div className="text-sm text-gray-500 mt-1">Your SMS business number</div>
            </div>
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {subscription.subscriptionStatus}
            </div>
          </div>
        </section>

        {/* Subscription Breakdown */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Subscription</h2>

          <div className="space-y-3">
            {subscription.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="text-gray-700">{item.description}</div>
                <div className="font-semibold text-gray-900">${item.amount.toFixed(2)}/{item.interval}</div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-3 text-lg font-bold text-gray-900">
              <div>Total</div>
              <div>${subscription.totalMonthly.toFixed(2)}/month</div>
            </div>
          </div>

          {/* Next Billing */}
          <div className="mt-4 text-sm text-gray-600">
            Next billing date: {new Date(subscription.nextBillingDate).toLocaleDateString()}
          </div>
        </section>

        {/* Invoices Section */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Billing History</h2>

          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div>
                  <div className="font-medium text-gray-900">{invoice.number}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(invoice.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-gray-900">${invoice.amount.toFixed(2)}</div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    {invoice.status}
                  </span>
                  <button
                    onClick={() => alert('Demo: PDF would download here')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cancel Subscription */}
        <section className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-red-900">Cancel Subscription</h2>
          <p className="text-sm text-gray-600 mb-4">
            Canceling your subscription will immediately deactivate your phone number and you will lose access to all features.
          </p>

          {!showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Cancel Subscription
            </button>
          ) : (
            <div className="bg-red-50 rounded-lg p-4 border border-red-300">
              <p className="font-semibold text-red-900 mb-3">
                Are you sure you want to cancel?
              </p>
              <p className="text-sm text-red-700 mb-4">
                This action cannot be undone. Your phone number will be released and all data will be preserved but inaccessible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 transition-colors"
                >
                  {cancelLoading ? 'Canceling...' : 'Yes, Cancel Subscription'}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelLoading}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Keep Subscription
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
