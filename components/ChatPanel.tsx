'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, RefreshCw, Anchor, Fish, Waves, Wind, CloudRain, AlertTriangle } from 'lucide-react';
import { useChat } from '@/lib/ChatContext';
import { useLocation } from '@/lib/LocationContext';
import { useLanguage } from '@/lib/LanguageContext';
import { ChatMessage } from '@/lib/types';
import { fetchLiveMarineData, fetchLiveWeatherData, fetchLiveAqiData } from '@/lib/api';

// ─── Text parser - renders clean text with emojis and symbols preserved ───────
function renderCleanText(text: string): React.ReactNode[] {
  // Process the text line by line, preserving emojis and symbols
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    // Just render the line as-is, preserving all emojis and symbols
    return (
      <React.Fragment key={lineIdx}>
        {line}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

// ─── Quick chip prompts ───────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { icon: <Waves className="w-3 h-3" />, label: 'Wave height?' },
  { icon: <Fish className="w-3 h-3" />, label: 'Nearest fishing zone?' },
  { icon: <Wind className="w-3 h-3" />, label: 'Wind & weather?' },
  { icon: <AlertTriangle className="w-3 h-3" />, label: 'Any hazard alerts?' },
  { icon: <Anchor className="w-3 h-3" />, label: 'Tide timings?' },
  { icon: <CloudRain className="w-3 h-3" />, label: 'Rain forecast?' },
];

export default function ChatPanel() {
  const { messages, isOpen, closeChat, addMessage, updateLastAssistantMessage, isStreaming, setIsStreaming } = useChat();
  const { location } = useLocation();
  const { lang } = useLanguage();

  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Build user context to send with each request
  const buildContext = useCallback(async () => {
    // Determine the primary location to send
    const primaryCity = location.userRealLocationName || location.city;
    const primaryLat = location.userRealCoords?.lat || location.lat;
    const primaryLng = location.userRealCoords?.lng || location.lng;

    const ctx: Record<string, unknown> = {
      city: primaryCity,
      state: location.state,
      lat: primaryLat,
      lng: primaryLng,
      selectedLanguage: lang, // Send selected UI language
    };

    // Only include coastal hub if user's real location is different from coastal city
    if (location.userRealCoords && location.userRealLocationName && 
        location.userRealLocationName !== location.city) {
      ctx.coastalHub = {
        name: location.city,
        state: location.state,
        lat: location.lat,
        lng: location.lng,
      };
    }

    // Fetch weather and AQI for the user's ACTUAL location
    try {
      const weatherData = await fetchLiveWeatherData(primaryLat, primaryLng, primaryCity);
      if (weatherData) {
        const weather: Record<string, unknown> = {};
        if (weatherData.temp !== undefined) weather.temp = weatherData.temp;
        if (weatherData.conditionText) weather.conditionText = weatherData.conditionText;
        if (weatherData.windSpeed !== undefined) weather.windSpeed = weatherData.windSpeed;
        if (weatherData.humidity !== undefined) weather.humidity = weatherData.humidity;
        if (weatherData.chancesOfRain !== undefined) weather.chancesOfRain = weatherData.chancesOfRain;
        if (Object.keys(weather).length > 0) {
          ctx.weather = weather;
        }
      }
    } catch (err) {
      console.error('Error fetching weather for chatbot:', err);
    }

    // Fetch AQI for the user's ACTUAL location
    try {
      const aqiData = await fetchLiveAqiData(primaryLat, primaryLng);
      if (aqiData && aqiData.aqi !== undefined) {
        ctx.aqi = {
          value: aqiData.aqi,
          category: aqiData.category,
        };
      }
    } catch (err) {
      console.error('Error fetching AQI for chatbot:', err);
    }

    // Try to get live marine data for coastal coordinates (use coastal hub if available)
    try {
      const marineLat = location.lat;
      const marineLng = location.lng;
      const marine = await fetchLiveMarineData(marineLat, marineLng);
      
      // Only include marine data if values are actually available
      const marineData: Record<string, unknown> = {};
      if (marine.waveHeight !== undefined && marine.waveHeight !== null) {
        marineData.waveHeight = marine.waveHeight;
      }
      if (marine.swellWaveHeight !== undefined && marine.swellWaveHeight !== null) {
        marineData.swellWaveHeight = marine.swellWaveHeight;
      }
      if (marine.seaSurfaceTemp !== undefined && marine.seaSurfaceTemp !== null) {
        marineData.seaSurfaceTemp = marine.seaSurfaceTemp;
      }
      marineData.isRealTime = marine.isRealTime;
      
      if (Object.keys(marineData).length > 1) { // More than just isRealTime
        ctx.marine = marineData;
      }
    } catch {
      // marine context unavailable — ok, don't include it
    }

    return ctx;
  }, [location, lang]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setError(null);
    setInput('');

    // Add user message
    addMessage({ role: 'user', content: trimmed });

    // Add a placeholder assistant message
    addMessage({ role: 'assistant', content: '' });
    setIsStreaming(true);

    try {
      const userContext = await buildContext();

      // Build history for the API (all non-empty messages up to this point)
      const historyForApi = messages
        .filter((m) => m.role !== 'system' && m.content)
        .map((m) => ({ role: m.role, content: m.content }));
      historyForApi.push({ role: 'user', content: trimmed });

      abortRef.current = new AbortController();

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForApi, userContext }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const content: string = data.content ?? '';

      updateLastAssistantMessage(content, true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Failed to get response.';
      setError(msg);
      updateLastAssistantMessage(`Sorry, I encountered an error: ${msg}`, true);
    }
  }, [isStreaming, messages, addMessage, updateLastAssistantMessage, setIsStreaming, buildContext]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!isOpen) return null;

  const displayMessages = messages.filter((m) => m.role !== 'system');

  return (
    <>
      {/* Mobile: full-screen overlay backdrop */}
      <div
        className="fixed inset-0 z-[998] bg-black/20 backdrop-blur-[2px] md:hidden"
        onClick={closeChat}
      />

      {/* Chat Panel */}
      <div
        id="jalsanket-chat-panel"
        className="
          fixed z-[999] flex flex-col
          /* Mobile: center-screen, max 95vw/90vh */
          bottom-20 left-1/2 -translate-x-1/2 w-[92vw] max-w-[420px]
          /* Desktop: bottom-right panel, above the orb */
          md:bottom-24 md:right-6 md:left-auto md:translate-x-0
          md:w-[420px]
          max-h-[80vh] md:max-h-[600px]
          rounded-2xl overflow-hidden
          bg-[#0f1729]/98 border border-cyan-500/20
          shadow-[0_24px_64px_rgba(0,0,0,0.7)]
          ring-1 ring-cyan-500/20
        "
        style={{ backdropFilter: 'blur(20px)' }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">JalSanket AI</p>
              <p className="text-[10px] text-cyan-400 font-medium">Marine Intelligence Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={closeChat}
              id="chat-close-btn"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Close chat (history preserved)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Messages ────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth" style={{ background: 'linear-gradient(180deg, #0d1b2a 0%, #0f1729 100%)' }}>
          {displayMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-cyan-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white mb-1">JalSanket AI</p>
                <p className="text-xs text-slate-300 max-w-[260px] leading-relaxed">
                  Ask me about sea conditions, fishing zones, waves, tides, or hazards near {location.userRealLocationName || location.city}
                </p>
              </div>
              {/* Quick chips */}
              <div className="flex flex-wrap gap-1.5 justify-center">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => sendMessage(q.label)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-700/60 border border-cyan-500/25 text-[11px] text-slate-200 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-100 transition-all duration-150"
                  >
                    {q.icon}
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {displayMessages.map((msg: ChatMessage) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mt-0.5">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className={`
                  max-w-[82%] px-3 py-2.5 rounded-2xl text-[13px] leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-sm'
                    : 'bg-slate-700/80 text-slate-50 rounded-tl-sm border border-slate-600/50'}
                `}
              >
                {msg.role === 'assistant' && !msg.content ? (
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span className="text-xs">Thinking…</span>
                  </span>
                ) : (
                  <span>{renderCleanText(msg.content)}</span>
                )}
              </div>
            </div>
          ))}

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Quick chips (when there are already messages) ────────────────── */}
        {displayMessages.length > 0 && (
          <div className="px-3 pb-1 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0" style={{ background: '#0f1729' }}>
            {QUICK_PROMPTS.slice(0, 4).map((q) => (
              <button
                key={q.label}
                onClick={() => sendMessage(q.label)}
                disabled={isStreaming}
                className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full bg-slate-700/60 border border-cyan-500/25 text-[10px] text-slate-200 hover:bg-cyan-500/20 hover:border-cyan-500/40 hover:text-cyan-100 transition-all disabled:opacity-40"
              >
                {q.icon}
                {q.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Input bar ───────────────────────────────────────────────────── */}
        <div className="px-3 pb-3 pt-2 border-t border-white/10 shrink-0">
          <div className="flex items-end gap-2 bg-white/8 rounded-xl border border-white/15 px-3 py-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about waves, tides, or fishing near ${location.userRealLocationName || location.city}…`}
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none bg-transparent text-[13px] text-white placeholder:text-slate-500 focus:outline-none leading-relaxed max-h-24 disabled:opacity-50"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => sendMessage(input)}
                disabled={isStreaming || !input.trim()}
                className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Send message"
              >
                {isStreaming
                  ? <RefreshCw className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-[9px] text-slate-600 text-center mt-1.5">
            Responds in your language
          </p>
        </div>
      </div>
    </>
  );
}
