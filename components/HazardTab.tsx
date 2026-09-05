'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  AlertTriangle, 
  Waves, 
  Wind, 
  Eye, 
  Compass, 
  ShieldAlert, 
  AlertOctagon, 
  Anchor
} from 'lucide-react';
import { COASTAL_HAZARD_ZONES } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

const DynamicHazardMap = dynamic(() => import('./HazardMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 md:h-[400px] rounded-2xl bg-white/70 border border-white/90 flex items-center justify-center text-slate-500 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-2">
        <Compass className="w-5 h-5 animate-spin text-rose-500" />
        <span className="text-xs font-medium">Loading Maritime Hazard Geospatial Layer...</span>
      </div>
    </div>
  ),
});

export default function HazardTab() {
  const { t, formatNum } = useLanguage();
  const [selectedZoneId, setSelectedZoneId] = useState<string>(COASTAL_HAZARD_ZONES[0].id);

  const selectedZone = COASTAL_HAZARD_ZONES.find((z) => z.id === selectedZoneId) || COASTAL_HAZARD_ZONES[0];

  const getZoneDisplay = (zone: typeof selectedZone) => {
    const baseKey = zone.id.replace('-hazard', '');
    const nameKey = `hz_${baseKey}_name`;
    const typeKey = `hz_${baseKey}_type`;
    const nameStr = t(nameKey) !== nameKey ? t(nameKey) : zone.name;
    const typeStr = t(typeKey) !== typeKey ? t(typeKey) : zone.hazardType;
    return { nameStr, typeStr };
  };

  const activeZoneDisplay = getZoneDisplay(selectedZone);

  return (
    <div className="w-full">
      {/* Top Controls & Dropdown Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-6 h-6 text-rose-400 drop-shadow" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              {activeZoneDisplay.nameStr} — {t('hazard_title')}
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-300 ml-8 drop-shadow">
            {t('hazard_subtitle')}
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="hazard-select" className="text-xs font-semibold text-slate-200 drop-shadow">
            {t('select_hazard_sector')}:
          </label>
          <div className="relative">
            <select
              id="hazard-select"
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="appearance-none px-4 py-2 pr-9 rounded-xl bg-white/85 hover:bg-white border border-slate-200/90 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 backdrop-blur-md cursor-pointer shadow-sm transition"
            >
              {COASTAL_HAZARD_ZONES.map((zone) => {
                const item = getZoneDisplay(zone);
                return (
                  <option key={zone.id} value={zone.id} className="bg-white text-slate-800">
                    {item.nameStr} ({item.typeStr})
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-rose-500">
              <Anchor className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Leaflet Map & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Map Section */}
        <div className="lg:col-span-7 space-y-4">
          <DynamicHazardMap zone={selectedZone} />

          {/* Oceanographic Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Wave Height */}
            <div className="stat-chip flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('wave_height')}</span>
                <Waves className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold text-rose-600 font-mono">{formatNum(selectedZone.waveHeight)}</span>
                <span className="text-xs font-semibold text-slate-500">m</span>
              </div>
              <span className="text-[10px] text-rose-600 font-medium mt-1">{t('rough_sea_state')}</span>
            </div>

            {/* Wind Speed */}
            <div className="stat-chip flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('wind_speed')}</span>
                <Wind className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold text-slate-800 font-mono">{formatNum(selectedZone.windSpeed)}</span>
                <span className="text-xs font-semibold text-slate-500">km/h</span>
              </div>
              <span className="text-[10px] text-amber-600 font-medium mt-1">{t('hazardous_gale')}</span>
            </div>

            {/* Visibility */}
            <div className="stat-chip flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('visibility_label')}</span>
                <Eye className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-1">
                {formatNum(selectedZone.visibility)}
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-1">{t('poor_sea_clarity')}</span>
            </div>

            {/* Current Strength */}
            <div className="stat-chip flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('current_rip')}</span>
                <AlertOctagon className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-xs font-bold text-rose-600 mt-1 font-mono">
                {formatNum(selectedZone.currentStrength)}
              </div>
              <span className="text-[10px] text-rose-600 font-medium mt-1">{t('hazardous_rip')}</span>
            </div>
          </div>
        </div>

        {/* Right Section: Recommendation Card & Marine Warning */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Recommendation Card */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t('safety_recommendation')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                {selectedZone.statusBadge}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200/80 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 text-sm font-semibold">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>{t('navigation_warning')}</span>
              </div>
              <p className="text-xs leading-relaxed text-rose-900 font-normal">
                {selectedZone.recommendation}
              </p>
            </div>

            {/* Warning Note */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <span className="font-semibold text-amber-800 block">Hydrodynamic Assessment:</span>
              <p>{selectedZone.warningNote}</p>
            </div>

            {/* Perimeter Details */}
            <div className="space-y-2 text-xs text-slate-700">
              <span className="font-semibold text-slate-600 block">Hazard Vectors & Range:</span>
              <ul className="space-y-1.5 pl-1">
                <li className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-lg">
                  <span className="text-slate-600 font-medium">{t('map_anchor_coastal')}</span>
                  <span className="font-mono text-rose-600 font-bold">{formatNum(selectedZone.distances.p1)}</span>
                </li>
                <li className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-lg">
                  <span className="text-slate-600 font-medium">{t('map_hazard_p1')}</span>
                  <span className="font-mono text-rose-600 font-bold">{formatNum(selectedZone.distances.p2)}</span>
                </li>
                <li className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-lg">
                  <span className="text-slate-600 font-medium">{t('map_hazard_p2')}</span>
                  <span className="font-mono text-rose-600 font-bold">{formatNum(selectedZone.distances.p3)}</span>
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
