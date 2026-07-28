import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en/translation.json';
// import ptTranslation from './locales/pt/translation.json'; // commented out for now — Portuguese support paused
import svTranslation from './locales/sv/translation.json';
import fiTranslation from './locales/fi/translation.json';
import daTranslation from './locales/da/translation.json';
import noTranslation from './locales/no/translation.json';

const savedLang = localStorage.getItem('selectedLanguage') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      // pt: { translation: ptTranslation }, // commented out for now — Portuguese support paused
      sv: { translation: svTranslation },
      fi: { translation: fiTranslation },
      da: { translation: daTranslation },
      no: { translation: noTranslation },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,  // ← THIS is the key fix
    },
  });

export default i18n;
