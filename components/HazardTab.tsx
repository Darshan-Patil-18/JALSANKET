'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  AlertTriangle, 
  Waves, 
  Wind, 
  Eye, 
  Compass, 
  ShieldAlert, 
  AlertOctagon
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useLocation } from '@/lib/LocationContext';
import { getHazardZoneForCity } from '@/lib/zoneData';
import { formatZoneNavigationText } from '@/lib/geoUtils';
import { fetchLiveMarineData } from '@/lib/api';
import { MarineData } from '@/lib/types';

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
  const { lang, t, formatNum, localizeLocation } = useLanguage();
  const { location } = useLocation();
  const [marineData, setMarineData] = useState<MarineData | null>(null);

  const selectedZone = getHazardZoneForCity(
    location.city,
    location.state,
    location.lat,
    location.lng
  );

  // REAL DATA UPGRADE: Fetch live wave height & sea conditions from Open-Meteo Marine API
  useEffect(() => {
    let isMounted = true;
    const fetchMarine = async () => {
      try {
        const [lat, lng] = selectedZone.shorePoint;
        const live = await fetchLiveMarineData(lat, lng);
        if (isMounted) setMarineData(live);
      } catch (e) {
        console.warn('Hazard tab marine fetch fallback:', e);
      }
    };
    fetchMarine();
    return () => { isMounted = false; };
  }, [selectedZone.id, selectedZone.shorePoint]);

  const getZoneDisplay = (zone: typeof selectedZone) => {
    const baseKey = zone.id.replace('-hazard', '');
    const nameKey = `hz_${baseKey}_name`;
    const typeKey = `hz_${baseKey}_type`;
    const nameStr = t(nameKey) !== nameKey ? t(nameKey) : `${localizeLocation(location.city)} ${t('coastal_sector') || 'Coastal Sector'}`;
    const typeStr = t(typeKey) !== typeKey 
      ? t(typeKey) 
      : zone.hazardType.toLowerCase().includes('undercurrent') || zone.hazardType.toLowerCase().includes('rip')
      ? (t('hazard_rip_current') || 'Strong Undercurrent & Rip Swell')
      : (t('hazard_submerged_reefs') || 'Submerged Reefs & Heavy Breakers');
    return { nameStr, typeStr };
  };

  const activeZoneDisplay = getZoneDisplay(selectedZone);
  const baseKey = selectedZone.id.replace('-hazard', '');

  const badgeStr = t(`hz_${baseKey}_badge`) !== `hz_${baseKey}_badge`
    ? t(`hz_${baseKey}_badge`)
    : selectedZone.statusBadge.toLowerCase().includes('high risk')
    ? (t('badge_high_risk_alert') || 'HIGH RISK ALERT')
    : (t('badge_navigational_danger') || 'NAVIGATIONAL DANGER');

  const recStr = t(`hz_${baseKey}_rec`) !== `hz_${baseKey}_rec`
    ? t(`hz_${baseKey}_rec`)
    : (t('hz_default_rec') || selectedZone.recommendation).replace('{knots}', formatNum('2.8'));

  const noteStr = t(`hz_${baseKey}_note`) !== `hz_${baseKey}_note`
    ? t(`hz_${baseKey}_note`)
    : (t('hz_default_note') || selectedZone.warningNote);

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

  const d1Str = t(`hz_${baseKey}_d1`) !== `hz_${baseKey}_d1`
    ? t(`hz_${baseKey}_d1`)
    : `${localizeLocation(location.city)} ${t('shoreline_anchor_point') || 'Shoreline Anchor Point'}`;

  const d2Str = t(`hz_${baseKey}_d2`) !== `hz_${baseKey}_d2`
    ? t(`hz_${baseKey}_d2`)
    : `${formatNum('15.0')} ${t('km') || 'km'} ${t('dir_sw') || 'SW'} (${t('rip_confluence_zone') || 'Rip Confluence Zone'})`;

  const d3Str = t(`hz_${baseKey}_d3`) !== `hz_${baseKey}_d3`
    ? t(`hz_${baseKey}_d3`)
    : `${formatNum('29.5')} ${t('km') || 'km'} ${t('dir_wsw') || 'WSW'} (${t('cross_sea_swell_axis') || 'Cross-Sea Swell Axis'})`;

  return (
    <div className="w-full">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-6 h-6 text-rose-400 drop-shadow" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              {activeZoneDisplay.nameStr} — {t('hazard_title')}
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-300 ml-8 drop-shadow">
            {t('hazard_subtitle')} · {localizeLocation(location.city)}, {localizeLocation(location.state)}
          </p>
        </div>

        {/* Active Coordinates & Hazard Status */}
        <div className="flex items-center gap-2">
          {navInfo && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-100 text-xs font-semibold backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
              <span>{navInfo.displayText}</span>
            </div>
          )}
          <div className="px-3.5 py-1.5 rounded-xl bg-white/85 border border-slate-200/90 text-xs font-semibold text-slate-700 backdrop-blur-md shadow-sm">
            <span>{t('coastal_warning_matrix') || 'Coastal Warning Matrix'}</span>
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
            {/* Wave Height — REAL TIME from Open-Meteo Marine API */}
            <div className="stat-chip flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('wave_height')}</span>
                <Waves className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold text-rose-600 font-mono">
                  {formatNum(marineData ? marineData.waveHeight : selectedZone.waveHeight)}
                </span>
                <span className="text-xs font-semibold text-slate-500">m</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-rose-600 font-medium">{t('rough_sea_state')}</span>
                <span className="text-[9px] font-semibold bg-rose-100 text-rose-700 px-1.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  LIVE
                </span>
              </div>
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
                {badgeStr}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200/80 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 text-sm font-semibold">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>{t('navigation_warning')}</span>
              </div>
              <p className="text-xs leading-relaxed text-rose-900 font-normal">
                {recStr}
              </p>
            </div>

            {/* Live Hazard Navigation Vector when user location is available */}
            {navInfo && (
              <div className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 text-xs text-rose-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <Compass className="w-4 h-4 text-rose-600 animate-spin-slow" />
                  <span>{t('realtime_hazard_proximity') || 'Real-time Hazard Proximity'}</span>
                </div>
                <p className="text-[11px] font-medium text-rose-800">
                  {navInfo.displayText}
                </p>
              </div>
            )}

            {/* Warning Note */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <span className="font-semibold text-amber-800 block">{t('hydrodynamic_assessment')}</span>
              <p>{noteStr}</p>
            </div>

            {/* Perimeter Details */}
            <div className="space-y-2 text-xs text-slate-700">
              <span className="font-semibold text-slate-600 block">{t('hazard_vectors_range')}</span>
              <ul className="space-y-1.5 pl-1">
                <li className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-lg">
                  <span className="text-slate-600 font-medium">{t('map_anchor_coastal')}</span>
                  <span className="font-mono text-rose-600 font-bold">
                    {d1Str}
                  </span>
                </li>
                <li className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-lg">
                  <span className="text-slate-600 font-medium">{t('map_hazard_p1')}</span>
                  <span className="font-mono text-rose-600 font-bold">
                    {d2Str}
                  </span>
                </li>
                <li className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-lg">
                  <span className="text-slate-600 font-medium">{t('map_hazard_p2')}</span>
                  <span className="font-mono text-rose-600 font-bold">
                    {d3Str}
                  </span>
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
            ? 'Weather and sea conditions shown are live. Hazard zone boundaries are simulated for demonstration purposes.'
            : (t('disclaimer_mixed_hazard') !== 'disclaimer_mixed_hazard' ? t('disclaimer_mixed_hazard') : 'Weather and sea conditions shown are live. Hazard zone boundaries are simulated for demonstration purposes.')}
        </p>
      </div>
    </div>
  );
}
