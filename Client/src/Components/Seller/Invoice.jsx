import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../Context/AppContext";
import { assets } from "../../assets/assets";
import { getLocalizedText } from "../../utils/getLocalizedText";
import { getOrderCustomer } from "../../utils/getOrderCustomer";
import { SUPPORTED_LANGUAGES, getLocaleForLang, detectDefaultLanguage } from "../../utils/invoiceI18n";
import { Printer, X, Globe, Phone, Mail, MapPin } from "lucide-react";

// A printable invoice for a single order. Rendered as an on-screen preview
// modal; when the seller clicks "Print", window.print() fires.
//
// LANGUAGE: uses the SAME translation files as the rest of the site
// (src/i18n/locales/{lang}.json, under the "invoice" key) via
// react-i18next. Defaults to order.language — the language the customer
// actually checked out in (see Server/controllers/orderController.js).
//
// IMPORTANT: this invoice's language is intentionally independent from
// the site's current UI language. We call t(key, { lng: lang }) instead
// of i18n.changeLanguage(lang), so previewing an invoice in Portuguese
// does NOT switch the whole storefront to Portuguese for the seller.
// The dropdown only affects this one printout.
//
// NOTE: the backdrop/sizing here use inline styles rather than Tailwind's
// `bg-black/50` / `max-w-2xl` utilities. Those depend on the project's
// Tailwind build picking up opacity-slash and arbitrary-width classes on a
// brand-new file, which isn't always reliable with hot-reload — if it
// doesn't compile, you get exactly the bug you saw: a transparent backdrop
// and an oversized card. Inline styles always apply, so the modal renders
// correctly regardless of the CSS build. Print behavior uses the same
// belt-and-suspenders approach: a plain <style> tag with `visibility`
// rules, instead of relying only on Tailwind's `print:` variant.
//
// DESIGN NOTE: the brand navy used throughout this invoice (headings,
// table header, totals) is a project-specific color that may not exist
// in the Tailwind config, so — same reasoning as above — it's applied via
// inline `style` (NAVY / NAVY_DARK constants below) rather than an
// arbitrary Tailwind class like `text-[#182848]`, which is exactly the
// kind of new/arbitrary utility that can silently fail to compile.
const NAVY = "#1B2A56";
const NAVY_DARK = "#141F42";

// Seller/company details shown in the header + footer. These are looked up
// through the SAME invoice.* translation namespace as everything else so
// they still switch with the language dropdown, but each has a defaultValue
// so nothing breaks if you haven't added these keys to your locale files
// yet — just add them to src/i18n/locales/{lang}.json under "invoice" to
// localize them for real.
const COMPANY = {
  name: "AG Auto System",
  tagline: null, // falls back to tt("tagline") below, unchanged from before
  phone: "+46 70 123 45 67",
  email: "contact@agautosystem.com",
  website: "www.agautosystem.com",
  addressLine1: "Västra Storgatan 12",
  addressLine2: "252 23 Helsingborg, Sverige",
};

const Invoice = ({ order, onClose }) => {
  const { currency } = useAppContext();
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(() =>
    detectDefaultLanguage(order, i18n.language)
  );

  if (!order) return null;

  // Every label below reads from src/i18n/locales/{lang}.json → "invoice".
  // { lng: lang } forces THIS lookup to use the invoice's language,
  // independent of whatever language the site UI is currently in.
  const tt = (key, opts) => t(`invoice.${key}`, { lng: lang, ...opts });
  const locale = getLocaleForLang(lang);

  const customer = getOrderCustomer(order);

  const invoiceNumber = order._id
    ? order._id.slice(-8).toUpperCase()
    : "N/A";

  const issueDate = order.createdAt
    ? new Date(order.createdAt)
    : new Date();

  // No due-date field on the order schema today — default to the issue
  // date (matches "paid on receipt" / prepaid orders). Swap in
  // order.dueDate here if/when that's added server-side.
  const dueDate = order.dueDate ? new Date(order.dueDate) : issueDate;

  const items = order.items || [];

  const lineItems = items.map((item) => {
    const unitPrice = item?.product?.offerPrice ?? item?.product?.price ?? 0;
    // Follows the invoice's own language (not the site's), so line items
    // print in Portuguese/Swedish/etc. when the product has that
    // translation. Falls back to English automatically via
    // getLocalizedText if a given product hasn't been translated yet.
    const name = getLocalizedText(item?.product?.name, lang) || "Product";
    const quantity = item?.quantity || 0;

    return {
      name,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
    };
  });

  const subtotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0);
  // Shipping isn't tracked as its own field on the order today; treat the
  // gap between subtotal and the amount actually charged as shipping,
  // never negative. If a dedicated order.shippingFee field gets added
  // later, prefer that over this derived value.
  const shipping = Math.max(0, Math.round((order.amount || 0) - subtotal));
  const total = order.amount || 0;
  // Line-item prices reflect the CURRENT catalog price, not a snapshot
  // taken at purchase time (the order schema doesn't store one), so an
  // older order can legitimately show a subtotal that no longer matches
  // the amount actually charged if prices changed since.
  const pricesMayHaveChanged = Math.round(subtotal) !== Math.round(total - shipping);

  // Locale-aware thousands/decimal separators (e.g. "1 234" in sv-SE vs
  // "1,234" in en-US), with the existing `currency` symbol kept as-is
  // rather than switched per language — swap in Intl's `style: "currency"`
  // instead if you want the symbol/code to change per language too.
  const fmt = (n) => `${currency}${new Intl.NumberFormat(locale).format(Number(n || 0))}`;

  const isPending = !order.isPaid;

  return (
    <div
      className="invoice-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: "rgba(15, 15, 15, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        overflowY: "auto",
      }}
    >
      <div
        className="invoice-card bg-white rounded-2xl shadow-xl"
        style={{
          width: "100%",
          maxWidth: "42rem",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* TOOLBAR — hidden when printing */}
        <div className="invoice-no-print flex items-center justify-between px-6 py-4 border-b gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800">{tt("invoicePreview")}</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 text-sm text-gray-600">
              <Globe size={15} className="text-gray-400" />
              <select
                aria-label={tt("language")}
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              <Printer size={16} />
              {tt("print")}
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-9 h-9 rounded-lg border text-gray-500 hover:bg-gray-50 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* INVOICE BODY */}
        <div className="p-8 print:p-10">
          {/* HEADER — logo + tagline on the left, company contact block on
              the right, separated by a thin vertical rule (matches the
              reference layout: logo | company name & details). */}
          <div className="flex items-start gap-6 pb-6">
            <div className="flex flex-col items-start shrink-0">
              <img
                src={assets.InvoiceLogo}
                alt={COMPANY.name}
                className="w-70 mb-1 object-contain"
              />
            </div>

            <div className="hidden sm:block w-px self-stretch bg-gray-200" />

            <div className="flex-1 min-w-0">
              <h2
                className="text-xl font-bold tracking-tight"
                style={{ color: NAVY }}
              >
                {tt("companyName", { defaultValue: COMPANY.name })}
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                {COMPANY.tagline || tt("tagline")}
              </p>

              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone size={14} style={{ color: NAVY }} />
                  <span>{tt("companyPhone", { defaultValue: COMPANY.phone })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} style={{ color: NAVY }} />
                  <span>{tt("companyEmail", { defaultValue: COMPANY.email })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={14} style={{ color: NAVY }} />
                  <span>{tt("companyWebsite", { defaultValue: COMPANY.website })}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} style={{ color: NAVY }} className="mt-0.5 shrink-0" />
                  <span>
                    {tt("companyAddressLine1", { defaultValue: COMPANY.addressLine1 })}
                    <br />
                    {tt("companyAddressLine2", { defaultValue: COMPANY.addressLine2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 mb-6" />

          {/* TITLE ROW — big "FAKTURA" on the left, invoice # / date on the
              right, aligned to the same baseline. */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div>
              <h1
                className="text-4xl font-extrabold tracking-tight"
                style={{ color: NAVY }}
              >
                {tt("invoice")}
              </h1>
              <div
                className="mt-2 h-1 w-16 rounded-full"
                style={{ backgroundColor: NAVY }}
              />
            </div>

            <div className="text-sm space-y-1.5 sm:mt-1">
              <div className="flex justify-end gap-3">
                <span className="text-gray-500">{tt("invoiceNumber", { defaultValue: "Invoice number" })}:</span>
                <span className="font-semibold text-gray-800 font-mono">#{invoiceNumber}</span>
              </div>
              <div className="flex justify-end gap-3">
                <span className="text-gray-500">{tt("issueDate", { defaultValue: "Invoice date" })}:</span>
                <span className="font-semibold text-gray-800">{issueDate.toLocaleDateString(locale)}</span>
              </div>
            </div>
          </div>

          {/* BILL TO + INVOICE META */}
          <div className="flex flex-wrap justify-between gap-8 mb-8 pb-8 border-b border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                {tt("billTo")}
              </p>
              <p className="font-semibold text-gray-800">
                {customer.name}
                {customer.isGuest && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    ({tt("guest")})
                  </span>
                )}
              </p>
              {customer.email && (
                <p className="text-sm text-gray-600">{customer.email}</p>
              )}
              {customer.phone && (
                <p className="text-sm text-gray-600">{customer.phone}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                {[customer.street, customer.city].filter(Boolean).join(", ")}
              </p>
              <p className="text-sm text-gray-600">
                {[customer.state, customer.zipcode, customer.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>

            <div className="text-sm space-y-2.5">
              <div className="flex justify-between gap-8">
                <span className="text-gray-500">{tt("issueDate", { defaultValue: "Invoice date" })}:</span>
                <span className="font-medium text-gray-800">{issueDate.toLocaleDateString(locale)}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-gray-500">{tt("dueDate", { defaultValue: "Due date" })}:</span>
                <span className="font-medium text-gray-800">{dueDate.toLocaleDateString(locale)}</span>
              </div>
              <div className="flex justify-between items-center gap-8">
                <span className="text-gray-500">{tt("status")}:</span>
                <span className="font-semibold" style={{ color: NAVY }}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center gap-8">
                <span className="text-gray-500">{tt("payment")}:</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isPending
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {order.paymentType}
                  {" "}
                  ({isPending ? tt("pending") : tt("paid")})
                </span>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <table className="w-full text-sm mb-6 border-separate" style={{ borderSpacing: 0 }}>
            <thead>
              <tr style={{ backgroundColor: NAVY_DARK }}>
                <th className="py-3 px-3 font-semibold text-left text-white rounded-l-md">
                  {tt("item")}
                </th>
                <th className="py-3 px-3 font-semibold text-center text-white">
                  {tt("qty")}
                </th>
                <th className="py-3 px-3 font-semibold text-right text-white">
                  {tt("unitPrice")}
                </th>
                <th className="py-3 px-3 font-semibold text-right text-white rounded-r-md">
                  {tt("total")}
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400">
                    {tt("noItems")}
                  </td>
                </tr>
              ) : (
                lineItems.map((li, idx) => (
                  <tr
                    key={idx}
                    style={idx % 2 === 1 ? { backgroundColor: "#F9FAFB" } : undefined}
                  >
                    <td className="py-3 px-3 text-gray-800 border-b border-gray-100">{li.name}</td>
                    <td className="py-3 px-3 text-center text-gray-600 border-b border-gray-100">
                      {li.quantity}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-600 border-b border-gray-100">
                      {fmt(li.unitPrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-gray-800 border-b border-gray-100">
                      {fmt(li.lineTotal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* NOTE + SUMMARY */}
          <div className="flex flex-wrap gap-6 mb-6">
            <div className="flex-1 min-w-[220px] border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: NAVY }}>
                {tt("note", { defaultValue: "Note" })}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {pricesMayHaveChanged
                  ? tt("priceNote")
                  : tt("noteDefault", {
                      defaultValue: "Unit prices reflect current catalog pricing.",
                    })}
              </p>
            </div>

            <div className="flex-1 min-w-[220px] border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{tt("itemsSubtotal")}</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{tt("shipping", { defaultValue: "Shipping" })}</span>
                <span>{fmt(shipping)}</span>
              </div>
              <div
                className="flex justify-between text-base font-bold pt-2 border-t-2"
                style={{ color: NAVY, borderColor: NAVY_DARK }}
              >
                <span>{tt("totalCharged")}</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* CURRENCY NOTE */}
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 mb-6">
            <span
              className="flex items-center justify-center w-9 h-9 rounded-full text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: NAVY_DARK }}
            >
              {currency}
            </span>
            <p className="text-sm text-gray-600">
              {tt("currencyNote", { defaultValue: "All amounts are shown in" })}{" "}
              <span className="font-semibold text-gray-800">
                {tt("currencyCode", { defaultValue: currency })}
              </span>
              .
            </p>
          </div>

          {/* FOOTER */}
          <div className="pt-6 border-t border-gray-200 text-center">
            <p className="font-bold text-sm mb-1" style={{ color: NAVY }}>
              {tt("thankYouHeading", { defaultValue: "Thank you!" })}
            </p>
            <p className="text-xs text-gray-400">
              {tt("thankYou", {
                defaultValue: `Thank you for shopping with ${COMPANY.name}.`,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Print rules as plain CSS, not Tailwind's print: variant — this
          guarantees "print only the invoice" works even if Tailwind's
          print:hidden utility isn't compiling for some reason. The
          visibility trick keeps layout intact (unlike display:none on
          ancestors, which can collapse the invoice's own box too). */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-overlay,
          .invoice-overlay * {
            visibility: visible;
          }
          .invoice-overlay {
            position: static !important;
            background: none !important;
            display: block !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .invoice-card {
            max-width: 100% !important;
            max-height: none !important;
            width: 100% !important;
            overflow: visible !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .invoice-no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
