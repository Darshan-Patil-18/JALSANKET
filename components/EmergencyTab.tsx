'use client';

import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Radio, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Navigation,
  Satellite
} from 'lucide-react';
import { EMERGENCY_CONTACTS } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

interface EmergencyTabProps {
  currentCoords?: { lat: number; lon: number; name: string };
}

export default function EmergencyTab({ currentCoords }: EmergencyTabProps) {
  const { t } = useLanguage();
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const lat = currentCoords?.lat ?? 21.6417;
  const lon = currentCoords?.lon ?? 69.6293;
  const locName = currentCoords?.name ?? 'Porbandar Coastal Sector';

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
    <div className="w-full text-white">
      {/* Top Location Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-rose-500 animate-spin" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              {t('emergency_title')}
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-300 mt-0.5 ml-8 drop-shadow">
            {t('emergency_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-slate-300 backdrop-blur-md">
          <Satellite className="w-3.5 h-3.5 text-cyan-400" />
          <span>INSAT-3D / NavIC Telemetry Active</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section: Big Prominent SOS Trigger Card */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-rose-500/30 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
            
            {/* Ambient Red Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-rose-950/30 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 w-full flex flex-col items-center">
              
              {/* Big Pulsing Distress Button */}
              <button
                onClick={handleTriggerSos}
                disabled={sosActive || countdown !== null}
                className={`relative group w-48 h-48 rounded-full flex flex-col items-center justify-center p-4 transition-all duration-300 shadow-2xl ${
                  sosActive
                    ? 'bg-rose-700 border-4 border-rose-400 animate-pulse shadow-rose-600/60'
                    : 'bg-gradient-to-br from-rose-600 via-rose-700 to-red-800 hover:from-rose-500 hover:to-red-700 border-4 border-rose-400/60 hover:scale-105 shadow-rose-900/80 cursor-pointer active:scale-95'
                }`}
              >
                {/* Ping Beacon Ring */}
                <span className="absolute -inset-2 rounded-full border-2 border-rose-500/40 animate-ping opacity-60 pointer-events-none" />
                <span className="absolute -inset-6 rounded-full border border-rose-500/20 animate-pulse pointer-events-none" />

                <Radio className={`w-12 h-12 mb-2 text-white ${sosActive ? 'animate-bounce' : ''}`} />
                <span className="text-xl font-black uppercase tracking-wider text-white">
                  {countdown !== null ? `ARMING (${countdown}s)` : sosActive ? t('sos_cancel') : t('sos_activate')}
                </span>
                <span className="text-[10px] font-semibold text-rose-200 uppercase tracking-widest mt-1">
                  {sosActive ? 'Telemetry Uplinked' : 'One-Touch Distress'}
                </span>
              </button>

              {/* Status Banner */}
              {sosActive ? (
                <div className="mt-6 p-4 w-full rounded-2xl bg-rose-950/70 border border-rose-500/40 text-left space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-rose-400 animate-ping" />
                      {t('sos_active_banner')}
                    </span>
                    <button
                      onClick={() => setSosActive(false)}
                      className="text-xs text-slate-300 hover:text-white underline font-semibold ml-2"
                    >
                      {t('sos_cancel')}
                    </button>
                  </div>
                  <div className="text-xs text-slate-200 font-mono space-y-1">
                    <p>• {t('your_location')}: <strong className="text-white">{lat.toFixed(4)}°N, {lon.toFixed(4)}°E</strong></p>
                    <p>• SAR Hub: <strong className="text-cyan-300">MRCC Mumbai / Porbandar Notified</strong></p>
                    <p>• Distress Channel: <strong className="text-amber-300">VHF Ch 16 (156.8 MHz)</strong></p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-200 max-w-sm mt-6 leading-relaxed">
                  {t('emergency_alert_info')}
                </p>
              )}

              {/* Current Vessel GPS Fix Card */}
              <div className="w-full mt-6 p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>{t('your_location')}:</span>
                </div>
                <span className="font-bold text-white font-mono">{lat.toFixed(4)}° N, {lon.toFixed(4)}° E</span>
              </div>

            </div>

          </div>
        </div>

        {/* Right Section: Emergency Contacts List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl bg-[#2c3746]/95 border border-white/10 backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {t('emergency_contacts')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {t('active_24_7')}
              </span>
            </div>

            {/* List */}
            <div className="space-y-3">
              {EMERGENCY_CONTACTS.map((contact) => (
                <div 
                  key={contact.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-cyan-500/40 transition space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-wide">
                        {contact.name}
                      </h4>
                      <span className="text-xs text-cyan-400 font-medium block">
                        {contact.type}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-white/5">
                      {contact.distance}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1 border-t border-white/5 font-mono">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Radio className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{contact.frequency}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-white">{contact.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Maritime Protocol Note */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-rose-400 block">International Distress Radio Protocol:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                In real emergency situations at sea, transmit "MAYDAY MAYDAY MAYDAY" on VHF Marine Channel 16 or 2182 kHz SSB, followed by vessel name, GPS coordinates, and nature of distress.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Required Bottom Demo Disclaimer */}
      <div className="mt-6 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 backdrop-blur-md flex items-center gap-3 text-xs text-amber-200/90 font-medium">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        <p>
          ⚠ Demo only — no real emergency alert is dispatched. This simulation interface is for demonstration and review purposes.
        </p>
      </div>
    </div>
  );
}
