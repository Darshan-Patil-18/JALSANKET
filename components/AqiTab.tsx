'use client';

import React, { useState } from 'react';
import {
  MapPin, LocateFixed, Share2, Heart, Wind, Activity, Info,
  ShieldCheck, AlertTriangle, Sparkles, Compass, Users, Anchor
} from 'lucide-react';
import { AqiData, WeatherData } from '@/lib/types';
import { useLanguage } from '@/lib/LanguageContext';

interface AqiTabProps {
  aqi: AqiData;
  weather: WeatherData;
  onLocateMe: () => void;
  isLoadingLocate?: boolean;
}

export default function AqiTab({ aqi, weather, onLocateMe, isLoadingLocate }: AqiTabProps) {
  const { t } = useLanguage();
  const [isFavorited, setIsFavorited] = useState(false);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Good': return t('cat_good');
      case 'Moderate': return t('cat_moderate');
      case 'Poor': return t('cat_poor');
      case 'Unhealthy': return t('cat_unhealthy');
      default: return status;
    }
  };

  const pollutants = [
    {
      code: 'PM2.5',
      name: t('pollutant_pm25'),
      value: aqi.pm25,
      unit: 'µg/m³',
      safeMax: 30,
      status: aqi.pm25 <= 30 ? 'Good' : aqi.pm25 <= 60 ? 'Moderate' : 'Poor',
      statusColor: aqi.pm25 <= 30 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : aqi.pm25 <= 60 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-red-600 bg-red-50 border-red-200'
    },
    {
      code: 'PM10',
      name: t('pollutant_pm10'),
      value: aqi.pm10,
      unit: 'µg/m³',
      safeMax: 50,
      status: aqi.pm10 <= 50 ? 'Good' : aqi.pm10 <= 100 ? 'Moderate' : 'Poor',
      statusColor: aqi.pm10 <= 50 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : aqi.pm10 <= 100 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-red-600 bg-red-50 border-red-200'
    },
    {
      code: 'CO',
      name: t('pollutant_co'),
      value: aqi.co,
      unit: 'µg/m³',
      safeMax: 1000,
      status: aqi.co <= 1000 ? 'Good' : 'Moderate',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      code: 'SO₂',
      name: t('pollutant_so2'),
      value: aqi.so2,
      unit: 'µg/m³',
      safeMax: 40,
      status: aqi.so2 <= 40 ? 'Good' : 'Moderate',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      code: 'NO₂',
      name: t('pollutant_no2'),
      value: aqi.no2,
      unit: 'µg/m³',
      safeMax: 40,
      status: aqi.no2 <= 40 ? 'Good' : 'Moderate',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      code: 'O₃',
      name: t('pollutant_o3'),
      value: aqi.o3,
      unit: 'µg/m³',
      safeMax: 100,
      status: aqi.o3 <= 100 ? 'Good' : 'Moderate',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
  ];

  const gaugePercent = Math.min(100, Math.max(0, (aqi.aqi / 300) * 100));
  const angle        = (gaugePercent / 100) * 180;

  const getAdvisoryText = () => {
    if (aqi.aqi <= 50) return t('advisory_good');
    if (aqi.aqi <= 100) return t('advisory_moderate');
    return t('advisory_unhealthy');
  };

  return (
    <div className="w-full text-white">

      {/* ── Location header with crisp WHITE TITLE matching hazard/emergency tabs ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wind className="w-6 h-6 text-cyan-400 drop-shadow" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              {weather.locationName} — {t('aqi_title')}
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-300 ml-8 drop-shadow">
            {t('aqi_subtitle')} · Real-time Particulate & Trace Gas Sensors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onLocateMe}
            disabled={isLoadingLocate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#28323f]/95 hover:bg-[#323d4c] border border-white/15 text-sm font-semibold text-white transition shadow-lg"
          >
            <LocateFixed className={`w-4 h-4 text-cyan-400 ${isLoadingLocate ? 'animate-spin' : ''}`} />
            {isLoadingLocate ? t('locating') : t('locate_me')}
          </button>
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className="p-2.5 rounded-xl bg-[#28323f]/95 hover:bg-[#323d4c] border border-white/15 text-white transition shadow-lg"
            title="Save location"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-300'}`} />
          </button>
          <button
            onClick={() => navigator.share?.({ title: `${weather.locationName} AQI`, url: window.location.href })}
            className="p-2.5 rounded-xl bg-[#28323f]/95 hover:bg-[#323d4c] border border-white/15 text-slate-300 hover:text-white transition shadow-lg"
            title={t('share')}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: AQI meter & Advisory & Hourly */}
        <div className="lg:col-span-6 space-y-5">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t('air_quality_level')}
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                style={{ backgroundColor: aqi.badgeBg, color: aqi.categoryColor }}
              >
                {aqi.category}
              </span>
            </div>

            {/* Semi-circle gauge */}
            <div className="flex flex-col items-center my-2">
              <div className="relative w-52 h-28 overflow-hidden">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="10" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="aqiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor="#10b981" />
                      <stop offset="35%"  stopColor="#f59e0b" />
                      <stop offset="65%"  stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#aqiGrad)" strokeWidth="10" strokeLinecap="round" />
                  <circle
                    cx={50 - 40 * Math.cos((angle * Math.PI) / 180)}
                    cy={50 - 40 * Math.sin((angle * Math.PI) / 180)}
                    r="4.5" fill="white" stroke="#64748b" strokeWidth="1.5"
                  />
                </svg>
                <div className="absolute bottom-0 inset-x-0 text-center">
                  <span className="text-4xl font-extrabold text-slate-800 font-mono tracking-tight">{aqi.aqi}</span>
                  <span className="text-sm font-semibold text-slate-500 ml-1">AQI</span>
                </div>
              </div>
              <p className="text-sm text-center text-slate-600 font-medium max-w-sm mt-4">{aqi.summary}</p>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 flex items-start gap-3">
              <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <div className="text-xs text-cyan-800 leading-relaxed">
                <span className="font-semibold">{t('advisory')}: </span>
                {getAdvisoryText()}
              </div>
            </div>
          </div>

          {/* Hourly AQI trend */}
          <div className="card">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-4">
              {t('hourly_aqi_trend')}
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {aqi.hourlyAqi.slice(0, 6).map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center hover:border-cyan-400 transition">
                  <span className="text-[11px] font-semibold text-slate-500 block">{item.displayTime}</span>
                  <span className="text-lg font-bold text-slate-800 font-mono my-1 block">{item.aqi}</span>
                  <span className="text-[10px] text-cyan-600 font-semibold">PM2.5:{item.pm25}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comprehensive Coastal Health & Maritime Advisory Guide */}
          <div className="card space-y-3 bg-white/95">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t('health_guide_title')}
              </h3>
            </div>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <Users className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <span>{t('health_guide_general')}</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{t('health_guide_sensitive')}</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <Anchor className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>{t('health_guide_mariners')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Pollutant cards & Dust & UV */}
        <div className="lg:col-span-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {pollutants.map((p) => (
              <div key={p.code} className="stat-chip group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-slate-800 tracking-wide">{p.code}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${p.statusColor}`}>
                    {getStatusLabel(p.status)}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-slate-800 font-mono">{p.value}</span>
                  <span className="text-xs font-medium text-slate-500">{p.unit}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{p.name}</p>
                {/* Progress bar to safe max */}
                <div className="mt-2 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      p.value <= p.safeMax ? 'bg-emerald-400' : p.value <= p.safeMax * 2 ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min(100, (p.value / (p.safeMax * 3)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Extra Row: Atmospheric Dust Card + UV Index Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Atmospheric Dust */}
            <div className="stat-chip flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                <Wind className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-500 block truncate">{t('pollutant_dust')}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-800 font-mono">{aqi.dust ?? 14.2}</span>
                  <span className="text-xs text-slate-500">µg/m³</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">{t('dust_desc')}</p>
              </div>
            </div>

            {/* UV Index */}
            <div className="stat-chip flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-500 block">{t('uv_index')}</span>
                <span className="text-lg font-bold text-slate-800 font-mono">{aqi.uvIndex} — {aqi.uvIndex <= 2 ? 'Low' : aqi.uvIndex <= 5 ? 'Moderate' : 'High'}</span>
                <p className="text-[10px] text-slate-400 truncate">Solar irradiance index</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      <p className="mt-6 text-xs text-slate-300 drop-shadow italic">
        {t('last_updated')}: {aqi.lastUpdated}
      </p>
    </div>
  );
}
