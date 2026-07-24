// src/utils/invoiceI18n.js
//
// This file is now just language metadata + detection logic. The actual
// translated invoice strings live in your existing locale files
// (src/i18n/locales/{lang}.json → "invoice" key) and are read via
// react-i18next's t() inside Invoice.jsx — not here.

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", locale: "en-US" },
  { code: "pt", label: "Português", locale: "pt-PT" },
  { code: "sv", label: "Svenska", locale: "sv-SE" },
];

export function getLocaleForLang(langCode) {
  const found = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
  return found ? found.locale : "en-US";
}

export function detectDefaultLanguage(order, currentSiteLanguage) {
  const candidate =
    order?.language ||
    order?.customerLanguage ||
    order?.address?.language ||
    order?.userId?.preferredLanguage ||
    currentSiteLanguage ||
    (typeof navigator !== "undefined" ? navigator.language?.slice(0, 2) : null);

  const isSupported = SUPPORTED_LANGUAGES.some((l) => l.code === candidate);
  return isSupported ? candidate : "en";
}