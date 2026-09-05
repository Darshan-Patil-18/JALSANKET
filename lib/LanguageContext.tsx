'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from './i18n';

export const NUMERAL_MAPS: Record<string, string[]> = {
  hi: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  gu: ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'],
  mr: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  bn: ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'],
  ta: ['௦', '௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯'],
  te: ['౦', '౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯'],
  kn: ['೦', '೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯'],
  pa: ['੦', '੧', '੨', '੩', '੪', '੫', '௬', '੭', '੮', '੯'],
  ur: ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
};

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
  formatNum: (val: number | string | undefined | null) => string;
  localizeLocation: (loc: string) => string;
  translateCondition: (conditionText: string, code?: number) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
  formatNum: (v) => (v !== undefined && v !== null ? String(v) : ''),
  localizeLocation: (l) => l,
  translateCondition: (c) => c,
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

  const t = useCallback((key: string): string => {
    const currentDict = translations[lang];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    const enDict = translations['en'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return key;
  }, [lang]);

  const formatNum = useCallback((val: number | string | undefined | null): string => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    const map = NUMERAL_MAPS[lang];
    if (!map) return str;
    return str.replace(/\d/g, (digit) => map[Number(digit)] ?? digit);
  }, [lang]);

  const localizeLocation = useCallback((locName: string): string => {
    if (!locName) return '';
    let result = locName;
    const knownLocations: Record<string, string> = {
      Ahmedabad: 'loc_ahmedabad',
      Porbandar: 'loc_porbandar',
      Veraval: 'loc_veraval',
      Dwarka: 'loc_dwarka',
      Okha: 'loc_okha',
      Mandvi: 'loc_mandvi',
      Mumbai: 'loc_mumbai',
      Kutch: 'loc_kutch',
      Gujarat: 'loc_gujarat',
      Maharashtra: 'loc_maharashtra',
      India: 'loc_india',
    };
    for (const [english, key] of Object.entries(knownLocations)) {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      if (regex.test(result)) {
        result = result.replace(regex, t(key));
      }
    }
    return result;
  }, [t]);

  const translateCondition = useCallback((conditionText: string, code?: number): string => {
    if (code !== undefined) {
      if (code === 0) return t('cond_clear');
      if (code === 1) return t('cond_mainly_clear');
      if (code === 2) return t('cond_partly_cloudy');
      if (code === 3) return t('cond_overcast');
      if (code === 45 || code === 48) return t('cond_fog');
      if (code >= 51 && code <= 57) return t('cond_drizzle');
      if (code >= 61 && code <= 67) return t('cond_rain');
      if (code >= 71 && code <= 77) return t('cond_snow');
      if (code >= 80 && code <= 82) return t('cond_rain');
      if (code >= 95) return t('cond_thunderstorm');
    }
    const lower = (conditionText || '').toLowerCase();
    if (lower.includes('thunder')) return t('cond_thunderstorm');
    if (lower.includes('heavy rain')) return t('cond_heavy_rain');
    if (lower.includes('rain') || lower.includes('drizzle')) return t('cond_rain');
    if (lower.includes('overcast')) return t('cond_overcast');
    if (lower.includes('partly')) return t('cond_partly_cloudy');
    if (lower.includes('mainly clear')) return t('cond_mainly_clear');
    if (lower.includes('clear')) return t('cond_clear');
    if (lower.includes('fog')) return t('cond_fog');
    return conditionText;
  }, [t]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, formatNum, localizeLocation, translateCondition }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
