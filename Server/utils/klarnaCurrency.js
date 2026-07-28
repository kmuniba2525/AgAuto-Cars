// utils/klarnaCurrency.js
const COUNTRY_TO_CURRENCY = {
  SE: "sek",
  NO: "nok",
  FI: "eur",
  DK: "dkk",
};

export const getCurrencyForCountry = (isoCode) => {
  const currency = COUNTRY_TO_CURRENCY[isoCode];
  if (!currency) {
    throw new Error(`No supported currency mapping for country: ${isoCode}`);
  }
  return currency;
};