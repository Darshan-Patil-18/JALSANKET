'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Sun, Compass, AlertTriangle, Waves, LifeBuoy, Globe, ChevronDown } from 'lucide-react';
import { JALSANKET_LANGUAGES } from '@/lib/languages';
import { useLanguage } from '@/lib/LanguageContext';

export type TabType = 'aqi' | 'weather' | 'fishing' | 'hazard' | 'tides' | 'emergency';

interface NavbarProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export default function Navbar({ activeTab, onChange }: NavbarProps) {
  const { lang: currentLang, setLang, t } = useLanguage();
  const [langIndex, setLangIndex] = useState(0);

  // Sync brand index with current language when user changes it
  useEffect(() => {
    const idx = JALSANKET_LANGUAGES.findIndex((l) => l.id === currentLang);
    if (idx !== -1) {
      setLangIndex(idx);
    }
  }, [currentLang]);

  // Gentle cycle across scripts if left on English or auto
  useEffect(() => {
    const timer = setInterval(() => {
      setLangIndex((prev) => (prev + 1) % JALSANKET_LANGUAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentBrand = JALSANKET_LANGUAGES[langIndex] || JALSANKET_LANGUAGES[0];

  const tabList: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'aqi',       label: t('tab_aqi'),       icon: <Wind className="w-4 h-4" /> },
    { id: 'weather',   label: t('tab_weather'),   icon: <Sun className="w-4 h-4" /> },
    { id: 'fishing',   label: t('tab_fishing'),   icon: <Compass className="w-4 h-4" /> },
    { id: 'hazard',    label: t('tab_hazard'),    icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'tides',     label: t('tab_tides'),     icon: <Waves className="w-4 h-4" /> },
    { id: 'emergency', label: t('tab_emergency'), icon: <LifeBuoy className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-slate-200/80 shadow-sm select-none">
      <div className="w-full max-w-[1650px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3" style={{ minHeight: '66px' }}>

        {/* ── LEFT: Multilingual brand name & Native Language Selector ── */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="min-w-[140px] sm:min-w-[175px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBrand.id}
                initial={{ opacity: 0, y: -4, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
                exit={  { opacity: 0, y:  4, filter: 'blur(3px)' }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setLang(currentBrand.id)}
                title="Click to select this language"
              >
                <span className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800 font-sans leading-none">
                  {currentBrand.native}
                </span>
                <span className="hidden sm:inline-block text-[9px] font-bold tracking-widest uppercase text-cyan-600 px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-200">
                  {currentBrand.nativeName}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── NATIVE SCRIPT LANGUAGE DROPDOWN ── */}
          <div className="relative flex items-center">
            <Globe className="w-3.5 h-3.5 text-cyan-600 absolute left-2.5 pointer-events-none" />
            <select
              id="global-language-select"
              value={currentLang}
              onChange={(e) => setLang(e.target.value)}
              className="appearance-none pl-8 pr-7 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-300/80 text-xs md:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-sm transition"
              aria-label="Select Native Language"
            >
              {JALSANKET_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id} className="bg-white text-slate-900 font-medium py-1">
                  {l.nativeName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 pointer-events-none" />
          </div>
        </div>

        {/* ── RIGHT: Tab buttons spread across remaining space ── */}
        <div className="flex-1 flex items-center justify-end gap-1 md:gap-1.5 overflow-x-auto no-scrollbar py-1">
          {tabList.map((tab) => {
            const isActive    = activeTab === tab.id;
            const isEmergency = tab.id === 'emergency';
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-2 md:px-3.5 md:py-2.5 rounded-xl
                  text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-200
                  ${isActive
                    ? isEmergency
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30 ring-1 ring-rose-400/40'
                      : 'bg-cyan-600 text-white shadow-md shadow-cyan-500/25 ring-1 ring-cyan-400/40'
                    : isEmergency
                    ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                    : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'}
                `}
              >
                <span className={
                  isActive ? 'text-white'
                  : isEmergency ? 'text-rose-500'
                  : 'text-cyan-600'
                }>
                  {tab.icon}
                </span>
                <span className="inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </nav>
  );
}
