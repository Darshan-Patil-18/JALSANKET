'use client';

import React from 'react';
import { MapPin, Navigation, LocateFixed, Compass, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { COASTAL_INDIA } from '@/lib/coastalIndia';
import { useLocation } from '@/lib/LocationContext';
import { useLanguage } from '@/lib/LanguageContext';

export default function GlobalLocationBar() {
  const { location, selectLocation, useMyLocation, clearNote } = useLocation();
  const { t, formatNum, localizeLocation } = useLanguage();

  const currentStateObj =
    COASTAL_INDIA.find((s) => s.state.toLowerCase() === location.state.toLowerCase()) || COASTAL_INDIA[0];

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStateName = e.target.value;
    const sObj = COASTAL_INDIA.find((s) => s.state === newStateName);
    if (sObj && sObj.cities.length > 0) {
      selectLocation(sObj.state, sObj.cities[0].name);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectLocation(location.state, e.target.value);
  };

  const renderLocationNote = () => {
    if (location.error) {
      if (location.error.includes('denied')) return t('loc_err_denied') !== 'loc_err_denied' ? t('loc_err_denied') : location.error;
      if (location.error.includes('timed out')) return t('loc_err_timeout') !== 'loc_err_timeout' ? t('loc_err_timeout') : location.error;
      return location.error;
    }
    const nd = location.locationNoteData;
    if (nd) {
      const dCity = localizeLocation(nd.detectedCity);
      const nCity = localizeLocation(nd.nearestCity);
      const nDist = formatNum(nd.distanceKm);
      if (nd.type === 'detected_far') {
        const farTpl = t('loc_note_detected_far');
        if (farTpl && farTpl !== 'loc_note_detected_far') {
          return farTpl
            .replace('{city}', dCity)
            .replace('{nearest}', nCity)
            .replace('{distance}', nDist);
        }
      } else if (nd.type === 'detected_near') {
        const nearTpl = t('loc_note_detected_near');
        if (nearTpl && nearTpl !== 'loc_note_detected_near') {
          return nearTpl
            .replace('{city}', dCity)
            .replace('{nearest}', nCity)
            .replace('{distance}', nDist);
        }
      }
    }
    return location.locationNote;
  };

  return (
    <div className="w-full mb-5 sm:mb-6">
      <div className="p-3 sm:p-4 rounded-2xl bg-white/85 backdrop-blur-xl border border-slate-200/90 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-200">
        
        {/* Left: Location Icon & Two-Step Selectors */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
          
          {/* Active Location Pin & Label */}
          <div className="flex items-center gap-2 pr-2 sm:pr-3 sm:border-r border-slate-200 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-cyan-500/30">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
                {t('nationwide_sector')}
              </span>
              <span className="text-xs font-bold text-slate-800">
                {t('coastal_hub')}
              </span>
            </div>
          </div>

          {/* Selectors Group */}
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            {/* Step 1: Select State Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                id="global-state-select"
                value={location.state}
                onChange={handleStateChange}
                className="w-full appearance-none pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-300/80 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-sm transition truncate"
                aria-label="Select Coastal State"
              >
                {COASTAL_INDIA.map((st) => (
                  <option key={st.state} value={st.state} className="bg-white text-slate-800 font-medium">
                    {localizeLocation(st.state)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Step 2: Select Coastal City / Port Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                id="global-city-select"
                value={location.city}
                onChange={handleCityChange}
                className="w-full appearance-none pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-300/80 text-xs sm:text-sm font-bold text-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-sm transition truncate"
                aria-label="Select Coastal City"
              >
                {currentStateObj.cities.map((ct) => (
                  <option key={ct.name} value={ct.name} className="bg-white text-slate-800 font-medium">
                    {localizeLocation(ct.name)} {ct.isMajorPort ? '⚓' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Coordinate Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-semibold text-slate-600 shrink-0">
            <Navigation className="w-3.5 h-3.5 text-cyan-600 -rotate-45" />
            <span>
              {formatNum(location.lat.toFixed(4))}° N, {formatNum(location.lng.toFixed(4))}° E
            </span>
          </div>

        </div>

        {/* Right: "Use My Location" Button & Status */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
          
          {/* Source Indicator Tag */}
          {location.source === 'geolocation' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm animate-pulse truncate max-w-[150px] sm:max-w-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="truncate">
                {location.userRealLocationName 
                  ? `${t('gps_label') || 'GPS'}: ${localizeLocation(location.userRealLocationName)}` 
                  : (t('live_gps_fix') || 'Live GPS Fix')}
              </span>
            </span>
          )}

          {/* "Use My Location" Button */}
          <button
            onClick={useMyLocation}
            disabled={location.isLocating}
            className={`
              flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm
              ${
                location.source === 'geolocation'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-500/25 ring-2 ring-cyan-400/50'
                  : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 hover:border-cyan-400'
              }
            `}
            title="Detect your live geolocation using browser GPS"
          >
            <LocateFixed
              className={`w-4 h-4 shrink-0 ${location.isLocating ? 'animate-spin text-cyan-500' : location.source === 'geolocation' ? 'text-white' : 'text-cyan-600'}`}
            />
            <span className="whitespace-nowrap">{location.isLocating ? (t('detecting_gps') || 'Detecting GPS…') : (t('use_my_location') || 'Use My Location')}</span>
          </button>

        </div>

      </div>

      {/* Note / Alert Banner when location note or error is present */}
      {(location.locationNote || location.error) && (
        <div className="mt-2 flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-amber-50/95 border border-amber-200 text-xs font-medium text-amber-900 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{renderLocationNote()}</span>
          </div>
          <button
            onClick={clearNote}
            className="text-amber-700 hover:text-amber-900 underline font-semibold ml-2 shrink-0 cursor-pointer"
          >
            {t('dismiss') || 'Dismiss'}
          </button>
        </div>
      )}
    </div>
  );
}
