'use client';

import React from 'react';
import { Wind, Sun, Compass, AlertTriangle, Waves, LifeBuoy } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export type TabType = 'aqi' | 'weather' | 'fishing' | 'hazard' | 'tides' | 'emergency';

interface TabsProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export default function Tabs({ activeTab, onChange }: TabsProps) {
  const { t } = useLanguage();

  const tabList: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'aqi',       label: t('tab_aqi'),       icon: <Wind className="w-4 h-4" /> },
    { id: 'weather',   label: t('tab_weather'),   icon: <Sun className="w-4 h-4" /> },
    { id: 'fishing',   label: t('tab_fishing'),   icon: <Compass className="w-4 h-4" /> },
    { id: 'hazard',    label: t('tab_hazard'),    icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'tides',     label: t('tab_tides'),     icon: <Waves className="w-4 h-4" /> },
    { id: 'emergency', label: t('tab_emergency'), icon: <LifeBuoy className="w-4 h-4" /> },
  ];

  return (
    <div className="inline-flex flex-wrap items-center p-1.5 rounded-2xl bg-white/80 border border-slate-200/80 backdrop-blur-xl shadow-sm gap-1">
      {tabList.map((tab) => {
        const isActive = activeTab === tab.id;
        const isEmergency = tab.id === 'emergency';
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 ${
              isActive
                ? isEmergency
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30'
                  : 'bg-cyan-600 text-white shadow-md shadow-cyan-500/25'
                : isEmergency
                ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className={isActive ? 'text-white' : isEmergency ? 'text-rose-600' : 'text-cyan-600'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
