'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './i18n';

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<string>('en');

  // Load from localStorage on mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jalsanket_lang');
      if (saved && translations[saved]) {
        setLangState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLang = (newLang: string) => {
    setLangState(newLang);
    try {
      localStorage.setItem('jalsanket_lang', newLang);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    const currentDict = translations[lang];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    const enDict = translations['en'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
