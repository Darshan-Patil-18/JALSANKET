'use client';

import React, { useState } from 'react';
import { 
  Waves, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  Compass, 
  Anchor, 
  Ship, 
  AlertTriangle,
  Activity,
  Gauge
} from 'lucide-react';
import { COASTAL_TIDE_DATA } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

export default function TideTab() {
  const { t } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState<string>('porbandar');

  const tide = COASTAL_TIDE_DATA[selectedLocation] || COASTAL_TIDE_DATA.porbandar;

  return (
    <div className="w-full text-white">
      {/* Top Location & Dropdown Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Waves className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              {t('tides_title')}
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-300 mt-0.5 ml-8 drop-shadow">
            {t('tides_subtitle')}
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="tide-select" className="text-xs font-semibold text-slate-300">
            {t('select_port')}:
          </label>
          <div className="relative">
            <select
              id="tide-select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="appearance-none px-4 py-2 pr-9 rounded-xl bg-[#28323f]/95 hover:bg-[#323d4c] border border-white/15 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 backdrop-blur-md cursor-pointer shadow-lg"
            >
              <option value="porbandar" className="bg-slate-900 text-white">Porbandar Coastal Anchorage</option>
              <option value="veraval" className="bg-slate-900 text-white">Veraval Fishing Harbor</option>
              <option value="dwarka" className="bg-slate-900 text-white">Dwarka / Rupen Port</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-cyan-400">
              <Anchor className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Tide Metrics & Visual Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section: Big Tide Status & High/Low Cards */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Current Tide Status Card */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('current_tide')}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  tide.currentTide.status === 'Rising' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {tide.currentTide.status === 'Rising' ? `↑ ${t('rising')}` : `↓ ${t('falling')}`}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl md:text-6xl font-extrabold text-white font-mono tracking-tight">
                  {tide.currentTide.heightMeters.toFixed(2)}
                </span>
                <span className="text-2xl font-light text-slate-300">m</span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1">
                Above Chart Datum (CD)
              </p>
            </div>

            {/* Current Speed Block */}
            <div className="border-l border-white/10 pl-6 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>{t('flow_velocity')}: <strong className="text-white font-bold">{tide.currentTide.currentSpeedKnots} knots</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>{t('flow_direction')}: <strong className="text-white font-bold">{tide.currentTide.direction}</strong></span>
              </div>
            </div>
          </div>

          {/* High & Low Tide Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Next High Tide Card */}
            <div className="p-5 rounded-2xl bg-[#28323f]/90 border border-white/10 backdrop-blur-md flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <ArrowUp className="w-4 h-4 text-cyan-400" />
                  <span>{t('next_high_tide')}</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  {tide.nextHighTide.time}
                </div>
                <span className="text-xs text-cyan-300 font-medium">
                  Peak Height: {tide.nextHighTide.heightMeters} m
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs text-center">
                {t('high_tide')}
              </div>
            </div>

            {/* Next Low Tide Card */}
            <div className="p-5 rounded-2xl bg-[#28323f]/90 border border-white/10 backdrop-blur-md flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <ArrowDown className="w-4 h-4 text-amber-400" />
                  <span>{t('next_low_tide')}</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  {tide.nextLowTide.time}
                </div>
                <span className="text-xs text-amber-300 font-medium">
                  Trough Depth: {tide.nextLowTide.heightMeters} m
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs text-center">
                {t('low_tide')}
              </div>
            </div>

          </div>

          {/* Hourly Tide Graph */}
          <div className="p-5 rounded-2xl bg-[#28323f]/90 border border-white/10 backdrop-blur-md space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Tidal Height Harmonic Curve (Next 8 Hours)
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center">
              {tide.hourlyTide.map((item, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[11px] font-semibold text-slate-400 block">{item.displayTime}</span>
                  <span className="text-sm font-bold text-white font-mono my-1 block">{item.height}m</span>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-cyan-400 h-full rounded-full" 
                      style={{ width: `${(item.height / 4) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Marine Advisory & Harbor Gate */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-6 rounded-2xl bg-[#2c3746]/95 border border-white/10 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Vessel Navigation Advisory
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Active Gate
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold">
                <Ship className="w-4 h-4" />
                <span>Harbor Passage & Draft Guidance</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-200 font-normal">
                {tide.advisory}
              </p>
            </div>

            {/* Optimal Window */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 border border-white/5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Optimal Docking Gate:</span>
              </div>
              <span className="font-bold text-white font-mono">{tide.favorableDockingWindow}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-cyan-300 block">Hydrodynamic Parameters:</span>
              <p className="text-[11px] text-slate-400">
                Semidiurnal tidal cycle reference based on Indian Tide Tables. Slack water window occurs approximately 35 mins before maximum high water.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Required Bottom Disclaimer */}
      <div className="mt-6 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 backdrop-blur-md flex items-center gap-3 text-xs text-amber-200/90 font-medium">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        <p>
          ⚠ Demo data — tide and current simulations shown here are for demonstration purposes and do not reflect real-time hydrographic tide tables.
        </p>
      </div>
    </div>
  );
}
