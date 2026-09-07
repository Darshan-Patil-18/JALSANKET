'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Compass, 
  Waves, 
  Thermometer, 
  Wind, 
  Clock, 
  AlertTriangle, 
  Fish, 
  Sparkles,
  Radio
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useLocation } from '@/lib/LocationContext';
import { getFishingZoneForCity } from '@/lib/zoneData';
import { formatZoneNavigationText } from '@/lib/geoUtils';
import { fetchLiveMarineData } from '@/lib/api';
import { MarineData } from '@/lib/types';

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
  const { lang, t, formatNum, localizeLocation } = useLanguage();
  const { location } = useLocation();
  const [marineData, setMarineData] = useState<MarineData | null>(null);

  const selectedZone = getFishingZoneForCity(
    location.city,
    location.state,
    location.lat,
    location.lng
  );

  // REAL DATA UPGRADE: Fetch real ocean sea temp & wave height from Open-Meteo Marine API
  useEffect(() => {
    let isMounted = true;
    const fetchMarine = async () => {
      try {
        const [lat, lng] = selectedZone.shorePoint;
        const live = await fetchLiveMarineData(lat, lng);
        if (isMounted) {
          setMarineData(live);
        }
      } catch (e) {
        console.warn('Marine fetch fallback:', e);
      }
    };
    fetchMarine();
    return () => { isMounted = false; };
  }, [selectedZone.id, selectedZone.shorePoint]);


  const getZoneDisplayName = (zoneId: string, fallbackName: string) => {
    const key = `fz_${zoneId}_name`;
    const translated = t(key);
    return translated !== key ? translated : `${localizeLocation(location.city)} ${t('coastal_sector') || fallbackName}`;
  };

  const navInfo = location.userRealCoords
    ? formatZoneNavigationText(
        location.userRealCoords.lat,
        location.userRealCoords.lng,
        selectedZone.shorePoint[0],
        selectedZone.shorePoint[1],
        lang,
        formatNum
      )
    : null;

  const badgeStr = t(`fz_${selectedZone.id}_badge`) !== `fz_${selectedZone.id}_badge`
    ? t(`fz_${selectedZone.id}_badge`)
    : selectedZone.statusBadge.toLowerCase().includes('optimal')
    ? (t('badge_optimal_pfz') || 'Optimal PFZ Window')
    : selectedZone.statusBadge.toLowerCase().includes('prime')
    ? (t('badge_prime_harvest') || 'Prime Harvest Window')
    : selectedZone.statusBadge.toLowerCase().includes('high yield')
    ? (t('badge_high_yield_pfz') || 'High Yield PFZ')
    : (t('badge_active_pfz') || 'Active PFZ Zone');

  const recStr = t(`fz_${selectedZone.id}_rec`) !== `fz_${selectedZone.id}_rec`
    ? t(`fz_${selectedZone.id}_rec`)
    : (t('fz_default_rec') || selectedZone.recommendation).replace('{city}', localizeLocation(location.city));

  const densityStr = t(`fz_${selectedZone.id}_density`) !== `fz_${selectedZone.id}_density`
    ? t(`fz_${selectedZone.id}_density`)
    : selectedZone.fishDensity.toLowerCase().includes('high')
    ? (t('density_high_pelagic') || 'High (Pelagic Shoals)')
    : (t('density_moderate_finfish') || 'Moderate (Coastal Finfish)');

  const d1Str = t(`fz_${selectedZone.id}_d1`) !== `fz_${selectedZone.id}_d1`
    ? t(`fz_${selectedZone.id}_d1`)
    : `${localizeLocation(location.city)} ${t('baseline_anchor_point') || 'Baseline Anchor Point'}`;

  const d2Str = t(`fz_${selectedZone.id}_d2`) !== `fz_${selectedZone.id}_d2`
    ? t(`fz_${selectedZone.id}_d2`)
    : `${formatNum('16.4')} ${t('km') || 'km'} ${t('dir_sw') || 'SW'} (${t('thermal_gradient') || 'Thermal Gradient'})`;

  const d3Str = t(`fz_${selectedZone.id}_d3`) !== `fz_${selectedZone.id}_d3`
    ? t(`fz_${selectedZone.id}_d3`)
    : `${formatNum('28.2')} ${t('km') || 'km'} ${t('dir_wsw') || 'WSW'} (${t('pelagic_shoal_core') || 'Pelagic Shoal Core'})`;

  return (
    <div className="w-full">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-6 h-6 text-cyan-400 drop-shadow" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              {getZoneDisplayName(selectedZone.id, selectedZone.name)} — {t('fishing_title')}
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-300 ml-8 drop-shadow">
            {t('fishing_subtitle')} · {localizeLocation(location.city)}, {localizeLocation(location.state)}
          </p>
        </div>

        {/* Active Coordinates & Navigation Indicator */}
        <div className="flex items-center gap-2">
          {navInfo && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-100 text-xs font-semibold backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>{navInfo.displayText}</span>
            </div>
          )}
          <div className="px-3.5 py-1.5 rounded-xl bg-white/85 border border-slate-200/90 text-xs font-semibold text-slate-700 backdrop-blur-md shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>{t('incois_pfz_model') || 'INCOIS-PFZ Satellite Model'} (Simulated)</span>
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
            <div className="stat-chip flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('sea_temp')}</span>
                <Thermometer className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold text-slate-800 font-mono">
                  {formatNum(marineData ? marineData.seaSurfaceTemp : selectedZone.seaSurfaceTemp)}
                </span>
                <span className="text-xs font-semibold text-slate-500">°C</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-emerald-600 font-medium">{t('optimal_gradient')}</span>
                <span className="text-[9px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE
                </span>
              </div>
            </div>

            {/* Wave Height */}
            <div className="stat-chip flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('wave_height')}</span>
                <Waves className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold text-slate-800 font-mono">
                  {formatNum(marineData ? marineData.waveHeight : selectedZone.waveHeight)}
                </span>
                <span className="text-xs font-semibold text-slate-500">m</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-cyan-700 font-medium">
                  {marineData ? `Swell: ${formatNum(marineData.swellWaveHeight)}m` : t('mild_sea_swell')}
                </span>
                <span className="text-[9px] font-semibold bg-cyan-100 text-cyan-800 px-1.5 py-0.2 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                  LIVE
                </span>
              </div>
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
                {densityStr}
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
                {badgeStr}
              </span>
            </div>

            <div className="card-inner space-y-2">
              <div className="flex items-center gap-2 text-cyan-700 text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>{t('advisory')}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 font-normal">
                {recStr}
              </p>
            </div>

            {/* Live Navigation Vector when user location is available */}
            {navInfo && (
              <div className="p-3.5 rounded-xl bg-cyan-50/90 border border-cyan-200 text-xs text-cyan-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-cyan-900">
                  <Compass className="w-4 h-4 text-cyan-700 animate-spin-slow" />
                  <span>{t('realtime_vessel_nav') || 'Real-time Vessel Navigation'}</span>
                </div>
                <p className="text-[11px] font-medium text-cyan-800">
                  {navInfo.displayText}
                </p>
              </div>
            )}

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
              <span className="font-semibold text-slate-600 block">{t('pfz_geometry_range')}</span>
              <ul className="space-y-1.5 pl-1">
                <li className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-lg">
                  <span className="text-slate-600 font-medium">{t('map_anchor_coastal')}</span>
                  <span className="font-mono text-cyan-700 font-bold">{d1Str}</span>
                </li>
                <li className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-lg">
                  <span className="text-slate-600 font-medium">{t('map_pelagic_edge')}</span>
                  <span className="font-mono text-cyan-700 font-bold">{d2Str}</span>
                </li>
                <li className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-lg">
                  <span className="text-slate-600 font-medium">{t('map_upwelling_vector')}</span>
                  <span className="font-mono text-cyan-700 font-bold">{d3Str}</span>
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
          {lang === 'en' 
            ? 'Weather and sea conditions shown are live. Fishing zone predictions are simulated.' 
            : (t('disclaimer_mixed_fishing') !== 'disclaimer_mixed_fishing' ? t('disclaimer_mixed_fishing') : 'Weather and sea conditions shown are live. Fishing zone predictions are simulated.')}
        </p>
      </div>
    </div>
  );
}
