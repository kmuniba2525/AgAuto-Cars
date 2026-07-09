import React from "react";
import { useTranslation } from "react-i18next";

/**
 * PaymentMethods
 * Styled to match BestSeller.jsx header pattern (watermark text, eyebrow,
 * accent divider, primary/accent tokens). Drop in on the home page,
 * e.g. right after <BestSeller /> or before the footer.
 *
 * No external logo images — each brand badge is inline SVG in real brand
 * color, so nothing to upload or break on deploy.
 */

const methods = [
  {
    name: "Card",
    sub: "Visa · Mastercard",
    bg: "#111827",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <rect x="2" y="5" width="20" height="14" rx="2" fill="#fff" />
        <rect x="2" y="8" width="20" height="3" fill="#111827" />
        <rect x="4" y="14" width="6" height="2" rx="1" fill="#111827" />
      </svg>
    ),
  },
  {
    name: "MB WAY",
    sub: "Mobile payment",
    bg: "#E30613",
    icon: <span className="text-white font-extrabold text-[11px]">MB</span>,
  },
  {
    name: "Multibanco",
    sub: "ATM reference",
    bg: "#004990",
    icon: <span className="text-white font-extrabold text-[11px]">MB</span>,
  },
  {
    name: "Bancontact",
    sub: "Belgian cards",
    bg: "#005498",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path d="M2 15L10 9L14 12L22 6" stroke="#FFD400" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M2 9L10 15L14 12L22 18" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "PayPal",
    sub: "Pay with account",
    bg: "#003087",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path d="M7 4h6c3 0 5 1.6 5 4.2 0 3.3-2.4 5.3-6 5.3H9.6L8.6 20H5.3L7 4z" fill="#fff" />
        <path d="M9.5 6.2h5c2 0 3.4 1 3.4 2.8 0 2.4-1.7 3.8-4.3 3.8h-2.3l-.8 4.4H8l1.5-11z" fill="#00C2FF" opacity="0.85" />
      </svg>
    ),
  },
  {
    name: "SEPA Debit",
    sub: "EU bank transfer",
    bg: "#003399",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * 2 * Math.PI;
          const x = 12 + 7 * Math.cos(angle);
          const y = 12 + 7 * Math.sin(angle);
          return <circle key={i} cx={x} cy={y} r="1.1" fill="#FFCC00" />;
        })}
      </svg>
    ),
  },
  {
    name: "Satispay",
    sub: "App payment",
    bg: "#FF6B4A",
    icon: <span className="text-white font-extrabold text-[13px]">S</span>,
  },
];

const PaymentMethods = () => {
  const { t } = useTranslation();

  return (
    <div className="mt-20 px-4 sm:px-6 lg:px-10">
      {/* Section Header — mirrors BestSeller */}
      <div className="relative mb-10">
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[2px] bg-accent" />
              <p className="text-xs font-bold tracking-[3px] text-accent uppercase">
                Checkout With Confidence
              </p>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
              {t("payment_methods.title", "Secure Payment Options")}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
            <LockIcon />
            256-bit encrypted checkout
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-[2px] w-10 bg-accent rounded-full" />
          <div className="h-[1px] flex-1 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Payment Method Grid */}
     <div className="flex md:grid md:grid-cols-7 gap-4 overflow-x-auto scrollbar-hide pb-3 md:overflow-visible snap-x snap-mandatory">
        {methods.map((m) => (
        <div
  key={m.name}
  className="pm-card group relative
  min-w-[150px]
  sm:min-w-[170px]
  md:min-w-0
  rounded-2xl
  border
  border-gray-100
  bg-white
  py-5
  px-3
  flex
  flex-col
  items-center
  gap-2
  overflow-hidden
  cursor-default
  snap-center
  shrink-0"
>
            {/* shine sweep */}
            <span className="pm-shine pointer-events-none absolute inset-0" />

            <div
              className="pm-icon w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: m.bg }}
            >
              {m.icon}
            </div>

            <div className="relative text-center leading-tight">
              <p className="text-[12px] font-bold text-gray-900">{m.name}</p>
              <p className="text-[10px] text-gray-400 hidden sm:block">{m.sub}</p>
            </div>

            {/* bottom accent bar reveal */}
            <span className="absolute bottom-0 left-0 h-[3px] w-full bg-accent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8 text-gray-400 text-xs">
        <span>Payments powered by</span>
        <span className="font-bold text-gray-600 tracking-tight">stripe</span>
      </div>

      <style>{`
        .pm-card {
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                      border-color 0.35s ease;
        }
        .pm-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 30px -12px rgba(0,0,0,0.15);
          border-color: rgba(0,0,0,0.06);
        }
        .pm-icon {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pm-card:hover .pm-icon {
          transform: scale(1.12) rotate(-4deg);
        }
        .pm-shine {
          background: linear-gradient(
            120deg,
            transparent 20%,
            rgba(255,255,255,0.55) 50%,
            transparent 80%
          );
          transform: translateX(-120%);
        }
        .pm-card:hover .pm-shine {
          animation: pm-sweep 0.9s ease forwards;
        }
        @keyframes pm-sweep {
          to { transform: translateX(120%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pm-card, .pm-icon, .pm-shine { transition: none !important; animation: none !important; }
        }
      `}</style>
    </div>
  );
};

const LockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400" fill="none">
    <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export default PaymentMethods;
