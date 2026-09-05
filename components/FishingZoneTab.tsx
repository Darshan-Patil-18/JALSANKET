'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  Compass, 
  Waves, 
  Thermometer, 
  Wind, 
  Clock, 
  AlertTriangle, 
  Fish, 
  Anchor,
  Sparkles
} from 'lucide-react';
import { COASTAL_FISHING_ZONES } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

// Dynamic import for Leaflet map component with ssr disabled
const DynamicFishingMap = dynamic(() => import('./FishingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 md:h-[400px] rounded-2xl bg-white/70 border border-white/90 flex items-center justify-center text-slate-500 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-2">
        <Compass className="w-5 h-5 animate-spin text-cyan-600" />
        <span className="text-xs font-medium">Loading Nautical Chart & PFZ Triangle...</span>
      </div>
    </div>
  ),
});

export default function FishingZoneTab() {
  const { t, formatNum } = useLanguage();
  const [selectedZoneId, setSelectedZoneId] = useState<string>(COASTAL_FISHING_ZONES[0].id);

  const selectedZone = COASTAL_FISHING_ZONES.find((z) => z.id === selectedZoneId) || COASTAL_FISHING_ZONES[0];

  const getZoneDisplayName = (zoneId: string, fallbackName: string) => {
    const key = `fz_${zoneId}_name`;
    const translated = t(key);
    return translated !== key ? translated : fallbackName;
  };

  return (
    <div className="w-full">
      {/* Top Controls & Dropdown Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-6 h-6 text-cyan-400 drop-shadow" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              {getZoneDisplayName(selectedZone.id, selectedZone.name)} — {t('fishing_title')}
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-300 ml-8 drop-shadow">
            {t('fishing_subtitle')}
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="coastal-select" className="text-xs font-semibold text-slate-200 drop-shadow">
            {t('select_zone')}:
          </label>
          <div className="relative">
            <select
              id="coastal-select"
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="appearance-none px-4 py-2 pr-9 rounded-xl bg-white/85 hover:bg-white border border-slate-200/90 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-md cursor-pointer shadow-sm transition"
            >
              {COASTAL_FISHING_ZONES.map((zone) => (
                <option key={zone.id} value={zone.id} className="bg-white text-slate-800">
                  {getZoneDisplayName(zone.id, zone.name)} ({t('loc_gujarat')})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-cyan-600">
              <Anchor className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Leaflet Map & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Map Section */}
        <div className="lg:col-span-7 space-y-4">
          <DynamicFishingMap zone={selectedZone} />

          {/* Oceanographic Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Sea Surface Temp */}
            <div className="stat-chip flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('sea_temp')}</span>
                <Thermometer className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold text-slate-800 font-mono">{formatNum(selectedZone.seaSurfaceTemp)}</span>
                <span className="text-xs font-semibold text-slate-500">°C</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium mt-1">{t('optimal_gradient')}</span>
            </div>

            {/* Wave Height */}
            <div className="stat-chip flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('wave_height')}</span>
                <Waves className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold text-slate-800 font-mono">{formatNum(selectedZone.waveHeight)}</span>
                <span className="text-xs font-semibold text-slate-500">m</span>
              </div>
              <span className="text-[10px] text-cyan-700 font-medium mt-1">{t('mild_sea_swell')}</span>
            </div>

            {/* Current Drift */}
            <div className="stat-chip flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('ocean_drift')}</span>
                <Wind className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-1">
                {formatNum(selectedZone.currentSpeed)}
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-1">{t('stable_drift')}</span>
            </div>

            {/* Fish Probability */}
            <div className="stat-chip flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('density')}</span>
                <Fish className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-xs font-bold text-emerald-600 mt-1">
                {selectedZone.fishDensity}
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-1">{t('pelagic_shoals')}</span>
            </div>
          </div>
        </div>

        {/* Right Section: Recommendation Card & Marine Advisory */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Recommendation Card */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t('recommendation')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {selectedZone.statusBadge}
              </span>
            </div>

            <div className="card-inner space-y-2">
              <div className="flex items-center gap-2 text-cyan-700 text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>{t('advisory')}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 font-normal">
                {selectedZone.recommendation}
              </p>
            </div>

            {/* Time Window */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-cyan-600" />
                <span className="font-semibold">{t('optimal_window')}:</span>
              </div>
              <span className="font-bold text-slate-800 font-mono">{formatNum(selectedZone.timing)}</span>
            </div>

            {/* Vector Triangle Details */}
            <div className="space-y-2 text-xs text-slate-700">
              <span className="font-semibold text-slate-600 block">PFZ Geometry & Range:</span>
              <ul className="space-y-1.5 pl-1">
                <li className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-lg">
                  <span className="text-slate-600 font-medium">{t('map_anchor_coastal')}</span>
                  <span className="font-mono text-cyan-700 font-bold">{formatNum(selectedZone.distances.p1)}</span>
                </li>
                <li className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-lg">
                  <span className="text-slate-600 font-medium">{t('map_pelagic_edge')}</span>
                  <span className="font-mono text-cyan-700 font-bold">{formatNum(selectedZone.distances.p2)}</span>
                </li>
                <li className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-lg">
                  <span className="text-slate-600 font-medium">{t('map_upwelling_vector')}</span>
                  <span className="font-mono text-cyan-700 font-bold">{formatNum(selectedZone.distances.p3)}</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* Required Bottom Disclaimer */}
      <div className="disclaimer-bar">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p>
          {t('demo_disclaimer')}
        </p>
      </div>
    </div>
  );
}
