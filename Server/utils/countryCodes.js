// utils/countryCodes.js
const COUNTRY_NAME_TO_CODE = {
  Pakistan: "PK",
  Portugal: "PT",
  Sweden: "SE",
  Norway: "NO",
  Finland: "FI",
  Denmark: "DK",
  // add more as your checkout form supports more countries
};

export const toCountryCode = (name) => {
  if (!name) return name;
  const trimmed = name.trim();
  // already a 2-letter code? just uppercase it
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return COUNTRY_NAME_TO_CODE[trimmed] || COUNTRY_NAME_TO_CODE[
    trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
  ] || trimmed;
};