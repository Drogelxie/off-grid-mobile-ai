import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { de } from './locales/de';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
  },
  lng: (() => { try { return (new Intl.DateTimeFormat().resolvedOptions().locale ?? 'en').toLowerCase().startsWith('de') ? 'de' : 'en'; } catch { return 'en'; } })(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
