export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Create Your Menu',
      description: 'Add your dishes, prices, and photos. Set availability and special dietary notes.'
    },
    {
      number: '02',
      title: 'Send to Customers',
      description: 'Share your menu via text message to your customer list. They receive it instantly.'
    },
    {
      number: '03',
      title: 'Receive & Fulfill Orders',
      description: 'Get orders with payment confirmation. Prepare food and notify customers when ready.'
    }
  ]

  return (
    <section id="how-it-works" role="region" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started in minutes. No complex setup, no lengthy onboarding. Just simple tools that work.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}