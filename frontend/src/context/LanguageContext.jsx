/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import i18n from '../i18n';

const LanguageContext = createContext(null);

const supportedLanguages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'te', label: 'Telugu' }
];

const getInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return 'en';
  }
  // Try i18next first, then fallback
  const i18nLng = localStorage.getItem('i18nextLng');
  const stored = localStorage.getItem('language');
  return stored || i18nLng || 'en';
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage());

  useEffect(() => {
    localStorage.setItem('language', language);
    localStorage.setItem('i18nextLng', language);
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  const getLanguageLabel = (value) => {
    return supportedLanguages.find(item => item.value === value)?.label || value;
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    languages: supportedLanguages,
    getLanguageLabel
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
