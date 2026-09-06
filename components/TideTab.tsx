'use client';

import React from 'react';
import { 
  Waves, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  Compass, 
  Ship, 
  AlertTriangle,
  Activity
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useLocation } from '@/lib/LocationContext';
import { getTideDataForCity } from '@/lib/zoneData';

export default function TideTab() {
  const { lang, t, formatNum, localizeLocation } = useLanguage();
  const { location } = useLocation();

  const tide = getTideDataForCity(
    location.city,
    location.state,
    location.lat,
    location.lng
  );

  const locKey = location.city.toLowerCase().replace(/[^a-z0-9]/g, '');

  const flowDirStr = t(`tide_${locKey}_dir`) !== `tide_${locKey}_dir`
    ? t(`tide_${locKey}_dir`)
    : tide.currentTide.status === 'Rising'
    ? `${t('dir_ene') || 'ENE'} (${t('flood_stream') || 'Flood stream'})`
    : `${t('dir_wsw') || 'WSW'} (${t('ebb_stream') || 'Ebb stream'})`;

  const advisoryStr = t(`tide_${locKey}_advisory`) !== `tide_${locKey}_advisory`
    ? t(`tide_${locKey}_advisory`)
    : tide.currentTide.status === 'Rising'
    ? (t('tide_flood_advisory') || tide.advisory).replace('{city}', localizeLocation(location.city))
    : (t('tide_ebb_advisory') || tide.advisory).replace('{city}', localizeLocation(location.city));

  return (
    <div className="w-full">
      {/* Top Location Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Waves className="w-6 h-6 text-cyan-400 drop-shadow" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              {localizeLocation(location.city)} — {t('tides_title')}
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-300 ml-8 drop-shadow">
            {t('tides_subtitle')} · {localizeLocation(location.city)}, {localizeLocation(location.state)}
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-white/85 border border-slate-200/90 text-xs font-semibold text-slate-700 backdrop-blur-md shadow-sm">
          <span>{t('tidal_harmonic_epoch') || 'Survey of India Tidal Harmonic Epoch'}</span>
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
            <div className="border-t border-slate-200 pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0 w-full sm:w-auto space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Activity className="w-4 h-4 text-cyan-600" />
                <span>{t('flow_velocity')}: <strong className="text-slate-800 font-bold font-mono">{formatNum(tide.currentTide.currentSpeedKnots)} {t('knots')}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Compass className="w-4 h-4 text-sky-600" />
                <span>{t('flow_direction')}: <strong className="text-slate-800 font-bold">{flowDirStr}</strong></span>
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
                  {t('peak_height')} {formatNum(tide.nextHighTide.heightMeters)} m
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
                  {t('trough_depth')} {formatNum(tide.nextLowTide.heightMeters)} m
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
              {t('tidal_harmonic_curve')}
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
                {t('vessel_nav_advisory')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200">
                {t('active_gate')}
              </span>
            </div>

            <div className="card-inner space-y-2">
              <div className="flex items-center gap-2 text-cyan-700 text-sm font-semibold">
                <Ship className="w-4 h-4" />
                <span>{t('harbor_passage_guidance')}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 font-normal">
                {advisoryStr}
              </p>
            </div>

            {/* Optimal Window */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-cyan-600" />
                <span className="font-medium">{t('optimal_docking_gate')}</span>
              </div>
              <span className="font-bold text-slate-800 font-mono">{formatNum(tide.favorableDockingWindow)}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-700 block">{t('hydrodynamic_parameters')}</span>
              <p className="text-[11px] text-slate-500">
                {t('tide_cycle_note')}
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
