import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './en';
import { hi } from './hi';

export type Language = 'en' | 'hi';
export const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
];

const STORAGE_KEY = 'lp_language';

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'hi') return stored;
  return 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export function setLanguage(lang: Language) {
  localStorage.setItem(STORAGE_KEY, lang);
  i18n.changeLanguage(lang);
}

export function getCurrentLanguage(): Language {
  return (i18n.language as Language) || 'en';
}

export default i18n;
