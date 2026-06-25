const InfoBanner = () => {
  const items = [
    {
      title: "FREE SHIPPING",
      description: "On all orders over 999:-",
      icon: (
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <rect x="2" y="14" width="28" height="16" rx="2" stroke="#D4950A" strokeWidth="1.8" />
          <path d="M30 20 L40 20 L40 30 L30 30" stroke="#D4950A" strokeWidth="1.8" />
          <circle cx="10" cy="31" r="3" stroke="#D4950A" strokeWidth="1.8" />
          <circle cx="32" cy="31" r="3" stroke="#D4950A" strokeWidth="1.8" />
        </svg>
      ),
    },
    {
      title: "DO YOU NEED HELP?",
      description: "Contact our support team",
      icon: (
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <rect x="8" y="4" width="22" height="18" rx="3" stroke="#D4950A" strokeWidth="1.8" />
          <line x1="13" y1="10" x2="27" y2="10" stroke="#D4950A" strokeWidth="1.5" />
          <line x1="13" y1="14" x2="22" y2="14" stroke="#D4950A" strokeWidth="1.5" />
          <path d="M16 22 L12 28" stroke="#D4950A" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="16" cy="30" r="5" stroke="#D4950A" strokeWidth="1.8" />
          <line x1="14" y1="30" x2="18" y2="30" stroke="#D4950A" strokeWidth="1.5" />
          <line x1="16" y1="28" x2="16" y2="32" stroke="#D4950A" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      title: "GARANTI INFORMATION",
      description: "Read more about our guarantee",
      icon: (
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <circle cx="22" cy="22" r="16" stroke="#D4950A" strokeWidth="1.8" />
          <circle cx="22" cy="16" r="2" fill="#D4950A" />
          <line x1="22" y1="21" x2="22" y2="32" stroke="#D4950A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "RETURNS",
      description: "Read more about our return policy",
      icon: (
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <path d="M10 14 L22 8 L34 14 L34 32 L22 38 L10 32 Z" stroke="#D4950A" strokeWidth="1.8" />
          <path d="M10 14 L22 20 L34 14" stroke="#D4950A" strokeWidth="1.8" />
          <line x1="22" y1="20" x2="22" y2="38" stroke="#D4950A" strokeWidth="1.8" />
        </svg>
      ),
    },
  ];

  return (
  <div className="border-y border-gray-200 py-6 sm:py-8">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-4 text-center sm:text-left"
          >
            <div className="shrink-0 mx-auto sm:mx-0">
              {item.icon}
            </div>

            <div>
              <p className="font-bold text-base sm:text-lg text-gray-900 mb-1">
                {item.title}
              </p>

              <p className="text-sm text-gray-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
};

export default InfoBanner;