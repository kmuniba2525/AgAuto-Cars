import { useTranslation } from "react-i18next";

const InfoBanner = () => {
  const { t } = useTranslation();

  const items = [
    {
      key: "shipping",
      title: t("info_banner.shipping_title"),
      description: t("info_banner.shipping_desc"),
      icon: (
        <svg width="32" height="32" viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <rect x="2" y="14" width="28" height="16" rx="2" stroke="#F2F2F2" strokeWidth="1.8" />
          <path d="M30 20 L40 20 L40 30 L30 30" stroke="#F2F2F2" strokeWidth="1.8" />
          <circle cx="10" cy="31" r="3" stroke="#F2F2F2" strokeWidth="1.8" />
          <circle cx="32" cy="31" r="3" stroke="#F2F2F2" strokeWidth="1.8" />
        </svg>
      ),
    },
    {
      key: "help",
      title: t("info_banner.help_title"),
      description: t("info_banner.help_desc"),
      icon: (
        <svg width="32" height="32" viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <rect x="8" y="4" width="22" height="18" rx="3" stroke="#F2F2F2" strokeWidth="1.8" />
          <line x1="13" y1="10" x2="27" y2="10" stroke="#F2F2F2" strokeWidth="1.5" />
          <line x1="13" y1="14" x2="22" y2="14" stroke="#F2F2F2" strokeWidth="1.5" />
          <path d="M16 22 L12 28" stroke="#F2F2F2" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="16" cy="30" r="5" stroke="#F2F2F2" strokeWidth="1.8" />
          <line x1="14" y1="30" x2="18" y2="30" stroke="#F2F2F2" strokeWidth="1.5" />
          <line x1="16" y1="28" x2="16" y2="32" stroke="#F2F2F2" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      key: "guarantee",
      title: t("info_banner.guarantee_title"),
      description: t("info_banner.guarantee_desc"),
      icon: (
        <svg width="32" height="32" viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <circle cx="22" cy="22" r="16" stroke="#F2F2F2" strokeWidth="1.8" />
          <circle cx="22" cy="16" r="2" fill="#F2F2F2" />
          <line x1="22" y1="21" x2="22" y2="32" stroke="#F2F2F2" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      key: "returns",
      title: t("info_banner.returns_title"),
      description: t("info_banner.returns_desc"),
      icon: (
        <svg width="32" height="32" viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <path d="M10 14 L22 8 L34 14 L34 32 L22 38 L10 32 Z" stroke="#F2F2F2" strokeWidth="1.8" />
          <path d="M10 14 L22 20 L34 14" stroke="#F2F2F2" strokeWidth="1.8" />
          <line x1="22" y1="20" x2="22" y2="38" stroke="#F2F2F2" strokeWidth="1.8" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative mt-10 px-4 sm:px-6 lg:px-8">
      <div
        className="max-w-6xl mx-auto rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl shadow-black/40 py-5 sm:py-6 px-6 sm:px-8 relative overflow-hidden"
      >
        {/* subtle ambient glow, signature detail */}
        <div
          className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #E3A83B, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-16 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #E3A83B, transparent 70%)" }}
        />

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-4 text-center sm:text-left"
            >
              <div className="shrink-0 mx-auto sm:mx-0 rounded-xl bg-white/5 border border-white/10 p-1.5">
                {item.icon}
              </div>
              <div>
                <p className="font-bold text-base sm:text-lg text-white mb-1 tracking-tight">
                  {item.title}
                </p>
                <p className="text-sm text-gray-400 leading-relaxed">
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
