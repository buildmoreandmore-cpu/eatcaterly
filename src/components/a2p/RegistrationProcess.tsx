import Link from 'next/link'

export default function RegistrationProcess() {
  const steps = [
    {
      number: '01',
      title: 'Business Verification',
      description: 'Submit your business information and required documentation.',
      tasks: [
        'Business license upload',
        'Tax ID verification',
        'Contact information',
        'Business type classification'
      ],
      duration: '2-3 business days'
    },
    {
      number: '02',
      title: 'Brand Registration',
      description: 'Register your brand identity with carrier networks.',
      tasks: [
        'Brand name submission',
        'Logo and branding assets',
        'Website verification',
        'Social media profiles'
      ],
      duration: '5-7 business days'
    },
    {
      number: '03',
      title: 'Campaign Setup',
      description: 'Configure your SMS campaigns and get approval.',
      tasks: [
        'Use case documentation',
        'Message templates',
        'Opt-in/opt-out flows',
        'Volume projections'
      ],
      duration: '3-5 business days'
    },
    {
      number: '04',
      title: 'Final Approval',
      description: 'Receive approval and start compliant messaging.',
      tasks: [
        'Carrier review completion',
        'Compliance confirmation',
        'Account activation',
        'Testing and validation'
      ],
      duration: '1-2 business days'
    }
  ]

  const documents = [
    {
      icon: '📄',
      name: 'Business License',
      description: 'Current business license or registration certificate'
    },
    {
      icon: '🆔',
      name: 'Tax ID (EIN)',
      description: 'Federal tax identification number for your business'
    },
    {
      icon: '🏢',
      name: 'Business Address',
      description: 'Physical business address (not P.O. Box)'
    },
    {
      icon: '🌐',
      name: 'Website URL',
      description: 'Active business website with contact information'
    },
    {
      icon: '📱',
      name: 'Sample Messages',
      description: 'Examples of SMS content you plan to send'
    },
    {
      icon: '✅',
      name: 'Opt-in Process',
      description: 'Documentation of how customers consent to SMS'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How EatCaterly Handles A2P For You
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Here's what we do behind the scenes to ensure your SMS service is fully compliant. You get the benefits without any of the work.
          </p>
        </div>

        {/* Process Steps */}
        <div className="mb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-200 z-0"></div>
                )}

                <div className="relative z-10 bg-white">
                  {/* Step number */}
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.number}
                  </div>

                  {/* Step content */}
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{step.description}</p>
                    <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800 font-medium">
                      ⏱️ {step.duration}
                    </div>
                  </div>

                  {/* Tasks */}
                  <ul className="space-y-2 text-sm">
                    {step.tasks.map((task, taskIndex) => (
                      <li key={taskIndex} className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Required Documents */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Required Documents</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{doc.icon}</span>
                  <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                </div>
                <p className="text-gray-600 text-sm">{doc.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Total Registration Timeline</h3>
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="text-4xl font-bold text-blue-600">10-15</div>
              <div className="text-lg text-gray-600">business days</div>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete A2P registration typically takes 2-3 weeks. EatCaterly handles most of the process for you,
              ensuring faster approval and compliance with all carrier requirements.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of food businesses using EatCaterly's compliant SMS service.
            Start sending messages immediately with our pre-registered phone numbers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              Start Messaging Today
            </Link>
            <Link
              href="#faq"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
            >
              View FAQ
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}