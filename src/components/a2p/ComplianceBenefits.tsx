import React from 'react'

export default function ComplianceBenefits() {
  const benefits = [
    {
      icon: '📈',
      title: 'Higher Delivery Rates',
      description: 'A2P-registered messages have up to 99% delivery success rate.',
      metric: '99%',
      metricLabel: 'Delivery Rate'
    },
    {
      icon: '⚡',
      title: 'Faster Message Speed',
      description: 'Compliant messages are prioritized for faster delivery.',
      metric: '<2s',
      metricLabel: 'Delivery Time'
    },
    {
      icon: '🛡️',
      title: 'Brand Protection',
      description: 'Verified sender identity protects against spoofing.',
      metric: '100%',
      metricLabel: 'Brand Security'
    },
    {
      icon: '📊',
      title: 'Better Analytics',
      description: 'Enhanced reporting and delivery insights for registered senders.',
      metric: 'Real-time',
      metricLabel: 'Reporting'
    }
  ]

  const features = [
    {
      category: 'Delivery & Performance',
      items: [
        'Guaranteed message delivery',
        'Priority routing through carriers',
        'Reduced spam filtering',
        'Enhanced delivery reporting',
        'Real-time delivery status'
      ]
    },
    {
      category: 'Brand & Trust',
      items: [
        'Verified sender identity',
        'Brand name display',
        'Trusted message source',
        'Customer confidence',
        'Professional appearance'
      ]
    },
    {
      category: 'Compliance & Legal',
      items: [
        'TCPA compliance support',
        'Carrier requirement adherence',
        'Legal protection',
        'Audit trail maintenance',
        'Regulatory updates'
      ]
    }
  ]

  const stats = [
    {
      number: '98%',
      label: 'Customer Reach',
      description: 'of messages reach intended recipients'
    },
    {
      number: '3x',
      label: 'Response Rate',
      description: 'higher engagement from verified messages'
    },
    {
      number: '50%',
      label: 'Faster Setup',
      description: 'with EatCaterly\'s guided process'
    },
    {
      number: '24/7',
      label: 'Support',
      description: 'compliance monitoring and assistance'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Benefits of A2P Compliance
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A2P registration isn't just about compliance—it's about maximizing your SMS marketing effectiveness
            and building trust with your customers.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{benefit.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{benefit.description}</p>
              <div className="border-t border-gray-100 pt-4">
                <div className="text-2xl font-bold text-blue-600">{benefit.metric}</div>
                <div className="text-xs text-gray-500">{benefit.metricLabel}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Features */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">Complete Feature Set</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-6 text-center">{feature.category}</h4>
                <ul className="space-y-3">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Why Food Businesses Choose A2P</h3>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Join thousands of restaurants, caterers, and food trucks who've improved their customer communication with A2P compliance.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-blue-100 mb-1">{stat.label}</div>
                <div className="text-sm text-blue-200">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">A2P vs Non-Compliant Messaging</h3>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {/* Header */}
              <div className="p-6 bg-gray-50">
                <h4 className="font-semibold text-gray-900 text-center">Feature</h4>
              </div>
              <div className="p-6 bg-green-50">
                <h4 className="font-semibold text-green-900 text-center">✅ A2P Compliant</h4>
              </div>
              <div className="p-6 bg-red-50">
                <h4 className="font-semibold text-red-900 text-center">❌ Non-Compliant</h4>
              </div>

              {/* Rows */}
              {[
                ['Delivery Rate', '98-99%', '60-80%'],
                ['Message Speed', '< 2 seconds', '5-30 seconds'],
                ['Spam Filtering', 'Minimal', 'High risk'],
                ['Brand Display', 'Verified name', 'Number only'],
                ['Carrier Support', 'Full support', 'Limited/None'],
                ['Legal Protection', 'Compliant', 'Risk of violations']
              ].map(([feature, compliant, nonCompliant], index) => (
                <React.Fragment key={index}>
                  <div className="p-4 text-center font-medium text-gray-900">{feature}</div>
                  <div className="p-4 text-center text-green-700">{compliant}</div>
                  <div className="p-4 text-center text-red-700">{nonCompliant}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}