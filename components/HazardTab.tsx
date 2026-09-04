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
  Anchor,
  Sparkles
} from 'lucide-react';
import { COASTAL_HAZARD_ZONES } from '@/lib/api';
import { HazardZone } from '@/lib/types';
import { useLanguage } from '@/lib/LanguageContext';

const DynamicHazardMap = dynamic(() => import('./HazardMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 md:h-[400px] rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center text-slate-400">
      <div className="flex items-center gap-2">
        <Compass className="w-5 h-5 animate-spin text-rose-400" />
        <span>Loading Maritime Hazard Geospatial Layer...</span>
      </div>
    </div>
  ),
});

export default function HazardTab() {
  const { t } = useLanguage();
  const [selectedZoneId, setSelectedZoneId] = useState<string>(COASTAL_HAZARD_ZONES[0].id);

  const selectedZone = COASTAL_HAZARD_ZONES.find((z) => z.id === selectedZoneId) || COASTAL_HAZARD_ZONES[0];

  return (
    <div className="w-full text-white">
      {/* Top Controls & Dropdown Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              {t('hazard_title')}
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-300 mt-0.5 ml-8 drop-shadow">
            {t('hazard_subtitle')}
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="hazard-select" className="text-xs font-semibold text-slate-300">
            {t('select_hazard_sector')}:
          </label>
          <div className="relative">
            <select
              id="hazard-select"
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="appearance-none px-4 py-2 pr-9 rounded-xl bg-[#28323f]/95 hover:bg-[#323d4c] border border-white/15 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-rose-400 backdrop-blur-md cursor-pointer shadow-lg"
            >
              {COASTAL_HAZARD_ZONES.map((zone) => (
                <option key={zone.id} value={zone.id} className="bg-slate-900 text-white">
                  {zone.name} ({zone.hazardType})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-rose-400">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Wave Height */}
            <div className="p-3.5 rounded-2xl bg-[#28323f]/90 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <Waves className="w-4 h-4 text-cyan-400" />
                <span>{t('wave_height')}</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-rose-400 font-mono">{selectedZone.waveHeight}</span>
                <span className="text-xs text-slate-400">m</span>
              </div>
              <span className="text-[10px] text-rose-400 font-medium">Rough sea state</span>
            </div>

            {/* Wind Speed */}
            <div className="p-3.5 rounded-2xl bg-[#28323f]/90 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <Wind className="w-4 h-4 text-sky-400" />
                <span>{t('wind_speed')}</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-white font-mono">{selectedZone.windSpeed}</span>
                <span className="text-xs text-slate-400">km/h</span>
              </div>
              <span className="text-[10px] text-amber-400 font-medium">Gusty winds</span>
            </div>

            {/* Visibility */}
            <div className="p-3.5 rounded-2xl bg-[#28323f]/90 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <Eye className="w-4 h-4 text-slate-300" />
                <span>{t('visibility_label')}</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                {selectedZone.visibility}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Moderate haze</span>
            </div>

            {/* Current Strength */}
            <div className="p-3.5 rounded-2xl bg-[#28323f]/90 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>{t('current_rip')}</span>
              </div>
              <div className="text-xs font-bold text-rose-400 mt-1">
                {selectedZone.currentStrength}
              </div>
              <span className="text-[10px] text-rose-300 font-medium">High drift risk</span>
            </div>
          </div>
        </div>

        {/* Right Section: Recommendation Card & Marine Warning */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Recommendation Card */}
          <div className="p-6 rounded-2xl bg-[#2c3746]/95 border border-white/10 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t('safety_recommendation')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {selectedZone.statusBadge}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 text-sm font-semibold">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>{t('navigation_warning')}</span>
              </div>
              <p className="text-xs leading-relaxed text-rose-100 font-normal">
                {selectedZone.recommendation}
              </p>
            </div>

            {/* Warning Note */}
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-white/5 text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-amber-300 block">Hydrodynamic Assessment:</span>
              <p>{selectedZone.warningNote}</p>
            </div>

            {/* Perimeter Details */}
            <div className="space-y-2 text-xs text-slate-300">
              <span className="font-semibold text-slate-400 block">Hazard Vectors & Range:</span>
              <ul className="space-y-1.5 pl-1">
                <li className="flex items-center justify-between text-[11px] bg-slate-900/40 px-2.5 py-1.5 rounded-lg">
                  <span className="text-slate-400">Shore Origin</span>
                  <span className="font-mono text-rose-300 font-semibold">{selectedZone.distances.p1}</span>
                </li>
                <li className="flex items-center justify-between text-[11px] bg-slate-900/40 px-2.5 py-1.5 rounded-lg">
                  <span className="text-slate-400">Critical Core 1</span>
                  <span className="font-mono text-rose-300 font-semibold">{selectedZone.distances.p2}</span>
                </li>
                <li className="flex items-center justify-between text-[11px] bg-slate-900/40 px-2.5 py-1.5 rounded-lg">
                  <span className="text-slate-400">Boundary Limit</span>
                  <span className="font-mono text-rose-300 font-semibold">{selectedZone.distances.p3}</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* Required Bottom Disclaimer */}
      <div className="mt-6 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 backdrop-blur-md flex items-center gap-3 text-xs text-amber-200/90 font-medium">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        <p>
          ⚠ Demo data — hazard zone simulations shown here are for demonstration purposes and do not reflect real-time maritime danger alerts.
        </p>
      </div>
    </div>
  );
}
