'use client';

import React, { useState } from 'react';
import {
  MapPin, LocateFixed, Share2, Heart,
  Thermometer, CloudRain, Wind, Droplets,
  ArrowUpRight, Sun, Cloud, CloudSun, Moon, MoonStar,
  Gauge, Eye, Sunrise
} from 'lucide-react';
import { WeatherData, AqiData } from '@/lib/types';
import { useLanguage } from '@/lib/LanguageContext';

interface WeatherTabProps {
  weather: WeatherData;
  aqi: AqiData;
  onLocateMe: () => void;
  isLoadingLocate?: boolean;
}

export default function WeatherTab({ weather, aqi, onLocateMe, isLoadingLocate }: WeatherTabProps) {
  const { t, formatNum, localizeLocation, translateCondition } = useLanguage();
  const [forecastMode, setForecastMode] = useState<'hourly' | 'daily'>('hourly');
  const [isFavorited, setIsFavorited] = useState(false);

  const getTempBadge = (temp: number) => {
    if (temp >= 35) return { label: t('badge_hot'),      color: 'bg-red-500 text-white' };
    if (temp >= 30) return { label: t('badge_warm'),     color: 'bg-orange-500 text-white' };
    if (temp >= 22) return { label: t('badge_pleasant'), color: 'bg-emerald-500 text-white' };
    if (temp >= 15) return { label: t('badge_mild'),     color: 'bg-cyan-500 text-white' };
    return           { label: t('badge_cool'),     color: 'bg-blue-500 text-white' };
  };
  const tempBadge = getTempBadge(weather.current.temp);

  const gaugePercent = Math.min(100, Math.max(0, (aqi.aqi / 300) * 100));
  const angle        = (gaugePercent / 100) * 180;

  // Returns the right icon based on WMO weather code AND local hour
  const WeatherIcon = ({ code, hour, size = 'md' }: { code: number; hour?: number; size?: 'sm' | 'md' | 'lg' }) => {
    const cls = size === 'lg' ? 'w-20 h-20' : size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
    const h = hour !== undefined ? hour : new Date().getHours();

    if (code >= 60) return <CloudRain className={`${cls} text-blue-500`} />;
    if (code >= 3)  return <Cloud     className={`${cls} text-slate-400`} />;
    if (code >= 2) {
      if (h >= 7 && h < 18) return <CloudSun className={`${cls} text-sky-500`} />;
      return <MoonStar className={`${cls} text-indigo-300`} />;
    }
    if (h >= 4 && h < 7)  return <MoonStar className={`${cls} text-indigo-200`} />;
    if (h >= 7 && h < 18) return <Sun      className={`${cls} text-yellow-500`} />;
    return <Moon className={`${cls} text-indigo-300`} />;
  };

  const getConditionDescription = () => {
    if (weather.current.conditionCode >= 60) return t('rain_desc');
    if (weather.current.conditionCode <= 1) return t('clear_sky_desc');
    return t('cloudy_desc');
  };

  const getHumidityDesc = (h: number) => {
    if (h < 40) return t('humidity_low');
    if (h > 70) return t('humidity_high');
    return t('humidity_mid');
  };

  const getWindDesc = (w: number) => {
    if (w < 12) return t('wind_calm');
    if (w <= 28) return t('wind_moderate');
    return t('wind_strong');
  };

  const formatDay = (displayDay: string) => {
    if (displayDay === 'Today') return t('day_today');
    const d = displayDay.toLowerCase();
    const key = `day_${d}`;
    const trans = t(key);
    return trans !== key ? trans : displayDay;
  };

  return (
    <div className="w-full">
      {/* ── Location header with crisp WHITE TITLE ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-6 h-6 text-cyan-400 drop-shadow" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              {localizeLocation(weather.locationName)} — {t('weather_title')}
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-300 ml-8 drop-shadow">
            {t('weather_subtitle')} · Open-Meteo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLocateMe}
            disabled={isLoadingLocate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/85 hover:bg-white border border-slate-200/90 text-sm font-semibold text-slate-800 transition shadow-sm"
          >
            <LocateFixed className={`w-4 h-4 text-cyan-600 ${isLoadingLocate ? 'animate-spin' : ''}`} />
            {isLoadingLocate ? t('locating') : t('locate_me')}
          </button>
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className="p-2.5 rounded-xl bg-white/85 hover:bg-white border border-slate-200/90 text-slate-700 transition shadow-sm"
            title="Save location"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
          </button>
          <button
            onClick={() => navigator.share?.({ title: `${weather.locationName} Weather`, url: window.location.href })}
            className="p-2.5 rounded-xl bg-white/85 hover:bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 transition shadow-sm"
            title={t('share')}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: current conditions */}
        <div className="lg:col-span-7 space-y-5">

          {/* Big temperature card */}
          <div className="card flex flex-wrap items-center gap-8">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-yellow-200/30 rounded-full blur-2xl" />
              <WeatherIcon code={weather.current.conditionCode} size="lg" />
            </div>

            <div>
              <div className="flex items-start leading-none">
                <span className="text-7xl font-black text-slate-800 font-mono tracking-tight">
                  {formatNum(weather.current.temp)}
                </span>
                <span className="text-4xl font-light text-slate-500 mt-2">°C</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 font-medium">
                <span>↑ {formatNum(weather.current.tempMax)}°</span>
                <span>↓ {formatNum(weather.current.tempMin)}°</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${tempBadge.color}`}>
                  {tempBadge.label}
                </span>
              </div>
            </div>

            <div className="border-l border-slate-200 pl-8 space-y-2">
              <p className="text-xl font-bold text-slate-700">
                {translateCondition(weather.current.conditionText, weather.current.conditionCode)}
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Thermometer className="w-4 h-4 text-slate-400" />
                {t('feels_like')} <strong className="ml-1 text-slate-800">{formatNum(weather.current.feelsLike)}°C</strong>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CloudRain className="w-4 h-4 text-cyan-500" />
                {t('rain_chance')} <strong className="ml-1 text-slate-800">{formatNum(weather.current.chancesOfRain)}%</strong>
              </div>
            </div>
          </div>

          {/* Primary Stat Cards (AQI + Humidity) */}
          <div className="grid grid-cols-2 gap-4">
            {/* AQI mini */}
            <div className="stat-chip flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="relative w-28 h-14 overflow-hidden">
                  <svg viewBox="0 0 100 50" className="w-full h-full">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="10" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="waqiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%"   stopColor="#10b981" />
                        <stop offset="35%"  stopColor="#f59e0b" />
                        <stop offset="70%"  stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#waqiGrad)" strokeWidth="10" strokeLinecap="round" />
                    <circle
                      cx={50 - 40 * Math.cos((angle * Math.PI) / 180)}
                      cy={50 - 40 * Math.sin((angle * Math.PI) / 180)}
                      r="4" fill="white" stroke="#64748b" strokeWidth="1.5"
                    />
                  </svg>
                  <div className="absolute bottom-0 inset-x-0 text-center text-[10px] font-bold uppercase text-slate-500">{aqi.category}</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-800 font-mono">{formatNum(aqi.aqi)}</span>
                  <span className="text-xs font-semibold text-slate-500">AQI</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{aqi.summary}</p>
              </div>
            </div>

            {/* Humidity */}
            <div className="stat-chip flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">{t('humidity')}</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-bold text-slate-800 font-mono">{formatNum(weather.current.humidity)}</span>
                    <span className="text-xs font-semibold text-slate-500">%</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                {getHumidityDesc(weather.current.humidity)}
              </p>
            </div>
          </div>

          {/* ── EXPANDED DETAILED MARINE & ATMOSPHERIC CARDS (Wind, Pressure, UV, Visibility) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Wind Speed */}
            <div className="stat-chip flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('wind_speed')}</span>
                <Wind className="w-4 h-4 text-sky-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-800 font-mono">{formatNum(weather.current.windSpeed)}</span>
                <span className="text-xs font-medium text-slate-500">km/h</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                {getWindDesc(weather.current.windSpeed)}
              </p>
            </div>

            {/* Atmospheric Pressure */}
            <div className="stat-chip flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('pressure')}</span>
                <Gauge className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-800 font-mono">{formatNum(weather.current.pressure)}</span>
                <span className="text-xs font-medium text-slate-500">hPa</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                {weather.current.pressure >= 1010 ? t('pressure_normal') : t('barometric_depression')}
              </p>
            </div>

            {/* UV Index */}
            <div className="stat-chip flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('uv_index')}</span>
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-800 font-mono">{formatNum(weather.current.uvIndex ?? 5)}</span>
                <span className="text-xs font-medium text-emerald-600 font-semibold">
                  {(weather.current.uvIndex ?? 5) <= 2 ? 'Low' : (weather.current.uvIndex ?? 5) <= 5 ? 'Moderate' : 'High'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                {t('solar_radiation_desc')}
              </p>
            </div>

            {/* Visibility */}
            <div className="stat-chip flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{t('visibility')}</span>
                <Eye className="w-4 h-4 text-teal-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-800 font-mono">{formatNum(10)}+</span>
                <span className="text-xs font-medium text-slate-500">km</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                {t('visibility_optimal')}
              </p>
            </div>
          </div>

          {/* Marine Daylight & Coastal Sunlight Timings */}
          <div className="card flex items-center justify-between py-3.5 px-5 bg-gradient-to-r from-amber-50/70 via-sky-50/60 to-indigo-50/70 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center">
                <Sunrise className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 block">{t('sun_marine_window')}</span>
                <span className="text-[11px] text-slate-500">{t('marine_daylight_cycle')}</span>
              </div>
            </div>
            <div className="flex items-center gap-5 text-right font-mono">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('first_light')}</span>
                <span className="text-sm font-bold text-slate-800">{formatNum('05:48 AM')}</span>
              </div>
              <div className="border-l border-slate-200 pl-5">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">{t('sunset')}</span>
                <span className="text-sm font-bold text-slate-800">{formatNum('06:54 PM')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Hourly / Daily forecast */}
        <div className="lg:col-span-5">
          <div className="card space-y-5">
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200">
                {(['hourly', 'daily'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setForecastMode(m)}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition ${
                      forecastMode === m
                        ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {m === 'hourly' ? t('hourly') : t('daily')}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {forecastMode === 'hourly' ? t('next_6_hours') : t('six_day_outlook')}
              </span>
            </div>

            {forecastMode === 'hourly' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-2">
                  {weather.hourly.slice(0, 6).map((h, i) => {
                    const slotHour = h.time ? new Date(h.time).getHours() : new Date().getHours();
                    return (
                      <div key={i} className="flex flex-col items-center py-3 px-1 rounded-xl bg-slate-50 border border-slate-200 text-center hover:border-cyan-400 transition">
                        <span className="text-[11px] font-semibold text-slate-500 mb-2">
                          {h.displayTime === 'Now' ? t('time_now') : formatNum(h.displayTime)}
                        </span>
                        <WeatherIcon code={h.conditionCode} hour={slotHour} size="sm" />
                        <span className="text-xs font-bold text-slate-800 font-mono mt-2">{formatNum(h.temp)}°</span>
                      </div>
                    );
                  })}
                </div>
                {/* Rain row */}
                <div className="grid grid-cols-6 text-center text-[10px] text-slate-500 font-medium">
                  {weather.hourly.slice(0, 6).map((h, i) => (
                    <span key={i} className="flex items-center justify-center gap-0.5">
                      <CloudRain className="w-2.5 h-2.5 text-blue-400" />{formatNum(h.rainChance)}%
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-600 border-t border-slate-200 pt-3">
                  {getConditionDescription()}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {weather.daily.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-14 text-xs font-semibold text-slate-700">{formatDay(d.displayDay)}</span>
                    <div className="flex items-center gap-1.5">
                      <WeatherIcon code={d.conditionCode} size="sm" />
                      <span className="text-xs text-slate-500">{translateCondition(d.conditionText, d.conditionCode)}</span>
                    </div>
                    <div className="flex gap-3 font-mono text-xs">
                      <span className="font-bold text-slate-800">{formatNum(d.tempMax)}°</span>
                      <span className="text-slate-400">{formatNum(d.tempMin)}°</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <p className="mt-6 text-xs text-slate-500 drop-shadow italic">
        {t('last_updated')}: {formatNum(weather.lastUpdated)}
      </p>
    </div>
  );
}
