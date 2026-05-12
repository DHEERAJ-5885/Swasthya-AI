import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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
  return localStorage.getItem('language') || 'en';
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage());

  useEffect(() => {
    localStorage.setItem('language', language);
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
