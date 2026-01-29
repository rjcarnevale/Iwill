export function ActuallyUseful() {
  const features = [
    {
      icon: "📋",
      title: "Comprehensive Inventory",
      description:
        "Track everything from property and vehicles to sentimental items and digital assets. Add photos, notes, and estimated values.",
    },
    {
      icon: "👥",
      title: "Recipient Management",
      description:
        "Add family, friends, charities. See at a glance who's getting what — and make sure nobody's left out (unless intentionally).",
    },
    {
      icon: "📄",
      title: "Export to PDF",
      description:
        "Generate a clean, formatted document ready to share with your estate attorney. No legal jargon — just clear intentions.",
    },
    {
      icon: "🔒",
      title: "Private by Default",
      description:
        "Your will is yours. Only share to the public feed what you want. Keep the rest between you and your recipients.",
    },
  ];

  const sampleItems = [
    {
      name: "House at 442 Maple Street",
      category: "Real Estate",
      value: "$485,000",
      recipient: "Sarah Reynolds",
      relation: "Daughter",
    },
    {
      name: "2019 Honda CR-V",
      category: "Vehicle",
      value: "$22,000",
      recipient: "Michael Reynolds",
      relation: "Son",
    },
    {
      name: "Grandmother's Engagement Ring",
      category: "Jewelry",
      value: "$8,500",
      recipient: "Emma Reynolds",
      relation: "Granddaughter",
    },
    {
      name: "Victorian Porcelain Doll",
      category: "Sentimental",
      value: "Priceless",
      recipient: "Derek Reynolds",
      relation: "Nephew",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Section label */}
      <div className="text-[#A855F7] text-xs font-bold uppercase tracking-widest mb-3">
        Actually Useful
      </div>

      {/* Heading */}
      <h2 className="font-['Bebas_Neue'] text-4xl md:text-5xl tracking-wide mb-3">
        MORE THAN MEMES.
        <br />
        REAL ESTATE PLANNING.
      </h2>

      {/* Subtitle */}
      <p className="text-[var(--text-secondary)] text-lg mb-10 max-w-2xl leading-relaxed">
        The social feed is fun, but underneath it all is a real tool. Organize
        everything you own, assign it to the people who matter, and export a
        lawyer-ready document when you&apos;re done.
      </p>

      {/* Features grid */}
      <div className="grid md:grid-cols-2 gap-5 mb-10">
        {features.map((feature, i) => (
          <div key={i} className="card-dark rounded-2xl p-6">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Export preview */}
      <div className="bg-white rounded-2xl p-6 md:p-8 text-[#1a1a2e]">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-6 border-b-2 border-gray-200">
          <div className="text-2xl font-bold">
            Iwill<span className="text-[#A855F7]">💀</span>
          </div>
          <div className="text-right text-sm text-gray-500">
            <strong className="block text-[#1a1a2e] text-base mb-1">
              Estate Inventory
            </strong>
            Margaret Reynolds
            <br />
            Generated Jan 28, 2025
          </div>
        </div>

        {/* Items header */}
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
          Bequests (7 items)
        </h4>

        {/* Item rows */}
        <div className="divide-y divide-gray-200">
          {sampleItems.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-4"
            >
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-gray-500">
                  {item.category} • Est. {item.value}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{item.recipient}</div>
                <div className="text-sm text-gray-500">{item.relation}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-6 border-t-2 border-gray-200">
          <button className="gradient-header text-white px-6 py-3 rounded-lg font-semibold text-sm">
            📄 Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
