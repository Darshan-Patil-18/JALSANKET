'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { useLocation } from '@/lib/LocationContext';

export default function LocationPermissionModal() {
  const [showModal, setShowModal] = useState(false);
  const { useMyLocation, location } = useLocation();

  useEffect(() => {
    // Show modal if:
    // 1. User hasn't enabled location (no userRealCoords)
    // 2. User hasn't permanently dismissed it
    const hasPermanentlyDismissed = localStorage.getItem('jalsanket_location_dismissed');
    
    if (!hasPermanentlyDismissed && !location.userRealCoords) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.userRealCoords]);

  const handleEnableLocation = async () => {
    try {
      await useMyLocation();
      setShowModal(false);
    } catch (error) {
      console.error('Location permission error:', error);
    }
  };

  const handleSkip = () => {
    // Mark as permanently dismissed
    localStorage.setItem('jalsanket_location_dismissed', 'true');
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm animate-in fade-in duration-300" />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
        <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Enable Location</h2>
                <p className="text-sm text-cyan-100">Get accurate local data</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            <p className="text-slate-200 text-sm leading-relaxed mb-4">
              JalSanket uses your location to provide accurate weather, marine conditions, and coastal information specific to your area.
            </p>
            <div className="space-y-2 mb-5">
              <div className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-cyan-400 mt-0.5">✓</span>
                <span>Real-time weather and AQI for your exact location</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-cyan-400 mt-0.5">✓</span>
                <span>Nearest fishing zones and marine hazards</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-cyan-400 mt-0.5">✓</span>
                <span>Personalized coastal safety recommendations</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleEnableLocation}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30"
              >
                Enable Location
              </button>
              <button
                onClick={handleSkip}
                className="px-4 py-3 rounded-xl bg-slate-700/80 text-slate-200 font-medium hover:bg-slate-600/80 transition-all"
              >
                Skip
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-3">
              You can enable location anytime from the location bar above
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
