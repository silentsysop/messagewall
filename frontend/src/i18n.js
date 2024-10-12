import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fiTranslations from './locales/fi.json';
import enTranslations from './locales/en.json';

const savedLanguage = localStorage.getItem('language');

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fi: { translation: fiTranslations },
      en: { translation: enTranslations },
    },
    lng: savedLanguage || 'fi', // Use saved language or default to 'fi'
    fallbackLng: 'fi',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
