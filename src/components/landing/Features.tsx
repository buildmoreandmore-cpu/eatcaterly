export default function Features() {
  const features = [
    {
      icon: '📄',
      title: 'Post Daily Menus',
      description: 'Easily create and share your daily specials, seasonal dishes, and regular menu items. Update in real-time as items sell out.'
    },
    {
      icon: '💬',
      title: 'Text & Collect Orders',
      description: 'Send menus directly to customers via SMS. They can order and pay instantly through text messages. No app downloads required.'
    },
    {
      icon: '👥',
      title: 'Plan Event Catering',
      description: 'Manage large orders for events, parties, and corporate catering. Set advance ordering, deposits, and delivery schedules.'
    }
  ]

  return (
    <section id="features" role="region" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to grow your food business
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From daily specials to large events, EatCaterly handles it all with simple, powerful tools designed for food professionals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-orange-50 transition-colors">
              <div className="text-6xl mb-6">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}