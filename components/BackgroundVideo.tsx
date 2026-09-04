'use client';

import React, { useState, useEffect, useRef } from 'react';

const DAY_VIDEO   = '/background-Video/Blue_sky_white_clouds_green_grass_dynamic_loop_background_HD_vid.mp4';
const NIGHT_VIDEO = '/background-Video/Video_Background_Stock_Footage_Free_in_the_night_sky_mystical.mp4';

function getIsDay(): boolean {
  const h = new Date().getHours();
  // Day video  : 5 AM  → 7 PM  (05:00 – 19:00 IST)
  // Night video: 7 PM  → 5 AM  (19:00 – 05:00 IST)
  return h >= 5 && h < 19;
}

export default function BackgroundVideo() {
  const [isDay, setIsDay] = useState<boolean | null>(null); // null = not yet determined
  const dayRef = useRef<HTMLVideoElement>(null);
  const nightRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Initial check
    setIsDay(getIsDay());

    // Re-check every 5 minutes
    const interval = setInterval(() => {
      setIsDay(getIsDay());
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // When isDay flips, play/pause the right video
  useEffect(() => {
    if (isDay === null) return;
    if (isDay) {
      dayRef.current?.play().catch(() => {});
      nightRef.current?.pause();
    } else {
      nightRef.current?.play().catch(() => {});
      dayRef.current?.pause();
    }
  }, [isDay]);

  // Before isDay is resolved, show nothing to avoid flash
  if (isDay === null) return null;

  return (
    <div className="fixed inset-0 w-full h-full -z-20 overflow-hidden pointer-events-none select-none">
      {/* DAY video — only rendered/visible during day */}
      <video
        ref={dayRef}
        autoPlay={isDay === true}
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{ opacity: isDay ? 1 : 0 }}
      >
        <source src={DAY_VIDEO} type="video/mp4" />
      </video>

      {/* NIGHT video — only rendered/visible during night */}
      <video
        ref={nightRef}
        autoPlay={isDay === false}
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{ opacity: isDay ? 0 : 1 }}
      >
        <source src={NIGHT_VIDEO} type="video/mp4" />
      </video>

      {/*
        Overlay: very light for the day video so natural brightness shows through.
        Night video already has its own darkness — just a gentle tint, not a heavy blackout.
      */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: isDay
            ? 'rgba(0, 0, 0, 0.18)'      /* day: very light overlay */
            : 'rgba(5, 15, 35, 0.28)',   /* night: light overlay — don\'t double-darken */
        }}
      />
    </div>
  );
}
