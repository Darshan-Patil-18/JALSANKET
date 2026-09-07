'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { useChat } from '@/lib/ChatContext';

const TOOLTIP_PROMPTS = [
  'Ask about weather 🌊',
  'Ask about fishing zones 🐟',
  'Any hazard alerts? ⚠️',
  'Check live sea conditions 🌊',
  'Tide timings today? ⚓',
];

export default function ChatOrb() {
  const { isOpen, openChat, hasEverOpened, messages } = useChat();
  const [tooltipIndex, setTooltipIndex] = useState(0);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unreadCount = isOpen ? 0 : messages.filter((m) => m.role === 'assistant' && m.content).length;

  // ── Tooltip cycling: every 3 seconds, shown for 2.2 seconds ──────────────
  useEffect(() => {
    if (hasEverOpened || isOpen) {
      // Stop cycling forever once user has opened the chatbot
      setTooltipVisible(false);
      if (cycleRef.current) clearInterval(cycleRef.current);
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
      return;
    }

    // Start cycling after a 2-second initial delay
    const startDelay = setTimeout(() => {
      const showTip = () => {
        setTooltipVisible(true);
        tooltipTimerRef.current = setTimeout(() => {
          setTooltipVisible(false);
          setTooltipIndex((i) => (i + 1) % TOOLTIP_PROMPTS.length);
        }, 2200);
      };

      showTip(); // Show first one immediately
      cycleRef.current = setInterval(showTip, 3000);
    }, 2000);

    return () => {
      clearTimeout(startDelay);
      if (cycleRef.current) clearInterval(cycleRef.current);
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    };
  }, [hasEverOpened, isOpen]);

  return (
    <>
      {/* ── Floating Orb ─────────────────────────────────────────────────── */}
      <button
        id="jalsanket-chat-orb"
        onClick={openChat}
        aria-label="Open JalSanket AI Chat"
        className="
          fixed z-[1000] flex items-center justify-center
          /* Mobile: bottom-center */
          bottom-4 left-1/2 -translate-x-1/2
          /* Desktop: bottom-right */
          md:bottom-6 md:right-6 md:left-auto md:translate-x-0
          w-12 h-12 md:w-12 md:h-12 rounded-full
          bg-gradient-to-br from-cyan-500 to-blue-600
          shadow-[0_0_0_4px_rgba(6,182,212,0.2),0_8px_32px_rgba(6,182,212,0.4)]
          hover:shadow-[0_0_0_6px_rgba(6,182,212,0.3),0_12px_40px_rgba(6,182,212,0.5)]
          hover:scale-105 active:scale-95
          transition-all duration-300
          group
        "
        style={{
          animation: 'orbPulse 3s ease-in-out infinite',
        }}
      >
        <Sparkles className="w-5 h-5 md:w-4 md:h-4 text-white drop-shadow" />

        {/* Unread badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Outer pulse ring */}
        <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping" />
      </button>

      {/* ── Tooltip / Speech-bubble ──────────────────────────────────────── */}
      {tooltipVisible && !hasEverOpened && !isOpen && (
        <div
          className="
            fixed z-[1001] pointer-events-none
            /* Mobile: above the bottom orb */
            bottom-[72px] left-1/2 -translate-x-1/2
            /* Desktop: above bottom-right orb, shifted left */
            md:bottom-24 md:right-20 md:left-auto md:translate-x-0
          "
          style={{ animation: 'tooltipFade 2.2s ease-in-out' }}
        >
          <div className="relative bg-slate-900 border border-cyan-500/40 text-cyan-100 text-xs font-medium px-3 py-2 rounded-xl shadow-lg shadow-cyan-500/20 whitespace-nowrap">
            {TOOLTIP_PROMPTS[tooltipIndex]}
            {/* Arrow — points down on mobile, points down-right on desktop */}
            <span className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 md:hidden w-3 h-3 bg-slate-900 border-r border-b border-cyan-500/40 rotate-45" />
            <span className="hidden md:block absolute bottom-[-6px] right-4 w-3 h-3 bg-slate-900 border-r border-b border-cyan-500/40 rotate-45" />
          </div>
        </div>
      )}

      {/* ── Keyframe styles injected via a style tag ─────────────────────── */}
      <style>{`
        @keyframes orbPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(6,182,212,0.2), 0 8px 32px rgba(6,182,212,0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(6,182,212,0.1), 0 8px 40px rgba(6,182,212,0.55); }
        }
        @keyframes tooltipFade {
          0%   { opacity: 0; transform: translateY(4px) translateX(-50%); }
          12%  { opacity: 1; transform: translateY(0) translateX(-50%); }
          80%  { opacity: 1; transform: translateY(0) translateX(-50%); }
          100% { opacity: 0; transform: translateY(-4px) translateX(-50%); }
        }
        @media (min-width: 768px) {
          @keyframes tooltipFade {
            0%   { opacity: 0; transform: translateX(6px); }
            12%  { opacity: 1; transform: translateX(0); }
            80%  { opacity: 1; transform: translateX(0); }
            100% { opacity: 0; transform: translateX(6px); }
          }
        }
      `}</style>
    </>
  );
}
