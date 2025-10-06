export default function OptInMethods() {
  const methods = [
    {
      icon: '💬',
      title: 'Keyword Opt-In',
      description: 'Customers text a keyword to opt-in',
      status: 'Active',
      examples: [
        'Text "MENU" to receive daily menu updates',
        'Text "DEALS" to get exclusive offers',
        'Text "JOIN" to subscribe to order notifications'
      ],
      compliance: 'TCPA-compliant double opt-in with confirmation message',
      color: 'blue'
    },
    {
      icon: '🌐',
      title: 'Website Sign-Up',
      description: 'Phone number collection on website forms',
      status: 'Active',
      examples: [
        'Order placement forms with SMS consent checkbox',
        'Newsletter signup with phone field',
        'Account registration with opt-in option'
      ],
      compliance: 'Clear consent language and checkbox before submission',
      color: 'green'
    },
    {
      icon: '🛒',
      title: 'Point-of-Sale',
      description: 'Phone collection during checkout',
      status: 'Active',
      examples: [
        'Online checkout with "Send me order updates via SMS" option',
        'In-person orders with verbal consent request',
        'Mobile app registration with SMS preferences'
      ],
      compliance: 'Explicit consent obtained before first message',
      color: 'purple'
    },
    {
      icon: '🗣️',
      title: 'Verbal Opt-In',
      description: 'In-person or phone consent',
      status: 'Active',
      examples: [
        'Phone orders: "May we text you order updates?"',
        'In-store: "Would you like to receive our daily specials via text?"',
        'Catering inquiries with SMS follow-up consent'
      ],
      compliance: 'Documented consent with customer confirmation',
      color: 'orange'
    }
  ]

  const consentRequirements = [
    {
      icon: '✅',
      title: 'Clear Disclosure',
      description: 'Customers must know what they\'re signing up for, including message frequency and that standard rates apply.'
    },
    {
      icon: '📝',
      title: 'Explicit Consent',
      description: 'Opt-in must be voluntary and affirmative - pre-checked boxes or assumed consent don\'t qualify.'
    },
    {
      icon: '🚪',
      title: 'Easy Opt-Out',
      description: 'Every message must include opt-out instructions. Reply STOP to any message to unsubscribe instantly.'
    },
    {
      icon: '🔒',
      title: 'Privacy Protection',
      description: 'Customer phone numbers are never shared with third parties and are only used for agreed purposes.'
    }
  ]

  const colorClasses: Record<string, string> = {
    blue: 'from-blue-50 to-blue-100 border-blue-200',
    green: 'from-green-50 to-green-100 border-green-200',
    purple: 'from-purple-50 to-purple-100 border-purple-200',
    orange: 'from-orange-50 to-orange-100 border-orange-200'
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-sm mb-4">
            ✓ Fully Compliant Opt-In Processes
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How We Collect Customer Consent
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            EatCaterly uses multiple TCPA-compliant opt-in methods to ensure every customer explicitly consents to receiving SMS messages. Here's how we protect your business and your customers.
          </p>
        </div>

        {/* Opt-In Methods Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {methods.map((method, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${colorClasses[method.color]} border rounded-2xl p-8`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-4xl mr-4">{method.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{method.title}</h3>
                    <p className="text-gray-600 text-sm">{method.description}</p>
                  </div>
                </div>
                <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {method.status}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Examples:</h4>
                <ul className="space-y-2">
                  {method.examples.map((example, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">{example}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white bg-opacity-70 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-700">
                  <strong className="font-semibold">Compliance:</strong> {method.compliance}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Consent Requirements */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            TCPA Consent Requirements
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {consentRequirements.map((req, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl mb-3">{req.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-2">{req.title}</h4>
                <p className="text-sm text-gray-600">{req.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Opt-In Language */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4 text-center">Sample Opt-In Language</h3>
          <p className="text-center mb-6 text-blue-100">
            Use this compliant language on your forms and checkout pages:
          </p>
          <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm border border-white border-opacity-20">
            <div className="flex items-start mb-4">
              <input type="checkbox" className="mt-1 mr-3" checked readOnly />
              <div className="text-sm">
                <p className="mb-2">
                  <strong>Yes, send me text messages!</strong> By checking this box and providing my mobile number, I agree to receive automated promotional and transactional text messages from [Your Restaurant Name] at this number.
                </p>
                <p className="text-blue-100 text-xs">
                  Message frequency varies. Message and data rates may apply. Reply STOP to opt-out or HELP for help.
                  View our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                </p>
              </div>
            </div>
          </div>
          <p className="text-center text-blue-100 text-sm mt-6">
            💡 EatCaterly automatically includes opt-out instructions in every message and processes STOP requests instantly.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Questions about opt-in compliance for your food business?
          </p>
          <a
            href="mailto:eatcaterly@gmail.com"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Our Compliance Team
          </a>
        </div>
      </div>
    </section>
  )
}
