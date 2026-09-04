'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  Compass, 
  Waves, 
  Thermometer, 
  Wind, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Fish, 
  Anchor,
  Layers,
  Sparkles
} from 'lucide-react';
import { COASTAL_FISHING_ZONES } from '@/lib/api';
import { FishingZone } from '@/lib/types';
import { useLanguage } from '@/lib/LanguageContext';

// Dynamic import for Leaflet map component with ssr disabled
const DynamicFishingMap = dynamic(() => import('./FishingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 md:h-[400px] rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center text-slate-400">
      <div className="flex items-center gap-2">
        <Compass className="w-5 h-5 animate-spin text-cyan-400" />
        <span>Loading Nautical Chart & PFZ Triangle...</span>
      </div>
    </div>
  ),
});

export default function FishingZoneTab() {
  const { t } = useLanguage();
  const [selectedZoneId, setSelectedZoneId] = useState<string>(COASTAL_FISHING_ZONES[0].id);

  const selectedZone = COASTAL_FISHING_ZONES.find((z) => z.id === selectedZoneId) || COASTAL_FISHING_ZONES[0];

  return (
    <div className="w-full text-white">
      {/* Top Controls & Dropdown Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              {t('fishing_title')}
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-300 mt-0.5 ml-8 drop-shadow">
            {t('fishing_subtitle')}
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="coastal-select" className="text-xs font-semibold text-slate-300">
            {t('select_zone')}:
          </label>
          <div className="relative">
            <select
              id="coastal-select"
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="appearance-none px-4 py-2 pr-9 rounded-xl bg-[#28323f]/95 hover:bg-[#323d4c] border border-white/15 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 backdrop-blur-md cursor-pointer shadow-lg"
            >
              {COASTAL_FISHING_ZONES.map((zone) => (
                <option key={zone.id} value={zone.id} className="bg-slate-900 text-white">
                  {zone.name} ({zone.state})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-cyan-400">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Sea Surface Temp */}
            <div className="p-3.5 rounded-2xl bg-[#28323f]/95 border border-white/15 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span>{t('sea_temp')}</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-white font-mono">{selectedZone.seaSurfaceTemp}</span>
                <span className="text-xs text-slate-400">°C</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">Optimal gradient</span>
            </div>

            {/* Wave Height */}
            <div className="p-3.5 rounded-2xl bg-[#28323f]/95 border border-white/15 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <Waves className="w-4 h-4 text-cyan-400" />
                <span>{t('wave_height')}</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-white font-mono">{selectedZone.waveHeight}</span>
                <span className="text-xs text-slate-400">m</span>
              </div>
              <span className="text-[10px] text-cyan-300 font-medium">Mild sea swell</span>
            </div>

            {/* Current Drift */}
            <div className="p-3.5 rounded-2xl bg-[#28323f]/95 border border-white/15 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <Wind className="w-4 h-4 text-sky-400" />
                <span>{t('ocean_drift')}</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                {selectedZone.currentSpeed}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Stable drift</span>
            </div>

            {/* Fish Probability */}
            <div className="p-3.5 rounded-2xl bg-[#28323f]/95 border border-white/15 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                <Fish className="w-4 h-4 text-teal-400" />
                <span>{t('density')}</span>
              </div>
              <div className="text-xs font-bold text-emerald-400 mt-1">
                {selectedZone.fishDensity}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Pelagic shoals</span>
            </div>
          </div>
        </div>

        {/* Right Section: Recommendation Card & Marine Advisory */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Recommendation Card */}
          <div className="p-6 rounded-2xl bg-[#2c3746]/95 border border-white/15 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t('recommendation')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {selectedZone.statusBadge}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>{t('advisory')}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-200 font-normal">
                {selectedZone.recommendation}
              </p>
            </div>

            {/* Time Window */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 border border-white/5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{t('optimal_window')}:</span>
              </div>
              <span className="font-bold text-white font-mono">{selectedZone.timing}</span>
            </div>

            {/* Vector Triangle Details */}
            <div className="space-y-2 text-xs text-slate-300">
              <span className="font-semibold text-slate-400 block">PFZ Geometry & Range:</span>
              <ul className="space-y-1.5 pl-1">
                <li className="flex items-center justify-between text-[11px] bg-slate-900/40 px-2.5 py-1.5 rounded-lg">
                  <span className="text-slate-400">Anchor: Coastline reference</span>
                  <span className="font-mono text-cyan-300 font-semibold">{selectedZone.distances.p1}</span>
                </li>
                <li className="flex items-center justify-between text-[11px] bg-slate-900/40 px-2.5 py-1.5 rounded-lg">
                  <span className="text-slate-400">Vector A: Primary Pelagic Edge</span>
                  <span className="font-mono text-cyan-300 font-semibold">{selectedZone.distances.p2}</span>
                </li>
                <li className="flex items-center justify-between text-[11px] bg-slate-900/40 px-2.5 py-1.5 rounded-lg">
                  <span className="text-slate-400">Vector B: Secondary Upwelling</span>
                  <span className="font-mono text-cyan-300 font-semibold">{selectedZone.distances.p3}</span>
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
          ⚠ Demo data — fishing zone predictions shown here are simulated for demonstration purposes and do not reflect real-time ocean conditions.
        </p>
      </div>
    </div>
  );
}
