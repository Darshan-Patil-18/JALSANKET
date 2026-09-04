'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar, { TabType } from '@/components/Navbar';
import WeatherTab from '@/components/WeatherTab';
import AqiTab from '@/components/AqiTab';
import FishingZoneTab from '@/components/FishingZoneTab';
import HazardTab from '@/components/HazardTab';
import TideTab from '@/components/TideTab';
import EmergencyTab from '@/components/EmergencyTab';
import { WeatherData, AqiData } from '@/lib/types';
import { fetchLiveWeatherData, fetchLiveAqiData, reverseGeocode } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('weather');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [aqiData, setAqiData] = useState<AqiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number; name: string }>({
    lat: 23.0225,
    lon: 72.5714,
    name: 'Ahmedabad',
  });

  const loadData = useCallback(async (lat: number, lon: number, locationName: string) => {
    try {
      setLoading(true);
      const [wData, aData] = await Promise.all([
        fetchLiveWeatherData(lat, lon, locationName),
        fetchLiveAqiData(lat, lon),
      ]);
      setWeatherData(wData);
      setAqiData(aData);
      setLocationError(null);
    } catch (err) {
      console.error('Error fetching live data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRequestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      loadData(23.0225, 72.5714, 'Ahmedabad, Gujarat');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const locName = await reverseGeocode(latitude, longitude);
          setCurrentCoords({ lat: latitude, lon: longitude, name: locName });
          await loadData(latitude, longitude, locName);
        } catch {
          await loadData(latitude, longitude, `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocationError('Location access was not granted. Using default location (Ahmedabad).');
        setLocating(false);
        loadData(23.0225, 72.5714, 'Ahmedabad, Gujarat');
      },
      { timeout: 8000 }
    );
  }, [loadData]);

  useEffect(() => {
    handleRequestLocation();
  }, [handleRequestLocation]);

  const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0  },
    exit:    { opacity: 0, y: -10 },
  };

  return (
    <>
      {/* ── Full-width sticky Navbar: logo left, tabs right ── */}
      <Navbar activeTab={activeTab} onChange={setActiveTab} />

      {/* ── Page content ── */}
      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* Location denied alert */}
        {locationError && (
          <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50/90 border border-amber-300/60 backdrop-blur-sm text-amber-800 text-sm shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>{locationError}</span>
            <button
              onClick={handleRequestLocation}
              className="ml-auto underline font-semibold text-cyan-600 hover:text-cyan-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab panel */}
        {loading && !weatherData ? (
          <div className="flex flex-col items-center justify-center min-h-[450px] rounded-3xl bg-white/60 border border-white/80 backdrop-blur-md shadow-sm">
            <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin mb-3" />
            <p className="text-slate-600 text-sm font-medium">
              Fetching real-time data from Open-Meteo…
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'weather' && weatherData && aqiData && (
              <motion.div key="weather" variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22 }}>
                <WeatherTab weather={weatherData} aqi={aqiData} onLocateMe={handleRequestLocation} isLoadingLocate={locating} />
              </motion.div>
            )}
            {activeTab === 'aqi' && weatherData && aqiData && (
              <motion.div key="aqi" variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22 }}>
                <AqiTab aqi={aqiData} weather={weatherData} onLocateMe={handleRequestLocation} isLoadingLocate={locating} />
              </motion.div>
            )}
            {activeTab === 'fishing' && (
              <motion.div key="fishing" variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22 }}>
                <FishingZoneTab />
              </motion.div>
            )}
            {activeTab === 'hazard' && (
              <motion.div key="hazard" variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22 }}>
                <HazardTab />
              </motion.div>
            )}
            {activeTab === 'tides' && (
              <motion.div key="tides" variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22 }}>
                <TideTab />
              </motion.div>
            )}
            {activeTab === 'emergency' && (
              <motion.div key="emergency" variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22 }}>
                <EmergencyTab currentCoords={currentCoords} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </>
  );
}
