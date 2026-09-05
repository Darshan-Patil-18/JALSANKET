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
  Activity
} from 'lucide-react';
import { COASTAL_TIDE_DATA } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

export default function TideTab() {
  const { t, formatNum } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState<string>('porbandar');

  const tide = COASTAL_TIDE_DATA[selectedLocation] || COASTAL_TIDE_DATA.porbandar;

  const getPortName = (key: string) => {
    const locKey = `tp_${key}`;
    const translated = t(locKey);
    return translated !== locKey ? translated : tide.locationName;
  };

  return (
    <div className="w-full">
      {/* Top Location & Dropdown Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Waves className="w-6 h-6 text-cyan-400 drop-shadow" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              {getPortName(selectedLocation)} — {t('tides_title')}
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-300 ml-8 drop-shadow">
            {t('tides_subtitle')}
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="tide-select" className="text-xs font-semibold text-slate-200 drop-shadow">
            {t('select_port')}:
          </label>
          <div className="relative">
            <select
              id="tide-select"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="appearance-none px-4 py-2 pr-9 rounded-xl bg-white/85 hover:bg-white border border-slate-200/90 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-md cursor-pointer shadow-sm transition"
            >
              <option value="porbandar" className="bg-white text-slate-800">{t('tp_porbandar')}</option>
              <option value="veraval" className="bg-white text-slate-800">{t('tp_veraval')}</option>
              <option value="dwarka" className="bg-white text-slate-800">{t('tp_dwarka')}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-cyan-600">
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
          <div className="card flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t('current_tide')}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  tide.currentTide.status === 'Rising' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {tide.currentTide.status === 'Rising' ? `↑ ${t('rising')}` : `↓ ${t('falling')}`}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl md:text-6xl font-extrabold text-slate-800 font-mono tracking-tight">
                  {formatNum(tide.currentTide.heightMeters.toFixed(2))}
                </span>
                <span className="text-2xl font-light text-slate-500">m</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {t('above_cd')}
              </p>
            </div>

            {/* Current Speed Block */}
            <div className="border-l border-slate-200 pl-6 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Activity className="w-4 h-4 text-cyan-600" />
                <span>{t('flow_velocity')}: <strong className="text-slate-800 font-bold font-mono">{formatNum(tide.currentTide.currentSpeedKnots)} knots</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Compass className="w-4 h-4 text-sky-600" />
                <span>{t('flow_direction')}: <strong className="text-slate-800 font-bold">{tide.currentTide.direction}</strong></span>
              </div>
            </div>
          </div>

          {/* High & Low Tide Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Next High Tide Card */}
            <div className="stat-chip flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <ArrowUp className="w-4 h-4 text-cyan-600" />
                  <span>{t('next_high_tide')}</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 font-mono">
                  {formatNum(tide.nextHighTide.time)}
                </div>
                <span className="text-xs text-cyan-700 font-medium">
                  Peak Height: {formatNum(tide.nextHighTide.heightMeters)} m
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 font-bold text-xs text-center">
                {t('high_tide')}
              </div>
            </div>

            {/* Next Low Tide Card */}
            <div className="stat-chip flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <ArrowDown className="w-4 h-4 text-amber-500" />
                  <span>{t('next_low_tide')}</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 font-mono">
                  {formatNum(tide.nextLowTide.time)}
                </div>
                <span className="text-xs text-amber-700 font-medium">
                  Trough Depth: {formatNum(tide.nextLowTide.heightMeters)} m
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-xs text-center">
                {t('low_tide')}
              </div>
            </div>

          </div>

          {/* Hourly Tide Graph */}
          <div className="card space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Tidal Height Harmonic Curve (Next 8 Hours)
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center">
              {tide.hourlyTide.map((item, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[11px] font-semibold text-slate-500 block">{formatNum(item.displayTime)}</span>
                  <span className="text-sm font-bold text-slate-800 font-mono my-1 block">{formatNum(item.height)}m</span>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-cyan-500 h-full rounded-full" 
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
          
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Vessel Navigation Advisory
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200">
                Active Gate
              </span>
            </div>

            <div className="card-inner space-y-2">
              <div className="flex items-center gap-2 text-cyan-700 text-sm font-semibold">
                <Ship className="w-4 h-4" />
                <span>Harbor Passage & Draft Guidance</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 font-normal">
                {tide.advisory}
              </p>
            </div>

            {/* Optimal Window */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-cyan-600" />
                <span className="font-medium">Optimal Docking Gate:</span>
              </div>
              <span className="font-bold text-slate-800 font-mono">{formatNum(tide.favorableDockingWindow)}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-700 block">Hydrodynamic Parameters:</span>
              <p className="text-[11px] text-slate-500">
                Semidiurnal tidal cycle reference based on Indian Tide Tables. Slack water window occurs approximately 35 mins before maximum high water.
              </p>
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
