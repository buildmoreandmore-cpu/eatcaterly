export default function TrustedBy() {
  const businesses = [
    { name: 'Local Bistro', emoji: '🍽️' },
    { name: "Chef's Table", emoji: '👨‍🍳' },
    { name: 'Garden Fresh', emoji: '🥗' },
    { name: 'Spice Route', emoji: '🌶️' },
    { name: 'Sweet Treats', emoji: '🧁' },
    { name: 'Ocean Grill', emoji: '🐟' }
  ]

  return (
    <section role="region" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-8">
            TRUSTED BY FOOD BUSINESSES EVERYWHERE
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {businesses.map((business, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div className="text-4xl mb-2">{business.emoji}</div>
                <span className="text-sm font-medium text-gray-600">{business.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}