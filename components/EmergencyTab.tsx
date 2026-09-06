'use client';

import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Radio, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Satellite
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { useLocation } from '@/lib/LocationContext';
import { getEmergencyContactsForCity } from '@/lib/zoneData';

export default function EmergencyTab() {
  const { t, formatNum, localizeLocation } = useLanguage();
  const { location } = useLocation();
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const contacts = getEmergencyContactsForCity(location.city, location.state, location.lat, location.lng);
  const lat = location.userRealCoords?.lat ?? location.lat;
  const lon = location.userRealCoords?.lng ?? location.lng;
  const locName = `${location.city} Coastal Sector`;

  const handleTriggerSos = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setSosActive(true);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  return (
    <div className="w-full">
      {/* Top Location Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LifeBuoy className="w-6 h-6 text-rose-500 animate-spin drop-shadow" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              {localizeLocation(locName)} — {t('emergency_title')}
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-300 ml-8 drop-shadow">
            {t('emergency_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/85 border border-slate-200/90 text-xs font-semibold text-slate-700 backdrop-blur-md shadow-sm">
          <Satellite className="w-3.5 h-3.5 text-cyan-600" />
          <span>{t('telemetry_active')}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section: Big Prominent SOS Trigger Card */}
        <div className="lg:col-span-6 space-y-6">
          <div className="card p-5 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
            
            {/* Ambient Red Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-rose-100/40 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 w-full flex flex-col items-center">
              
              {/* Big Pulsing Distress Button */}
              <button
                onClick={handleTriggerSos}
                disabled={sosActive || countdown !== null}
                className={`relative group w-40 h-40 sm:w-48 sm:h-48 rounded-full flex flex-col items-center justify-center p-3 sm:p-4 transition-all duration-300 shadow-2xl ${
                  sosActive
                    ? 'bg-rose-600 border-4 border-rose-300 animate-pulse shadow-rose-600/50'
                    : 'bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 hover:from-rose-400 hover:to-red-600 border-4 border-rose-300/80 hover:scale-105 shadow-rose-700/50 cursor-pointer active:scale-95'
                }`}
              >
                {/* Ping Beacon Ring */}
                <span className="absolute -inset-2 rounded-full border-2 border-rose-400/50 animate-ping opacity-60 pointer-events-none" />
                <span className="absolute -inset-5 sm:-inset-6 rounded-full border border-rose-400/30 animate-pulse pointer-events-none" />

                <Radio className={`w-10 h-10 sm:w-12 sm:h-12 mb-1.5 sm:mb-2 text-white ${sosActive ? 'animate-bounce' : ''}`} />
                <span className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                  {countdown !== null ? `ARMING (${formatNum(countdown)}s)` : sosActive ? t('sos_cancel') : t('sos_activate')}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-rose-100 uppercase tracking-widest mt-0.5 sm:mt-1">
                  {sosActive ? t('telemetry_uplinked') : t('one_touch_distress')}
                </span>
              </button>

              {/* Status Banner */}
              {sosActive ? (
                <div className="mt-6 p-4 w-full rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-rose-600 animate-ping" />
                      {t('sos_active_banner')}
                    </span>
                    <button
                      onClick={() => setSosActive(false)}
                      className="text-xs text-rose-600 hover:text-rose-800 underline font-semibold ml-2"
                    >
                      {t('sos_cancel')}
                    </button>
                  </div>
                  <div className="text-xs text-slate-700 font-mono space-y-1">
                    <p>• {t('your_location')}: <strong className="text-slate-900">{formatNum(lat.toFixed(4))}°N, {formatNum(lon.toFixed(4))}°E</strong></p>
                    <p>• SAR Hub: <strong className="text-cyan-700">{t('sar_hub_notified')}</strong></p>
                    <p>• {t('distress_channel')}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600 max-w-sm mt-6 leading-relaxed">
                  {t('emergency_alert_info')}
                </p>
              )}

              {/* Current Vessel GPS Fix Card */}
              <div className="w-full mt-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{t('your_location')}:</span>
                </div>
                <span className="font-bold text-slate-800 font-mono">{formatNum(lat.toFixed(4))}° N, {formatNum(lon.toFixed(4))}° E</span>
              </div>

            </div>

          </div>
        </div>

        {/* Right Section: Emergency Contacts List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t('emergency_contacts')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {t('active_24_7')}
              </span>
            </div>

            {/* List */}
            <div className="space-y-3">
              {contacts.map((contact) => {
                const nameStr = t(`ec_${contact.id}_name`) !== `ec_${contact.id}_name` ? t(`ec_${contact.id}_name`) : contact.name;
                const typeStr = t(`ec_${contact.id}_type`) !== `ec_${contact.id}_type` ? t(`ec_${contact.id}_type`) : contact.type;
                const distStr = t(`ec_${contact.id}_dist`) !== `ec_${contact.id}_dist` ? t(`ec_${contact.id}_dist`) : contact.distance;
                const freqStr = t(`ec_${contact.id}_freq`) !== `ec_${contact.id}_freq` ? t(`ec_${contact.id}_freq`) : contact.frequency;
                const phoneStr = t(`ec_${contact.id}_phone`) !== `ec_${contact.id}_phone` ? t(`ec_${contact.id}_phone`) : contact.phone;

                return (
                  <div 
                    key={contact.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-cyan-400 transition space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 tracking-wide">
                          {nameStr}
                        </h4>
                        <span className="text-xs text-cyan-700 font-medium block">
                          {typeStr}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        {formatNum(distStr)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-200/60 font-mono">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Radio className="w-3.5 h-3.5 text-cyan-600" />
                        <span>{formatNum(freqStr)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-slate-800">{formatNum(phoneStr)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Maritime Protocol Note */}
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 space-y-1">
              <span className="font-semibold text-rose-800 block">{t('intl_distress_protocol')}</span>
              <p className="text-[11px] text-rose-800/80 leading-relaxed">
                {t('distress_protocol_text')}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Required Bottom Demo Disclaimer */}
      <div className="disclaimer-bar">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p>
          {t('emergency_disclaimer')}
        </p>
      </div>
    </div>
  );
}
