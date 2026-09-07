'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar, { TabType } from '@/components/Navbar';
import WeatherTab from '@/components/WeatherTab';
import AqiTab from '@/components/AqiTab';
import FishingZoneTab from '@/components/FishingZoneTab';
import HazardTab from '@/components/HazardTab';
import TideTab from '@/components/TideTab';
import EmergencyTab from '@/components/EmergencyTab';
import GlobalLocationBar from '@/components/GlobalLocationBar';
import ChatOrb from '@/components/ChatOrb';
import ChatPanel from '@/components/ChatPanel';
import LocationPermissionModal from '@/components/LocationPermissionModal';

import { WeatherData, AqiData } from '@/lib/types';
import { fetchLiveWeatherData, fetchLiveAqiData } from '@/lib/api';
import { useLocation } from '@/lib/LocationContext';
import { useChat } from '@/lib/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('weather');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [aqiData, setAqiData] = useState<AqiData | null>(null);
  const [loading, setLoading] = useState(true);

  const { location } = useLocation();
  const { closeChat, isOpen } = useChat();

  // Track previous fetch coords to avoid duplicate fetches
  const prevFetchRef = useRef<string>('');

  const loadData = useCallback(async (lat: number, lng: number, cityName: string) => {
    try {
      setLoading(true);
      const [wData, aData] = await Promise.all([
        fetchLiveWeatherData(lat, lng, cityName),
        fetchLiveAqiData(lat, lng),
      ]);
      setWeatherData(wData);
      setAqiData(aData);
    } catch (err) {
      console.error('Error fetching live data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // KEY LOGIC: Weather & AQI use the user's REAL GPS coordinates if available,
  // so you get Ahmedabad weather when you're in Ahmedabad (not Kandla).
  // Fishing/Hazard/Tide tabs use the coastal city from context automatically.
  useEffect(() => {
    let fetchLat: number;
    let fetchLng: number;
    let fetchName: string;

    if (location.source === 'geolocation' && location.userRealCoords) {
      // User clicked "Use My Location" — show weather for their ACTUAL position
      fetchLat = location.userRealCoords.lat;
      fetchLng = location.userRealCoords.lng;
      fetchName = location.userRealLocationName || location.city;
    } else {
      // Manual dropdown selection — show weather for the selected coastal city
      fetchLat = location.lat;
      fetchLng = location.lng;
      fetchName = location.city;
    }

    const fetchKey = `${fetchLat.toFixed(3)}_${fetchLng.toFixed(3)}`;
    if (fetchKey !== prevFetchRef.current) {
      prevFetchRef.current = fetchKey;
      loadData(fetchLat, fetchLng, fetchName);
    }
  }, [location.lat, location.lng, location.city, location.source, location.userRealCoords, location.userRealLocationName, loadData]);

  // AUTO-CLOSE chatbot when navigating to SOS / Emergency tab.
  // This does NOT clear chat history — just hides the panel.
  // Chatbot will reopen with full history when user switches to any other tab.
  useEffect(() => {
    if (activeTab === 'emergency' && isOpen) {
      closeChat();
    }
  }, [activeTab, isOpen, closeChat]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0  },
    exit:    { opacity: 0, y: -10 },
  };

  return (
    <>
      {/* ── Full-width sticky Navbar: logo left, tabs right ── */}
      <Navbar activeTab={activeTab} onChange={handleTabChange} />

      {/* ── Page content ── */}
      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-10 py-4 sm:py-8 pb-24">

        {/* ── Unified Location Bar (drives all tabs) ── */}
        <GlobalLocationBar />

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
                <WeatherTab weather={weatherData} aqi={aqiData} />
              </motion.div>
            )}
            {activeTab === 'aqi' && weatherData && aqiData && (
              <motion.div key="aqi" variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22 }}>
                <AqiTab aqi={aqiData} weather={weatherData} />
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
                <EmergencyTab />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* ── AI Chatbot: orb trigger + persistent chat panel ── */}
      {/* Chat panel stays open across tab switches; auto-hides on SOS tab without clearing history */}
      <ChatOrb />
      <ChatPanel />

      {/* ── Location Permission Modal (first visit only) ── */}
      <LocationPermissionModal />
    </>
  );
}
