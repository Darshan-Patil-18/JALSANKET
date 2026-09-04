'use client';

import React from 'react';
import { Wind, Sun, Compass, AlertTriangle, Waves, LifeBuoy } from 'lucide-react';

export type TabType = 'aqi' | 'weather' | 'fishing' | 'hazard' | 'tides' | 'emergency';

interface TabsProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export default function Tabs({ activeTab, onChange }: TabsProps) {
  const tabList: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'aqi',
      label: 'AQI',
      icon: <Wind className="w-4 h-4" />,
    },
    {
      id: 'weather',
      label: 'Weather',
      icon: <Sun className="w-4 h-4" />,
    },
    {
      id: 'fishing',
      label: 'Potential Fishing Zone',
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'hazard',
      label: 'Hazard Zones',
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    {
      id: 'tides',
      label: 'Tide & Currents',
      icon: <Waves className="w-4 h-4" />,
    },
    {
      id: 'emergency',
      label: 'SOS / Emergency',
      icon: <LifeBuoy className="w-4 h-4" />,
    },
  ];

  return (
    <div className="inline-flex flex-wrap items-center p-1.5 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-xl shadow-xl shadow-black/30 gap-1">
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
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 border border-rose-400/40'
                  : 'bg-blue-500 text-white shadow-lg shadow-blue-500/35 border border-blue-400/30'
                : isEmergency
                ? 'text-rose-300 hover:text-white hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
          >
            <span className={isActive ? 'text-white' : isEmergency ? 'text-rose-400' : 'text-cyan-400'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
