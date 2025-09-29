export default function ComplianceRequirements() {
  const carriers = [
    {
      name: 'Verizon',
      logo: '📱',
      requirements: [
        'Brand registration required',
        'Campaign pre-approval needed',
        'Use case verification',
        'Monthly volume reporting'
      ]
    },
    {
      name: 'AT&T',
      logo: '📶',
      requirements: [
        'A2P registration mandatory',
        'Brand identity verification',
        'Content compliance review',
        'Opt-in documentation'
      ]
    },
    {
      name: 'T-Mobile',
      logo: '📡',
      requirements: [
        'Commercial sender registration',
        'Message content approval',
        'Consent management',
        'Delivery monitoring'
      ]
    }
  ]

  const complianceAreas = [
    {
      icon: '🏢',
      title: 'Business Registration',
      description: 'Register your food business with carriers to establish commercial messaging legitimacy.',
      requirements: [
        'Business license verification',
        'Tax ID confirmation',
        'Physical address validation',
        'Industry classification'
      ]
    },
    {
      icon: '📋',
      title: 'Campaign Approval',
      description: 'Get your SMS campaigns pre-approved to ensure message delivery and compliance.',
      requirements: [
        'Use case documentation',
        'Sample message content',
        'Opt-in process description',
        'Volume estimates'
      ]
    },
    {
      icon: '🛡️',
      title: 'Content Standards',
      description: 'Ensure your messages meet carrier standards for commercial food service communications.',
      requirements: [
        'No misleading claims',
        'Clear opt-out instructions',
        'Honest pricing information',
        'Proper sender identification'
      ]
    }
  ]

  return (
    <section id="requirements" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            We Handle Carrier Compliance For You
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            All major carriers require A2P registration for commercial messaging. EatCaterly provides compliant phone numbers and handles all registration requirements so you don't have to.
          </p>
        </div>

        {/* EatCaterly Advantage */}
        <div className="mb-20">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">✅ Already Compliant Phone Numbers</h3>
              <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
                EatCaterly provides you with carrier-compliant phone numbers that are pre-registered for A2P messaging.
                You get professional SMS service without any setup, registration, or compliance work required.
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">✓</div>
                  <div className="font-semibold text-gray-900">Pre-Registered Numbers</div>
                  <div className="text-sm text-gray-600">Ready to use immediately</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">✓</div>
                  <div className="font-semibold text-gray-900">Full Compliance</div>
                  <div className="text-sm text-gray-600">Meets all carrier requirements</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">✓</div>
                  <div className="font-semibold text-gray-900">Zero Setup</div>
                  <div className="text-sm text-gray-600">No paperwork or waiting</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carrier Requirements */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">What Carriers Require</h3>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Here's what carriers require for A2P compliance - all handled by EatCaterly behind the scenes:
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {carriers.map((carrier, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">{carrier.logo}</div>
                  <h4 className="text-xl font-semibold text-gray-900">{carrier.name}</h4>
                </div>
                <ul className="space-y-3">
                  {carrier.requirements.map((req, reqIndex) => (
                    <li key={reqIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Areas */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Key Compliance Areas</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {complianceAreas.map((area, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{area.icon}</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{area.title}</h4>
                  <p className="text-gray-600">{area.description}</p>
                </div>
                <ul className="space-y-2">
                  {area.requirements.map((req, reqIndex) => (
                    <li key={reqIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Box */}
        <div className="mt-16 bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-orange-900 mb-2">Non-Compliance Consequences</h4>
              <p className="text-orange-800 mb-4">
                Failing to register for A2P can result in message filtering, delivery failures, or complete blocking by carriers.
              </p>
              <ul className="space-y-1 text-orange-800 text-sm">
                <li>• Reduced message delivery rates</li>
                <li>• Potential SMS service suspension</li>
                <li>• Brand reputation damage</li>
                <li>• Loss of customer communication</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}